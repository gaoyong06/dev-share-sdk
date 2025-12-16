/**
 * 事件队列管理器
 */

import type { PendingEvent } from './types'
import { generateId, debugLog } from './utils'

export class EventQueue {
  private queue: PendingEvent[] = []
  private batchSize: number
  private batchInterval: number
  private timer: ReturnType<typeof setInterval> | null = null
  private flushCallback: (events: PendingEvent[]) => Promise<void>

  constructor(
    batchSize: number,
    batchInterval: number,
    flushCallback: (events: PendingEvent[]) => Promise<void>
  ) {
    this.batchSize = batchSize
    this.batchInterval = batchInterval
    this.flushCallback = flushCallback
    this.startTimer()
  }

  /**
   * 添加事件到队列
   */
  enqueue(event: Omit<PendingEvent, 'id' | 'timestamp'>): void {
    const pendingEvent: PendingEvent = {
      ...event,
      id: generateId(),
      timestamp: new Date(),
    }
    
    this.queue.push(pendingEvent)
    debugLog('Event enqueued:', pendingEvent.eventName)
    
    // 如果队列达到批量大小，立即刷新
    if (this.queue.length >= this.batchSize) {
      this.flush()
    }
  }

  /**
   * 刷新队列（发送所有待发送事件）
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return
    }
    
    const events = [...this.queue]
    this.queue = []
    
    debugLog(`Flushing ${events.length} events`)
    
    try {
      await this.flushCallback(events)
      debugLog('Events flushed successfully')
    } catch (error) {
      debugLog('Failed to flush events:', error)
      // 失败时重新加入队列（可选：限制重试次数）
      this.queue.unshift(...events)
    }
  }

  /**
   * 启动定时器
   */
  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
    
    this.timer = setInterval(() => {
      this.flush()
    }, this.batchInterval)
  }

  /**
   * 停止定时器
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * 获取队列长度
   */
  getLength(): number {
    return this.queue.length
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
  }
}

