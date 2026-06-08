/**
 * 事件队列管理器（带指数退避重试 + localStorage 持久化）
 *
 * 设计目标：
 *   1. 网络波动时，事件不丢、不重复、不雪崩
 *   2. 页面刷新/崩溃后，未发送的事件能恢复
 *   3. 服务端持续故障时，重试有上限，避免无限堆积
 *
 * 核心机制：
 *   - 指数退避：每次失败后延迟 = min(initialDelay * 2^attempt, maxDelay) + jitter
 *   - 失败超上限 → 丢入"dead letter"槽（仅记录日志，不再重试）
 *   - 队列变更落盘到 localStorage，启动时恢复
 *   - 自适应批量：连续失败时减小 batchSize（避免某个 bad event 永远卡住）
 */

import type { PendingEvent } from './types'
import { generateId, debugLog } from './utils'

/** 队列持久化在 localStorage 的 key */
const STORAGE_KEY = '__analytics_event_queue__'
/** 死信队列在 localStorage 的 key（仅观测用） */
const DLQ_STORAGE_KEY = '__analytics_event_dlq__'
/** localStorage 单值上限（JSON 字符串），超过则裁剪最旧的事件 */
const MAX_QUEUE_BYTES = 256 * 1024 // 256 KB
/** DLQ 最多保留多少条事件（仅供调试） */
const MAX_DLQ_LENGTH = 100

/** 每条事件的重试元信息 */
interface QueuedEvent extends PendingEvent {
  /** 已经失败重试的次数（首次发送 = 0） */
  _retries?: number
  /** 进入队列的时间戳（用于过期清理） */
  _enqueuedAt?: number
}

export interface EventQueueOptions {
  /** 触发批量发送的批大小 */
  batchSize: number
  /** 定时刷新间隔（毫秒） */
  batchInterval: number
  /** 单条事件最大重试次数（超过则丢 DLQ）。默认 5 */
  maxRetries?: number
  /** 指数退避初始延迟（毫秒）。默认 1000 */
  initialBackoffMs?: number
  /** 指数退避最大延迟上限（毫秒）。默认 60000 */
  maxBackoffMs?: number
  /** 队列内事件最大存活时间（毫秒），超过即丢 DLQ。默认 24 小时 */
  maxEventAgeMs?: number
  /** 是否启用 localStorage 持久化。默认 true */
  persistEnabled?: boolean
}

export class EventQueue {
  private queue: QueuedEvent[] = []
  private readonly batchSize: number
  private readonly batchInterval: number
  private readonly maxRetries: number
  private readonly initialBackoffMs: number
  private readonly maxBackoffMs: number
  private readonly maxEventAgeMs: number
  private readonly persistEnabled: boolean
  private readonly flushCallback: (events: PendingEvent[]) => Promise<void>

  private timer: ReturnType<typeof setInterval> | null = null
  /** 当前是否处于退避等待中（true 时定时器到点也跳过 flush） */
  private backoffUntil = 0
  /** 当前正在 flush，避免并发重入 */
  private flushing = false
  /** 连续失败计数（成功后清零，用于"自适应批量缩小"） */
  private consecutiveFailures = 0

  // 重载 1: 新签名 (options, flushCallback)
  constructor(options: EventQueueOptions, flushCallback: (events: PendingEvent[]) => Promise<void>)
  // 重载 2: 旧签名 (batchSize, batchInterval, flushCallback)，向后兼容
  constructor(batchSize: number, batchInterval: number, flushCallback: (events: PendingEvent[]) => Promise<void>)
  constructor(
    arg1: EventQueueOptions | number,
    arg2: number | ((events: PendingEvent[]) => Promise<void>),
    arg3?: (events: PendingEvent[]) => Promise<void>
  ) {
    let opts: EventQueueOptions
    let cb: (events: PendingEvent[]) => Promise<void>
    if (typeof arg1 === 'number') {
      // 旧签名：(batchSize, batchInterval, flushCallback)
      opts = { batchSize: arg1, batchInterval: arg2 as number }
      cb = arg3 as (events: PendingEvent[]) => Promise<void>
    } else {
      // 新签名：(options, flushCallback)
      opts = arg1
      cb = arg2 as (events: PendingEvent[]) => Promise<void>
    }

    this.batchSize = opts.batchSize
    this.batchInterval = opts.batchInterval
    this.maxRetries = opts.maxRetries ?? 5
    this.initialBackoffMs = opts.initialBackoffMs ?? 1000
    this.maxBackoffMs = opts.maxBackoffMs ?? 60_000
    this.maxEventAgeMs = opts.maxEventAgeMs ?? 24 * 60 * 60 * 1000
    this.persistEnabled = opts.persistEnabled ?? true
    this.flushCallback = cb

    this.restoreFromStorage()
    this.startTimer()
  }

  // --------------------------------------------------------------------------
  // 公开 API
  // --------------------------------------------------------------------------

  /** 添加事件到队列。允许调用方传入 timestamp（必须是 Date），否则用 enqueue 时刻 */
  enqueue(event: Omit<PendingEvent, 'id'>): void {
    const queuedEvent: QueuedEvent = {
      ...event,
      id: generateId(),
      // 保留调用方传入的 timestamp（重要：用户行为发生时间 ≠ 事件入队时间）
      timestamp: event.timestamp ?? new Date(),
      _retries: 0,
      _enqueuedAt: Date.now(),
    }

    this.queue.push(queuedEvent)
    debugLog('Event enqueued:', queuedEvent.eventName, '(queue size:', this.queue.length, ')')

    this.persist()

    // 队列达到批大小立即刷新（除非处于退避中）
    if (this.queue.length >= this.batchSize && Date.now() >= this.backoffUntil) {
      void this.flush()
    }
  }

  /** 主动刷新队列：取出当前批次发送，失败按指数退避策略重试 */
  async flush(): Promise<void> {
    if (this.flushing) {
      debugLog('Flush already in progress, skipping')
      return
    }
    if (this.queue.length === 0) {
      return
    }
    if (Date.now() < this.backoffUntil) {
      debugLog('In backoff window, skipping flush. Resumes at', new Date(this.backoffUntil).toISOString())
      return
    }

    this.flushing = true

    try {
      // 1. 先清理超时事件（避免老事件永远占着队列）
      this.purgeExpired()

      // 2. 计算本次实际批大小（连续失败时缩小）
      const effectiveBatchSize = this.computeEffectiveBatchSize()
      const batch = this.queue.splice(0, effectiveBatchSize)

      if (batch.length === 0) {
        return
      }

      this.persist()

      debugLog(`Flushing ${batch.length} events (effective batch size ${effectiveBatchSize})`)

      try {
        await this.flushCallback(batch as PendingEvent[])
        this.onFlushSuccess(batch)
      } catch (error) {
        this.onFlushFailure(batch, error)
      }
    } finally {
      this.flushing = false
    }
  }

  /** 停止定时器并尝试落盘（用于页面卸载场景） */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.persist()
  }

  /** 当前队列长度 */
  getLength(): number {
    return this.queue.length
  }

  /** 清空队列与持久化（仅测试或主动重置时使用） */
  clear(): void {
    this.queue = []
    this.consecutiveFailures = 0
    this.backoffUntil = 0
    this.persist()
  }

  // --------------------------------------------------------------------------
  // 内部：成功 / 失败回调
  // --------------------------------------------------------------------------

  private onFlushSuccess(batch: QueuedEvent[]): void {
    debugLog(`Flush OK: ${batch.length} events sent`)
    this.consecutiveFailures = 0
    this.backoffUntil = 0
    this.persist()
  }

  private onFlushFailure(batch: QueuedEvent[], error: unknown): void {
    this.consecutiveFailures += 1
    debugLog(
      `Flush FAILED (consecutive=${this.consecutiveFailures}): ${batch.length} events`,
      error
    )

    // 区分：每条事件分别累加 _retries，超限的进 DLQ，未超限的回队
    const toRequeue: QueuedEvent[] = []
    const toDeadLetter: QueuedEvent[] = []
    for (const ev of batch) {
      ev._retries = (ev._retries ?? 0) + 1
      if (ev._retries > this.maxRetries) {
        toDeadLetter.push(ev)
      } else {
        toRequeue.push(ev)
      }
    }

    // 回队列：放到队首，下一次优先重试
    if (toRequeue.length > 0) {
      this.queue.unshift(...toRequeue)
    }

    // 死信：仅落盘记录，不再重试
    if (toDeadLetter.length > 0) {
      this.appendToDeadLetterQueue(toDeadLetter)
      debugLog(
        `Dead-lettered ${toDeadLetter.length} events (retries exceeded ${this.maxRetries}):`,
        toDeadLetter.map((e) => e.eventName)
      )
    }

    // 计算下一次退避时间（基于"连续失败次数"，不是单事件 retries）
    const backoffMs = this.computeBackoff(this.consecutiveFailures)
    this.backoffUntil = Date.now() + backoffMs
    debugLog(`Backing off ${backoffMs}ms, resumes at ${new Date(this.backoffUntil).toISOString()}`)

    this.persist()
  }

  // --------------------------------------------------------------------------
  // 内部：退避计算 + 批量自适应
  // --------------------------------------------------------------------------

  /** 指数退避 + 最大 ±20% jitter（防止羊群效应） */
  private computeBackoff(attempt: number): number {
    const exp = Math.min(this.initialBackoffMs * Math.pow(2, attempt - 1), this.maxBackoffMs)
    const jitter = exp * 0.2 * (Math.random() * 2 - 1) // [-0.2*exp, +0.2*exp]
    return Math.max(0, Math.round(exp + jitter))
  }

  /**
   * 自适应批量：
   *   - 正常情况返回 batchSize
   *   - 连续失败 ≥ 2 次后，批量减半（最低 1），让"坏事件"快速暴露并被打入 DLQ
   */
  private computeEffectiveBatchSize(): number {
    if (this.consecutiveFailures < 2) return this.batchSize
    const reduced = Math.max(1, Math.floor(this.batchSize / Math.pow(2, this.consecutiveFailures - 1)))
    return reduced
  }

  // --------------------------------------------------------------------------
  // 内部：定时器
  // --------------------------------------------------------------------------

  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.timer = setInterval(() => {
      void this.flush()
    }, this.batchInterval)
  }

  // --------------------------------------------------------------------------
  // 内部：持久化（localStorage）
  // --------------------------------------------------------------------------

  /** 把当前队列同步落盘 */
  private persist(): void {
    if (!this.persistEnabled || typeof window === 'undefined') return
    try {
      // 序列化队列
      let json = JSON.stringify(this.queue)
      // 防止 localStorage 单值过大：超出则从队首裁掉最老的事件直到达标
      while (json.length > MAX_QUEUE_BYTES && this.queue.length > 0) {
        // 直接丢入 DLQ（标记 _persistTrim），避免静默丢失
        const dropped = this.queue.shift()!
        debugLog('Queue too large for storage, dropping oldest event:', dropped.eventName)
        this.appendToDeadLetterQueue([dropped])
        json = JSON.stringify(this.queue)
      }
      window.localStorage.setItem(STORAGE_KEY, json)
    } catch (error) {
      // localStorage 满 / 隐私模式禁用 → 不抛错，只记录
      debugLog('Failed to persist event queue:', error)
    }
  }

  /** 启动时从 localStorage 恢复未发送事件 */
  private restoreFromStorage(): void {
    if (!this.persistEnabled || typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const restored = JSON.parse(raw) as QueuedEvent[]
      if (Array.isArray(restored) && restored.length > 0) {
        // 序列化时 Date 变 string，恢复回 Date
        for (const ev of restored) {
          if (typeof ev.timestamp === 'string') {
            ev.timestamp = new Date(ev.timestamp)
          }
        }
        this.queue.push(...restored)
        debugLog(`Restored ${restored.length} events from localStorage`)
      }
    } catch (error) {
      debugLog('Failed to restore event queue from localStorage:', error)
      // 恢复失败时清掉脏数据，避免下次启动重复失败
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* noop */
      }
    }
  }

  /** 追加到死信队列（仅供调试 / 离线导出） */
  private appendToDeadLetterQueue(events: QueuedEvent[]): void {
    if (!this.persistEnabled || typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(DLQ_STORAGE_KEY)
      const existing: QueuedEvent[] = raw ? JSON.parse(raw) : []
      const merged = existing.concat(events)
      // 只保留最近 MAX_DLQ_LENGTH 条，防止无限增长
      const trimmed = merged.slice(-MAX_DLQ_LENGTH)
      window.localStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify(trimmed))
    } catch (error) {
      debugLog('Failed to append to DLQ:', error)
    }
  }

  /** 清理超过 maxEventAgeMs 的事件 → 丢 DLQ */
  private purgeExpired(): void {
    if (this.queue.length === 0) return
    const now = Date.now()
    const survived: QueuedEvent[] = []
    const expired: QueuedEvent[] = []
    for (const ev of this.queue) {
      const enqueuedAt = ev._enqueuedAt ?? now
      if (now - enqueuedAt > this.maxEventAgeMs) {
        expired.push(ev)
      } else {
        survived.push(ev)
      }
    }
    if (expired.length > 0) {
      this.queue = survived
      this.appendToDeadLetterQueue(expired)
      debugLog(`Purged ${expired.length} expired events (age > ${this.maxEventAgeMs}ms)`)
    }
  }
}
