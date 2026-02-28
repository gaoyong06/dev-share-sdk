# 统计数据上报逻辑说明

本文档说明 analytics-sdk-js 与 analytics-service 的统计数据上报逻辑，重点说明 **duration**、**end_time** 等会话指标的含义与误差来源，以及**行业常见做法**与**推荐改进方案**。

**当前实现**：会话的 duration/end_time 完全由服务端按「请求到达时间」维护，单页仅一次事件时 duration 恒为 0。逻辑自洽，但**并非** GA4/Amplitude 等对「单页会话时长」的常见做法；业内通常会在**离开页面时再发一条事件**，并在**服务端**用客户端事件时间计算时长。详见第 5 节。

---

## 1. 职责划分

| 指标/字段 | 负责方 | 说明 |
|-----------|--------|------|
| `duration` | **服务端** | 由 analytics-service 在收到事件时计算并写入 Session 表 |
| `end_time` | **服务端** | 由 analytics-service 在收到事件时用 `time.Now()` 更新 |
| `start_time` | **服务端** | 会话首次创建时设为 `time.Now()` |
| `timestamp`（事件时间） | **SDK** | 每条事件上报时携带，格式为 ISO 字符串（`date.toISOString()`） |

SDK **不上报** `duration` 或 `end_time`，只上报事件本身（含 `eventName`、`sessionId`、`pageUrl`、`timestamp` 等）。会话的起止时间与时长完全由服务端根据**收到请求的时间**维护。

---

## 2. 单页访问时的行为

### 2.1 现象

- 用户只访问一个页面且未再触发其他事件时，通常只会产生**一条** `page_view` 事件。
- 该事件经队列在**批量间隔（默认 5 秒）**或 **beforeunload 时 flush** 发送。
- 服务端对该 session 只会有**一次**「创建」或「更新」：创建时 `StartTime = EndTime = time.Now()`，因此 **duration = 0**（秒）。

### 2.2 是否正确？

在当前设计下，这是**符合预期的**：

- 服务端从未收到该 session 的「第二次活动」，因此无法知道用户何时离开页面。
- 因此把 `end_time` 设为「最后一次收到请求的时间」、`duration` 设为 0，表示「仅有一次已知活动」，在语义上是自洽的。

若希望「单页停留时长」有数值，需要在产品上接受「单页会话 = 无法精确测量」或做增强设计（见下文「可选改进」）。

---

## 3. 时间与误差来源

### 3.1 服务端时间（start_time / end_time / duration）

- **来源**：`analytics-service` 在每次处理请求时使用 `time.Now()` 作为「当前时间」。
- **Create**：首次为该 session 创建记录时，`StartTime = now`，`EndTime = &now`，`Duration = 0`。
- **Update**：同一 session 再次收到事件时，`EndTime = &now`，`Duration = CalculateSessionDuration(StartTime, now)`（单位：秒）。

因此：

- **start_time / end_time**：表示的是「服务端认为的」该 session 首次/末次**请求到达**时间，不是用户端行为发生的精确时刻。
- **duration**：表示「从首次请求到末次请求」在服务端经过的秒数，不是「用户在页面上停留的精确时长」。

### 3.2 客户端 timestamp（事件时间）

- **产生时机**：在 SDK 的 `event-queue.ts` 中，事件**入队时**被赋予 `timestamp: new Date()`，发送时再格式化为 ISO 字符串。
- **含义**：更接近「事件入队时间」，而非「页面加载完成」或「用户操作发生」的精确时刻；若存在异步或队列堆积，会有一点点延迟。
- **使用情况**：当前服务端会话的 **StartTime/EndTime/Duration 并未使用事件的 timestamp**，仅用服务端 `time.Now()`，因此会话时长与客户端时钟误差无关；事件表若存了该字段，可用于事件级分析，与会话时长统计是两套时间体系。

### 3.3 批量与发送延迟

- 默认 `batchInterval = 5s`、`batchSize = 10`，事件可能在入队后**最多约 5 秒**才发送（或凑满 10 条立即发）。
- 关闭/刷新时 `beforeunload` 会触发 `flush()`，此时发送的是队列里已有事件的「入队时 timestamp」，不是「离开页面」的精确时刻。

因此：

- **单页**：我们只知道「某时刻收到了一条该 session 的请求」，无法知道用户在该页停留了多久，**单页 duration 恒为 0** 是当前设计的必然结果。
- **多页/多事件**：duration 表示「首、末两次**请求**到达服务端的时间差」，会受批量、网络、服务端处理延迟影响，一般会略大于或接近「用户真实首末行为时间差」，误差量级约为 **0～batchInterval（如 5s）加上网络 RTT**。

### 3.4 误差量级小结

| 场景 | duration | end_time | 主要误差来源 |
|------|----------|----------|----------------|
| 单页、仅一次事件 | 0（设计如此） | = start_time | 无法得知离开时间，无「真实时长」可对比 |
| 多页/多事件 | 首末请求的服务端时间差（秒） | 末次请求的服务端时间 | 批量延迟（约 0～5s）、网络延迟、服务端处理时间；客户端 timestamp 未参与会话计算 |

---

## 4. 相关代码位置（便于排查与扩展）

- **SDK**
  - 事件入队与 timestamp：`src/event-queue.ts`（`enqueue` 内 `timestamp: new Date()`）
  - 发送时格式化：`src/analytics.ts`（`formatTimestamp(event.timestamp)`）
  - 时间格式：`src/utils.ts`（`formatTimestamp` → `date.toISOString()`）
- **服务端**
  - 会话创建/更新与 duration/end_time：`internal/data/session_repo.go`（`GetOrCreate` 中 `StartTime`/`EndTime`/`Duration`）
  - 时长计算：`internal/pkg/utils/session.go`（`CalculateSessionDuration`，单位秒）

---

## 5. 行业实践与方案建议

### 5.1 业内常见做法（简要）

| 平台 / 做法 | 单页时长 | 会话结束 | 时长计算位置 |
|-------------|----------|----------|--------------|
| **GA4** | 通过「用户参与」事件弥补：在**关闭标签页 / 离开页面 / 失去焦点**时发送 `user_engagement`，把参与时间带上去，从而有「最后一刻」的时间点。单页不再恒为 0。 | 在离开/关闭时发事件（依赖浏览器，并非 100% 可靠）。 | 服务端用事件时间计算。 |
| **Amplitude** | 会话时长 = **max(客户端事件时间) − min(客户端事件时间)**，即完全基于**客户端事件时间**在服务端算。只要有「最后一个事件」（例如离开时发一条），单页就有时长。 | 依赖最后一条事件的时间；若 SDK 在 unload 时再发一条，则最后时间更接近真实离开时刻。 | **服务端**用客户端上报的 event time 计算，不在客户端算 duration。 |
| **发送时机** | — | 业界推荐用 **`sendBeacon()`**（或 fetch + `keepalive: true`）在 **pagehide / beforeunload** 时发送，减少被浏览器取消的概率。 | — |

结论：  
- **单页有时长**：要么在「离开时再发一条事件」（GA4 思路），要么用客户端时间在服务端做 max − min（Amplitude 思路），或两者结合。  
- **时长只在一处算**：Amplitude 明确在服务端用 client_event_time 计算，避免客户端、服务端两套 duration 不一致。  
- **离开时上报**：用 **pagehide + sendBeacon** 是常见、可靠的做法。

### 5.2 对两个想法的评估与建议

#### 想法 1：SDK 定时上报（例如每 1 秒）

- **效果**：单页也会持续有事件到达，服务端「末次请求时间」会不断更新，duration 不再恒为 0，误差被限制在约 1 个周期（如 1 秒）内。
- **优点**：实现简单；不依赖 beforeunload/pagehide 是否触发；能覆盖「用户长期不关标签页」的场景。
- **代价**：请求或事件量明显增加（例如每 tab 每秒 1 次）；若用批量，则队列里会多很多「心跳」事件，存储与带宽都增加。
- **与行业对比**：GA4/Amplitude 等更依赖「离开时发一条」而非高频心跳来做会话时长；心跳更多用于「存活/超时」类能力。
- **建议**：  
  - 不推荐用「每 1 秒」作为**默认**的会话时长方案，优先用「离开时发 session_end」更省资源且符合主流。  
  - 若产品有「需要知道用户是否仍在页面上」的需求（如会话超时、在线状态），可做**可选**的、较低频的心跳（例如每 30 秒一次），且与「会话时长」统计解耦：时长仍以「首末事件时间」为准，心跳只用于更新 last_active 或超时判断。

#### 想法 2：页面卸载时发「会话结束」事件，duration 只在服务端算

- **与 Amplitude 一致**：Amplitude 的 session length = max(client_event_time) − min(client_event_time)，全部在服务端算，不要求客户端传 duration。
- **建议实现**：  
  - **SDK**：在 **pagehide**（优先）或 **beforeunload** 时，用 **sendBeacon**（或 fetch keepalive）再发一条「会话结束」事件（例如 `session_end` 或 `page_hide`），只带 **timestamp**（和 session_id、app_id 等必要字段），**不**在客户端计算或上传 duration。  
  - **服务端**：  
    - 要么在写入/更新 Session 时，用「该 session 下所有事件的 **min(timestamp)** 与 **max(timestamp)**」重算 duration（与 Amplitude 一致）；  
    - 要么在收到每条事件（含 session_end）时，用该事件的 **客户端 timestamp** 更新 Session 的 end_time，再用 start_time 与 end_time（均来自客户端时间或首/末事件时间）计算 duration。  
  - 这样 **duration 只在服务端计算**，避免双端逻辑不一致；单页也会因为「最后一条 session_end」而拥有「最后时间点」，从而得到非 0 的时长。

### 5.3 推荐方案小结

- **优先做、且与行业对齐的做法**：  
  1. **SDK**：在页面卸载时（pagehide / beforeunload）用 **sendBeacon** 发一条「会话结束」事件（仅带 timestamp 等，不带 duration）。  
  2. **服务端**：用同一 session 下事件的**客户端 timestamp** 的 **min / max**（或首事件时间与末事件时间）**在服务端**计算 duration 和 end_time，不依赖客户端上传的 duration。  

- **可选增强**：  
  - 若需要「用户仍在该页但长期不关 tab」的感知（如超时、在线状态），可增加**低频心跳**（如 30 秒一次），与「会话时长」统计分离：时长仍由首末事件时间决定，心跳只用于活跃度/超时。  

这样既做到「别人做到的事」（单页有时长、离开时上报、服务端统一算 duration），又避免多端重复算 duration 的混乱，并控制请求与存储成本。

---

## 6. 已实现的方案（与第 5 节推荐一致）

当前实现已按推荐方案落地：

1. **SDK**  
   - 在 **pagehide** 与 **beforeunload** 时调用 **sendBeacon** 发送一条 `session_end` 事件（仅带 timestamp 等，**不带** duration）。  
   - 实现见 `src/analytics.ts`：`sendSessionEndBeacon()`、事件名常量 `EVENT_SESSION_END`（`src/types.ts`）。

2. **服务端（analytics-service）**  
   - 会话的 **StartTime / EndTime** 使用**客户端事件时间**（event.Timestamp）：创建时用首事件时间，更新时用当前批次内该 session **timestamp 最大**的一条事件时间。  
   - **Duration** 在服务端计算：`CalculateSessionDuration(StartTime, EndTime)`，与 Amplitude 的 max(client_event_time) − min(client_event_time) 一致。  
   - 批量上报时，每个 session 只取**客户端 timestamp 最大**的一条事件用于更新会话（见 `event_usecase.BatchTrackEvents`）。  
   - 会话过期判断改为基于 **UpdatedAt**（服务端最后更新时间），不再用 StartTime。

---

**结论**：  
- **duration**、**end_time** 由服务端按「请求到达时间」维护，逻辑一致、实现正确。  
- 单页仅一次事件时 **duration=0、end_time=start_time** 符合当前设计。  
- 误差主要来自：单页无法得知离开时间；多页/多事件时存在批量与网络延迟（约 0～5s 量级），且服务端未使用客户端 timestamp 参与会话时长计算。
