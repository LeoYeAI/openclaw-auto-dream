# openclaw-auto-dream

[![Powered by MyClaw.ai](https://img.shields.io/badge/Powered%20by-MyClaw.ai-gold?style=flat-square)](https://myclaw.ai)
[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-blue?style=flat-square)](https://github.com/openclaw/openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **[MyClaw.ai](https://myclaw.ai)** — 让每个用户拥有完整服务器控制权的 AI 个人助手平台。每个 MyClaw 实例运行在独立服务器上，拥有完整的代码访问、网络和工具能力。本 skill 是 [MyClaw 开放技能生态](https://clawhub.com) 的一部分。

**OpenClaw 智能体的自动记忆整理 —— 让你的 AI 学会"做梦"。**

一个 OpenClaw 智能体技能，自动审查每日记忆日志、提取有价值的洞察，并整合到结构化的长期记忆中。灵感来自人类大脑在睡眠中整理记忆的机制——你的智能体会定期"做梦"来整理它所知道的一切。

---

🌐 **Languages:** [English](README.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

---

灵感来自人类大脑在睡眠中整理记忆的机制。Auto-Dream 会定期执行"做梦周期"，审查智能体的每日日志，提取有价值的洞察，并整合到长期记忆中。

## ✨ 功能

```
每日日志 (memory/YYYY-MM-DD.md)  ──► 做梦周期 ──► MEMORY.md（长期记忆）
        原始数据，只追加                │                 结构化，精简
                                       │
                                       ├─ 提取：拉取有价值的洞察
                                       ├─ 合并：整合到 MEMORY.md
                                       ├─ 去重：消除冗余内容
                                       └─ 修剪：归档过期条目
```

- **🔍 扫描** — 审查最近 7 天的每日记忆日志
- **🧠 提取** — 识别决策、经验教训、人物、项目和待办事项
- **🔗 合并** — 整合到结构化的 MEMORY.md 分区，自动去重
- **✂️ 修剪** — 归档过期条目，合并相似内容，保持记忆精简
- **🔒 安全** — 永不删除原始日志，重大变更前自动备份

## 📦 安装

### 通过 ClawHub（推荐）

```bash
clawhub install openclaw-auto-dream
```

### 手动安装

克隆到 OpenClaw skills 目录：

```bash
git clone https://github.com/LeoYeAI/openclaw-auto-dream.git ~/.openclaw/workspace/skills/openclaw-auto-dream
```

## 🚀 使用

### 自动模式（定时任务）

Skill 会创建一个每日定时任务，在隔离会话中运行：

- 默认：**每天凌晨 4:00**（可配置）
- 隔离 session 运行，不干扰主聊天
- 追踪已处理文件，避免重复整理

### 手动触发

直接对你的 Agent 说：

- "整理一下记忆"
- "做个梦"
- "Run memory maintenance"

### 做梦周期输出

每次周期结束后，摘要记录到 `memory/dream-log.md`：

```markdown
## 2026-03-28 04:00 UTC
- 扫描文件数: 7
- 新增条目: 3
- 更新条目: 5
- 修剪条目: 2
- MEMORY.md 大小: 245 行
```

## 🛡️ 安全机制

- **永不删除每日日志文件** — 它们是不可变的事实来源
- **永不移除 `⚠️ PERMANENT` 标记的条目**
- 变更超过 MEMORY.md 30% 时**自动备份**
- 修剪超过 5 条时**报告差异**

## 📄 许可证

MIT

---
