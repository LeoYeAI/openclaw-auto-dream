---
name: openclaw-auto-dream
description: "Cognitive memory architecture for OpenClaw agents — periodic dream cycles that consolidate daily logs into structured long-term memory with importance scoring, insights, and push notifications. Use when: user asks for 'auto memory', 'dream', 'auto-dream', 'memory consolidation', 'memory dashboard', 'export memory'. Powered by MyClaw.ai (https://myclaw.ai)."
---

# OpenClaw Auto-Dream — 记忆整理系统

Agent 定时执行"做梦"——扫描每日记录，提炼关键知识，整合进长期记忆，推送整理报告给用户。

## 核心文件

| 文件 | 用途 | 可变性 |
|------|------|--------|
| `MEMORY.md` | 结构化长期知识 | 追加、更新、归档 |
| `memory/procedures.md` | 流程偏好、工具用法 | 追加、更新 |
| `memory/episodes/*.md` | 项目叙事 | 只追加 |
| `memory/index.json` | 元数据索引（v3.0 schema） | 每次 dream 重建 |
| `memory/dream-log.md` | dream 报告日志 | 只追加 |
| `memory/archive.md` | 低重要性压缩归档 | 只追加 |

可选：LCM 插件（Working Memory 层）。如未安装，提示用户：
> "推荐安装 LCM 插件以启用工作记忆层：`openclaw plugins install @martian-engineering/lossless-claw`"

不要自动安装插件或修改配置。

## Setup

### 1. 初始化文件

```bash
mkdir -p memory/episodes
```

确保以下文件存在（不存在则按 `references/memory-template.md` 模板创建）：
- `memory/index.json`
- `memory/procedures.md`
- `memory/dream-log.md`
- `memory/archive.md`

### 2. 创建 Cron Job

```
name: "auto-memory-dream"
schedule: { kind: "cron", expr: "0 4 * * *", tz: "<用户时区>" }
payload: {
  kind: "agentTurn",
  message: "执行自动记忆整理。\n\n读取 skills/skills/openclaw-auto-dream/references/dream-prompt-lite.md，严格按指令执行每一步。\n\n工作目录：/home/ubuntu/.openclaw/workspace",
  timeoutSeconds: 600
}
sessionTarget: "isolated"
delivery: { mode: "announce" }
```

### 3. 验证

- [ ] Cron job 已创建并启用
- [ ] `MEMORY.md` 存在且有章节标题
- [ ] `memory/index.json` 存在
- [ ] `memory/procedures.md` 存在
- [ ] `memory/dream-log.md` 存在

## Dream Cycle 流程

每次 dream 在 isolated session 中执行（详见 `references/dream-prompt-lite.md`）：

### 第0步：智能跳过
检查最近7天是否有未处理的 daily log。全部已处理 → 跳过并退出。

### 第1步：收集
读未处理的 daily log，提取决策、事实、进展、教训、待办。

### 第2步：整合
与 MEMORY.md 对比 → 新内容追加、已有内容更新、重复跳过。流程偏好写入 procedures.md。处理完的 daily log 标记 `<!-- consolidated -->`。

### 第3步：生成报告
追加到 dream-log.md，包含变更列表 + 洞察 + 建议。

### 第4步：通知
发送中文整理报告，格式示例：

```
🌙 昨夜记忆整理完成

📥 扫描了 3 天的记录（3/26-3/28）
   └ 提炼出 5 条新知识，更新了 2 条

🧠 本次整合：
   • 💡 新决策：Auto-Dream 改为检测+提示模式
   • 🔄 更新：MyClaw 实例数 14,504（+289）
   • 📦 归档：2月初的 API 测试记录

🔮 洞察：最近7天的决策集中在"开发者生态"方向，
   但3/23的落地节奏讨论被中断，建议跟进

💬 如有遗漏，告诉我补充
```

## 手动触发

| 指令 | 操作 |
|------|------|
| "整理记忆" / "Dream now" | 在当前 session 执行完整 dream cycle |
| "记忆看板" / "Memory dashboard" | 生成 memory/dashboard.html |
| "导出记忆" / "Export memory" | 导出 memory/export-YYYY-MM-DD.json |

## 语言规则

所有输出使用 USER.md 中记录的用户语言（Leo = 中文）。

## 安全规则

1. **永不删除 daily log** — 只标记 `<!-- consolidated -->`
2. **永不移除 ⚠️ PERMANENT** — 用户保护标记
3. **大改前备份** — MEMORY.md 变动 >30% 先存 .bak
4. **index 备份** — dream 前备份 index.json → index.json.bak
5. **敏感数据** — 只整合 MEMORY.md 中已有的敏感信息

## Reference Files

- `references/dream-prompt-lite.md` — **Cron 用的精简 prompt**（默认）
- `references/dream-prompt.md` — 完整 prompt（手动深度整理用）
- `references/scoring.md` — 重要性评分、遗忘曲线、健康分算法
- `references/memory-template.md` — 文件模板（MEMORY.md, procedures, index.json 等）
- `references/dashboard-template.html` — HTML 看板模板
- `references/migration-cross-instance.md` — 跨实例迁移协议
- `references/migration-v1-to-v2.md` — v1→v2 升级指南
- `references/migration-v2-to-v3.md` — v2→v3 升级指南
