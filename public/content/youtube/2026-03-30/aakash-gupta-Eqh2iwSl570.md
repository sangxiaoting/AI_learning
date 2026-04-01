# Claude Code Secrets for PMs: The Operating System, Skills, and Data Viz

- Author: `Aakash Gupta`
- Date: `2026-03-30`
- Duration: `1:06:48`
- Link: https://www.youtube.com/watch?v=Eqh2iwSl570
- Tags: AI PM, Claude Code, Workflow Optimization, Skills, Context Management, Sub Agents

## TL;DR

Carl Votty展示如何将Claude Code打造成一个完整的操作系统，通过自定义Skills、自动触发机制、Jupyter笔记本数据分析和结构化知识管理，将AI工具能力提升到专业产品经理可依赖的生产力水平。

## Takeaways

- Claude Code仍是最强工具，Co-work和OpenClaw都建立在Claude Code之上，功能受限于封装层
- 使用sub agents代替主会话执行研究任务可将上下文消耗从25%降至16.5%，显著减少context compaction等待时间
- Skills本质上是精心设计的prompt，可补足Claude Code的弱点（如前端设计、网络搜索、幻灯片制作），无需赋予新能力
- 避免使用MCPs而改用CLIs，因为MCPs会消耗大量context token，CLIs直接安装在机器上更高效
- Jupyter notebook可在Claude Code内进行可追溯的数据分析，让PM能信任AI生成的统计数据和可视化结果

## Quote

> When you understand how Claude works, it makes it feel less like you're just prompting Claude and watching it and more like you understand how it works and you're working together.

## Detailed Breakdown

### Claude Code仍是最强工具

- **核心观点归纳**: Co-work和OpenClaw都建立在Claude Code之上，功能受限，Claude Code提供最强大的原始能力
- **AI PM 视角/启发**: 对于需要掌握主动权的PM，Claude Code仍是首选，OpenClaw适合监控和自主任务但非核心工作

### Context管理策略

- **核心观点归纳**: 设置status line可视化context使用量，通过颜色（绿/橙/红）直观感知context窗口消耗
- **关键数据/案例**: 使用sub agents进行网络研究可将context消耗从25%降至16.5%，每次搜索节省约30,000 tokens
- **局限与挑战**: Context compaction会等待2-3分钟严重影响工作流，context越长质量越差（context rot现象）

### Skills系统构建

- **核心观点归纳**: 当发现Claude Code的弱项时，创建skill提供更好工具或prompt即可解决，无需赋予新能力
- **技术逻辑拆解**: Skills可包含：纯prompt（前端设计skill）、MCPs/CLIs连接（web research skill）、代码检查工具（Puppeteer用于slides）
- **AI PM 视角/启发**: 从marketplace下载skill有风险，建议创建自定义skill或使用可信来源，重复工作超过3次就应考虑建立skill

### 自动触发Skills

- **核心观点归纳**: Skills自动触发不稳定，最可靠方式是使用hooks或slash命令调用
- **技术逻辑拆解**: 使用user prompt submit hook，在用户发送消息时自动检测关键词并触发对应skill，避免在CLAUDE.md中列举所有skills

### 可信数据分析

- **关键数据/案例**: Jupyter notebook在Claude Code内原生渲染，可展示精确查询、代码执行过程和结果，实现traceable analysis
- **AI PM 视角/启发**: 通过创建analytics manager sub agent模拟真实公司中数据分析师角色，可进行分布图、相关性热力图等高级分析

### Claude Code操作系统架构

- **核心观点归纳**: 建立结构化文件夹系统：knowledge（静态参考）、projects（项目工作）、tasks（待办）、tools（自定义脚本）
- **关键数据/案例**: CLAUDE.md文件始终在context中，可放入个人偏好、工作目标、常用工具路径等信息，每次迭代改进可显著提升输出质量
