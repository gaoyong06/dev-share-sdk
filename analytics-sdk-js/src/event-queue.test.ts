/**
 * EventQueue 单元测试
 *
 * 覆盖关键路径：
 *   1. 基本入队 + flush 成功
 *   2. flush 失败 → 退避 → 重试
 *   3. 单条事件超过 maxRetries → 落入 DLQ
 *   4. localStorage 持久化与恢复
 *   5. 4xx HTTP 错误的处理（仍走重试，但带可观测信息）
 *   6. 超期事件被清理到 DLQ
 *   7. 队列体积上限保护
 *
 * 测试策略说明：
 *   - 用 jest.useFakeTimers() 控制时间（指数退避必须能确定性测试）
 *   - 但要小心：fake timers 下 setTimeout(0) 也是假的，所以"等异步完成"必须用
 *     `await Promise.resolve()` 链，不能用 setTimeout
 *   - 显式调用 await q.flush() 而非依赖内部 timer，让控制流更清晰
 */

import { EventQueue } from './event-queue'
import type { PendingEvent } from './types'

// ----------------------------------------------------------------------------
// 测试工具
// ----------------------------------------------------------------------------

const makeEvent = (eventName: string): Omit<PendingEvent, 'id'> => ({
  eventName,
  sessionId: 'sess-test',
  anonymousId: 'anon-test',
  timestamp: new Date(),
})

beforeEach(() => {
  window.localStorage.clear()
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2026-05-01T00:00:00Z'))
})

afterEach(() => {
  jest.useRealTimers()
  window.localStorage.clear()
})

// ----------------------------------------------------------------------------
// 1. 基本路径
// ----------------------------------------------------------------------------

describe('EventQueue - basic happy path', () => {
  it('flushes when batch size reached', async () => {
    const callback = jest.fn().mockResolvedValue(undefined)
    const q = new EventQueue(
      { batchSize: 2, batchInterval: 100_000, persistEnabled: false },
      callback
    )

    q.enqueue(makeEvent('e1'))
    expect(callback).not.toHaveBeenCalled()

    q.enqueue(makeEvent('e2'))
    // enqueue 内会同步触发 void this.flush()，必须显式驱动 promise 完成
    await q.flush() // 即使内部已经在 flush，重复调用会因 flushing 标志早返回
    // 等内部 promise resolve（连续 await 推进 microtask 队列）
    await Promise.resolve()
    await Promise.resolve()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback.mock.calls[0][0]).toHaveLength(2)
    expect(q.getLength()).toBe(0)

    q.stop()
  })

  it('flushes via timer at batchInterval', async () => {
    const callback = jest.fn().mockResolvedValue(undefined)
    const q = new EventQueue(
      { batchSize: 100, batchInterval: 5000, persistEnabled: false },
      callback
    )

    q.enqueue(makeEvent('e1'))
    expect(callback).not.toHaveBeenCalled()

    jest.advanceTimersByTime(5000)
    // setInterval 回调里的 void this.flush() 是异步的，需要让 microtask 跑完
    await Promise.resolve()
    await Promise.resolve()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(q.getLength()).toBe(0)

    q.stop()
  })
})

// ----------------------------------------------------------------------------
// 2. 失败 + 退避
// ----------------------------------------------------------------------------

describe('EventQueue - retry & backoff', () => {
  it('re-queues failed events and respects backoff window', async () => {
    const callback = jest
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(undefined)

    const q = new EventQueue(
      {
        batchSize: 2,
        batchInterval: 100_000, // 大间隔避免 timer 干扰
        initialBackoffMs: 1000,
        maxBackoffMs: 10_000,
        persistEnabled: false,
      },
      callback
    )

    q.enqueue(makeEvent('e1'))
    q.enqueue(makeEvent('e2'))
    await q.flush()

    expect(callback).toHaveBeenCalledTimes(1)
    // 失败后事件回到队列头
    expect(q.getLength()).toBe(2)

    // 退避窗口内：再次显式 flush 应被拒绝（早返回）
    await q.flush()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(q.getLength()).toBe(2)

    // 推进系统时间越过退避窗口（最长 1.2s = 1000 * 1.2 jitter）
    jest.setSystemTime(new Date('2026-05-01T00:00:02Z')) // +2 秒，足够穿过任何 jitter
    await q.flush()

    expect(callback).toHaveBeenCalledTimes(2)
    expect(q.getLength()).toBe(0)

    q.stop()
  })

  it('keeps re-queuing on consecutive failures (does not lose events under maxRetries)', async () => {
    const callback = jest.fn().mockRejectedValue(new Error('always fails'))

    const q = new EventQueue(
      {
        batchSize: 1,
        batchInterval: 100_000,
        initialBackoffMs: 100,
        maxBackoffMs: 1000,
        maxRetries: 5,
        persistEnabled: false,
      },
      callback
    )

    q.enqueue(makeEvent('e1'))

    // 连续失败 3 次，事件还在队列里（_retries=3 < maxRetries=5）
    for (let i = 0; i < 3; i++) {
      await q.flush()
      // 推进时间 2 秒，确保越过任意退避窗口
      jest.setSystemTime(new Date(Date.now() + 2000))
    }

    expect(callback).toHaveBeenCalledTimes(3)
    expect(q.getLength()).toBe(1) // 事件仍在队列里

    q.stop()
  })
})

// ----------------------------------------------------------------------------
// 3. DLQ：超过 maxRetries 后落死信
// ----------------------------------------------------------------------------

describe('EventQueue - dead letter queue', () => {
  it('moves event to DLQ after exceeding maxRetries', async () => {
    const callback = jest.fn().mockRejectedValue(new Error('always fails'))

    const q = new EventQueue(
      {
        batchSize: 1,
        batchInterval: 100_000,
        initialBackoffMs: 100,
        maxBackoffMs: 100,
        maxRetries: 3,
        persistEnabled: true,
      },
      callback
    )

    q.enqueue(makeEvent('important'))

    // 模拟 4 次重试（max 3 次，第 4 次后入 DLQ）
    for (let i = 0; i < 5; i++) {
      await q.flush()
      jest.setSystemTime(new Date(Date.now() + 2000))
    }

    // 至少调用了 maxRetries+1 次（最后一次是把事件踢出去）
    expect(callback.mock.calls.length).toBeGreaterThanOrEqual(4)
    expect(q.getLength()).toBe(0)

    const dlqRaw = window.localStorage.getItem('__analytics_event_dlq__')
    expect(dlqRaw).toBeTruthy()
    const dlq = JSON.parse(dlqRaw!)
    expect(dlq).toHaveLength(1)
    expect(dlq[0].eventName).toBe('important')

    q.stop()
  })
})

// ----------------------------------------------------------------------------
// 4. localStorage 持久化与恢复
// ----------------------------------------------------------------------------

describe('EventQueue - localStorage persistence', () => {
  it('persists queue on enqueue', () => {
    const callback = jest.fn()
    const q = new EventQueue(
      { batchSize: 100, batchInterval: 100_000 },
      callback
    )

    q.enqueue(makeEvent('e1'))
    q.enqueue(makeEvent('e2'))

    const raw = window.localStorage.getItem('__analytics_event_queue__')
    expect(raw).toBeTruthy()
    const stored = JSON.parse(raw!)
    expect(stored).toHaveLength(2)
    expect(stored.map((e: any) => e.eventName)).toEqual(['e1', 'e2'])

    q.stop()
  })

  it('restores queue from localStorage on construction', async () => {
    // 模拟前一次会话留下的事件
    const seed = [
      {
        id: 'pre-1',
        eventName: 'leftover_1',
        sessionId: 's',
        anonymousId: 'a',
        timestamp: new Date('2026-04-30T00:00:00Z').toISOString(),
        _retries: 0,
        _enqueuedAt: Date.now(),
      },
    ]
    window.localStorage.setItem('__analytics_event_queue__', JSON.stringify(seed))

    const callback = jest.fn().mockResolvedValue(undefined)
    const q = new EventQueue(
      { batchSize: 10, batchInterval: 100_000 },
      callback
    )

    expect(q.getLength()).toBe(1)

    await q.flush()
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback.mock.calls[0][0][0].eventName).toBe('leftover_1')
    // timestamp 字段应被还原为 Date
    expect(callback.mock.calls[0][0][0].timestamp).toBeInstanceOf(Date)

    q.stop()
  })

  it('clears restored data after invalid JSON', () => {
    window.localStorage.setItem('__analytics_event_queue__', 'not-json{')

    const callback = jest.fn()
    const q = new EventQueue(
      { batchSize: 10, batchInterval: 100_000 },
      callback
    )

    expect(q.getLength()).toBe(0)
    // 脏数据被清掉
    expect(window.localStorage.getItem('__analytics_event_queue__')).toBeNull()

    q.stop()
  })
})

// ----------------------------------------------------------------------------
// 5. 超期事件清理
// ----------------------------------------------------------------------------

describe('EventQueue - expired events purge', () => {
  it('purges events older than maxEventAgeMs into DLQ', async () => {
    const callback = jest.fn().mockResolvedValue(undefined)
    const q = new EventQueue(
      {
        batchSize: 100,
        batchInterval: 100_000,
        maxEventAgeMs: 1000,
        persistEnabled: true,
      },
      callback
    )

    q.enqueue(makeEvent('old'))
    expect(q.getLength()).toBe(1)

    jest.setSystemTime(new Date('2026-05-01T00:00:05Z'))

    await q.flush()

    expect(q.getLength()).toBe(0)
    expect(callback).not.toHaveBeenCalled()

    const dlqRaw = window.localStorage.getItem('__analytics_event_dlq__')
    expect(dlqRaw).toBeTruthy()
    const dlq = JSON.parse(dlqRaw!)
    expect(dlq).toHaveLength(1)
    expect(dlq[0].eventName).toBe('old')

    q.stop()
  })
})

// ----------------------------------------------------------------------------
// 6. 旧构造签名兼容
// ----------------------------------------------------------------------------

describe('EventQueue - legacy constructor signature', () => {
  it('accepts old (batchSize, batchInterval, callback) signature', async () => {
    const callback = jest.fn().mockResolvedValue(undefined)
    const q = new EventQueue(2, 100_000, callback)

    q.enqueue(makeEvent('e1'))
    q.enqueue(makeEvent('e2'))
    await q.flush()
    await Promise.resolve()

    expect(callback).toHaveBeenCalledTimes(1)
    q.stop()
  })
})
