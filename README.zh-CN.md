<p align="center">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-D4AF37?style=for-the-badge" alt="Powered by MyClaw.ai" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/Version-0.1-8B5CF6?style=for-the-badge" alt="v0.1" />
</p>

<h1 align="center">Talewell</h1>

<p align="center">
  <strong>每个故事都有自己的井。</strong>
</p>

<p align="center">
  面向所有 agent 平台的插件化长期记忆。<br/>
  Git 支撑 · 可审计 · 可移植 · 无需向量库
</p>

<p align="center">
  <a href="#安装">安装</a> ·
  <a href="#支持的宿主">宿主</a> ·
  <a href="#协议">协议</a> ·
  <a href="#cli">CLI</a> ·
  <a href="docs/ARCHITECTURE.md">架构</a>
</p>

---

## 为什么是 Talewell

两套系统塑造了它的设计：

- 一个**估值 25 亿美金**的 AI 助理，它的记忆层不过是 git 追踪的 Markdown 加 `grep` —— 粗糙，但可查看、可审计、可回滚。
- **OpenClaw 的记忆架构** —— 在更难的一半上已被验证：来源标记（provenance）、召回驱动的晋升、确定性门控下的有界模型整合。

Talewell 保留了两者的严谨，并补上它们都没有的那一环：**一套所有 agent 平台都能说的记忆层**。

它天生就是插件化的。如今主流 agent 平台都是插件形态，Talewell 去那里与它们会合，而不是要求它们改变。

## 核心特性

- **纯 Markdown + 真实 git 历史。** 一条记忆 = 一个文件，每次写入 = 一次提交。每条事实都可 diff、可回滚，`cat` 就能读。
- **确定性召回。** 相关度 × 时间衰减 × 重要度，全部在本地计算。检索自己的记忆不需要模型调用、不需要网络、不需要 API key。
- **强制来源门控。** 只有用户明说的（`owner`）或你从其中推导出的（`agent`）内容才可入库。网页、工具输出、他人言论（`untrusted`）被结构性拒绝 —— 这是安全属性，不是可调参数。
- **更正会真正生效。** 取代一条记录后，旧值会从召回和 prompt 注入中退场，而 git 保留完整历史。
- **纯文件里的链接图谱。** 记录之间用 `[[id]]` 互相引用；稳定 ID 加别名，让整个语料既可导航又可 grep。
- **内置 prompt 注入。** 在 OpenClaw 上，伴生插件会在每一轮对话前注入一份紧凑索引，让 agent 开口时就已经知道它知道什么。

## 安装

### 作为 MCP server —— 任何支持 MCP 的平台都能用

```json
{
  "mcpServers": {
    "talewell": {
      "command": "node",
      "args": ["/path/to/talewell/bin/talewell.mjs", "serve-mcp"],
      "env": { "TALEWELL_REPO": "/path/to/talewell-memory" }
    }
  }
}
```

暴露六个工具：`memory_recall`、`memory_index`、`memory_get`、`memory_remember`、`memory_forget`、`memory_graph`。

### 作为 OpenClaw 插件 —— 无感记忆

```bash
openclaw plugins install --link /path/to/talewell/adapters/openclaw/plugin --force --accept-capabilities
openclaw plugins enable talewell --accept-capabilities
```

然后授予对话 hook 权限，索引才能被注入：

```json5
{
  plugins: {
    entries: {
      talewell: {
        enabled: true,
        hooks: { allowConversationAccess: true },
        config: { repoPath: "/path/to/talewell-memory", inject: "index" },
      },
    },
  },
}
```

重启网关。此后 agent 每轮 prompt 都会带上记忆索引。

### 作为文件约定 —— 通用兜底

```bash
talewell install --host codex --dir .        # 往 AGENTS.md 写入受管块
talewell install --host claude-code --dir .  # CLAUDE.md + .mcp.json
```

任何会读取项目指令文件的宿主，无需插件、无需协议支持即可使用。

## 支持的宿主

| 宿主 | 接入方式 | 指令文件 | 已核实 |
| --- | --- | --- | --- |
| OpenClaw | 原生插件, mcp, 文件, cli | `AGENTS.md` | 是 |
| Claude Code | mcp, 文件, cli | `CLAUDE.md` | 是 |
| Codex | mcp, 文件, cli | `AGENTS.md` | 是 |
| OpenCode | mcp, 文件, cli | `AGENTS.md` | 是 |
| Pi Coding Agent | mcp, 文件, cli | `AGENTS.md` | 是 |
| Hermes | 文件, cli | `AGENTS.md` | 是 |
| Grok bot | 文件, cli | `AGENTS.md` | **否** |
| Muse AI | 文件, cli | `AGENTS.md` | **否** |
| DeepSeek harness | 文件, cli | `AGENTS.md` | **否** |

运行 `talewell hosts` 查看带证据指针的宿主注册表。未核实宿主走安全默认，不猜测配置路径。

## CLI

```bash
talewell init ./talewell-repo                                     # 创建记忆仓

talewell remember --text "Leo 不吃辣" --alias "饮食,辣,diet" --importance 7
talewell recall "订餐厅要注意什么"                                  # 确定性召回，不调模型
talewell get <id>
talewell correct <id> --text "更新后的值"                          # 取代，保留历史
talewell forget <id> --reason "user request"                      # 删除，保留 git 历史
talewell graph <id> --depth 2                                     # 跟随 [[链接]]
talewell index --markdown                                         # 供注入的紧凑目录
talewell health
talewell log --limit 20
talewell diff <id>
talewell rollback <commit> --yes
talewell bundle ./transfer.bundle                                 # 跨宿主迁移
talewell consolidate candidates.json                              # 批量，带门控
talewell serve-mcp

talewell hosts
talewell install --host claude-code --dir .
talewell uninstall --host claude-code --dir .
```

所有命令都支持 `--repo <dir>`（或 `$TALEWELL_REPO`）与 `--json`。

## 协议

**AMP —— Agent Memory Protocol** —— 是 Talewell 实现的可移植契约。产品名与协议名刻意分开：谈格式时讲 AMP，谈实现时讲 Talewell。

一个记忆仓就是一个目录，内含 `amp.json` 清单和 `memory/` 目录树：

```
repo/
  amp.json                    清单：schema 版本 + 策略
  memory/
    facts/          f-*.md
    entities/<type>/ e-*.md
    episodes/       ep-*.md
    procedures/     pr-*.md
    index.json      生成的目录（可重建）
```

一条记录一个文件：

```markdown
---
id: f-m8k2x9a7q3
kind: fact
aliases: [吃饭, dining, 餐厅, 口味]
text: Leo 不吃辣
origin: owner
importance: 7
observedAt: 2026-09-15
links: [e-3n8k2, f-9x1m4]
---

可选的长文本。
```

### 不可谈判的三条

- **内核不含向量检索。** 基线在离线、无 API key 的情况下就能跑。向量是可选层。
- **没有静默写入。** `untrusted` 与 `system` 来源被结构性拒绝。
- **不在聊天时做知识管理。** 写入走整合流程，不走回复路径。

## 架构

```
L1 内核    TalewellStore —— git 支撑的 Markdown 仓（零 npm 依赖）
L2 协议    remember · recall · search · forget · consolidate · graph
L3 适配层  OpenClaw · MCP · 文件约定 · ACP
```

完整设计、落盘契约、以及"哪个设计来自哪里"的决策表，见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 测试

```bash
node --test "tests/*.test.mjs"
```

28 项测试：序列化往返、每次写入即提交、来源门控、确定性中文召回、取代、git 支撑的删除、图遍历、回滚、门控整合、宿主文件适配。

## 沿革

本仓库前身是 **OpenClaw Auto-Dream** —— 一个面向 OpenClaw 的提示词式记忆 skill。原 skill 及其 references 完整保留在 [`legacy-skill/`](legacy-skill/)，在 OpenClaw 上仍可安装使用。Talewell 是它的继承者：同一个想法，重建为可移植的插件框架。

## 关于 MyClaw.ai

**[MyClaw.ai](https://myclaw.ai)** —— 运行 OpenClaw 的最佳方式。一台 24/7 专属服务器，拥有完整代码控制权、cron 任务、持久记忆与一键 skill 安装。

## 许可证

MIT
