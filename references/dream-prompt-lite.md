# Auto-Dream Cycle — Lite Prompt (v3.1)

执行自动记忆整理。所有输出使用 USER.md 中记录的用户语言。

## 0. 快速检查（智能跳过）

```
1. ls memory/????-??-??.md 找最近7天的 daily log
2. 检查哪些文件末尾没有 <!-- consolidated --> 标记
3. 如果全部已处理或无文件 → 回复"无新内容，跳过" → 结束
```

## 1. Collect

读取所有未处理的 daily log，提取：决策、人物、事实、项目进展、教训、流程偏好、待办。跳过闲聊和已存在于 MEMORY.md 的内容。优先处理带 `⚠️` `🔥` `📌` `<!-- important -->` 标记的条目。

## 2. Consolidate

读取 MEMORY.md、memory/procedures.md、memory/index.json（不存在则按下方模板创建）。

路由规则：
- 流程/偏好/工具用法 → procedures.md
- 多事件项目叙事 → memory/episodes/<name>.md
- 其他（决策/事实/人物/里程碑/教训/待办） → MEMORY.md 对应章节

写入前做语义去重（比较含义非文字）。每条新记录分配 `mem_NNN` ID，写为 `<!-- mem_NNN -->` 注释。关联条目用 `related: [mem_xxx]` 记录。

MEMORY.md 变动超 30% → 先备份为 MEMORY.md.bak。写完后在已处理的 daily log 末尾追加 `<!-- consolidated -->`。

## 3. Evaluate

### 评分（每条记录）
```
⚠️ PERMANENT → importance = 1.0
其他：raw = base(🔥=2.0, 默认1.0) × max(0.1, 1.0-天数/180) × max(1.0, log2(引用次数+1))
importance = clamp(raw/8.0, 0, 1)
```

### 归档条件（全部满足才归档）
- 90天未引用 + importance<0.3 + 非 ⚠️/📌 + 非 episode
- 压缩为一行存入 memory/archive.md，原文删除，index 标记 archived=true

### 健康分（0-100）
```
health = (freshness×0.25 + coverage×0.25 + coherence×0.2 + efficiency×0.15 + reachability×0.15) × 100
freshness = 30天内引用条目数/总条目数
coverage = 14天内更新的MEMORY.md章节数/总章节数
coherence = 有关联的条目数/总条目数
efficiency = max(0, 1-MEMORY.md行数/500)
reachability = Σ(组件大小²)/(总条目数²)  [连通分量]
```

### 生成 1-3 条洞察（跨记忆的模式、时间趋势、知识空白、健康趋势）

### 更新 index.json（条目、分数、stats、healthHistory追加最新分数，保留最近90条）

### 追加 dream report 到 memory/dream-log.md：
```
## 🌀 Dream Report — YYYY-MM-DD HH:MM UTC
### 📊 统计  扫描N文件 | 新增N | 更新N | 归档N
### 🧠 健康: XX/100  各指标百分比
### 🔮 洞察  1-3条
### 📝 变更  [新增/更新/归档] 简述
### 💡 建议  基于健康分的可行动建议
```

## 4. 通知

读 index.json 的 config.notificationLevel（默认 summary）：
- **silent**：不推送
- **summary**：回复 3-5 行摘要（健康分+计数+顶部洞察+建议）
- **full**：回复完整 dream report

直接回复即可，cron delivery 会自动推送到用户频道。

## 安全规则
- 永不删除 daily log 原文
- 永不移除 ⚠️ PERMANENT 条目
- 永不删除 episode 文件
- 备份 index.json → index.json.bak（每次 dream 前）

## 首次初始化模板

如果 memory/index.json 不存在：
```json
{"version":"3.0","lastDream":null,"config":{"notificationLevel":"summary","instanceName":"default"},"entries":[],"stats":{"totalEntries":0,"avgImportance":0,"lastPruned":null,"healthScore":0,"healthMetrics":{"freshness":0,"coverage":0,"coherence":0,"efficiency":0,"reachability":0},"insights":[],"healthHistory":[]}}
```

如果 memory/procedures.md 不存在：
```markdown
# Procedures — How I Do Things
_Last updated: YYYY-MM-DD_
## 🎨 沟通偏好
## 🔧 工具流程
## 📝 格式偏好
## ⚡ 快捷模式
```
