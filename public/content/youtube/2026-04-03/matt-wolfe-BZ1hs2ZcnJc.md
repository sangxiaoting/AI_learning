# AI News: Anthropic Leak Shows Us The Future of AI

- Author: `Matt Wolfe`
- Date: `2026-04-03`
- Duration: `31:04`
- Link: https://www.youtube.com/watch?v=BZ1hs2ZcnJc
- Tags: AI PM, LLM, Agents, Anthropic, OpenAI, Claude

## TL;DR

本周AI领域最大新闻是Anthropic的Claude Code源代码泄露，揭示了三层记忆架构和Chyros主动后台代理系统；同时OpenAI完成史上最大规模融资122亿美元，估值8520亿美元，正在打造统一AI超级应用。

## Takeaways

- Claude Code源代码泄露揭示了Anthropic正在开发的Chyros系统——一个全天候运行的后台AI代理，可以在用户空闲时主动执行任务、修复代码错误、回复消息、更新文件
- Chyros具有三个专属功能：推送通知、文件传输和PR订阅，这是普通Claude Code不具备的能力
- OpenAI完成122亿美元融资，估值8520亿美元，月收入达20亿美元，增长速度是Alphabet和Meta的四倍
- OpenAI计划打造统一AI超级应用，将ChatGPT、GPT-4、Codex、浏览等功能整合到一个应用中
- Qwen 3.6 Plus发布，拥有100万token上下文窗口，专为真实世界代理和下一代代理编程设计

## Quote

> We're heading to a post-prompting era. The LLMs over time are going to fall into the background and become more and more of the plumbing and less of the thing that you're actually interacting with.

## Detailed Breakdown

### Anthropic Claude Code泄露事件

- **核心观点归纳**: Claude Code源代码通过npm注册表的map文件泄露，Anthropic正在尝试DMCA下架但态度相对温和，官方称其为开发者错误
- **关键数据/案例**: 泄露揭示了三层记忆架构：memory MD作为轻量级指针索引永远加载在context中，原始对话记录只用于特定ID搜索而不完全加载
- **AI PM 视角/启发**: 发现的Chyros系统代表了AI交互模式的根本转变——从被动响应转向主动预防，用户无需提示即可自动解决问题

### Chyros主动后台代理系统

- **核心观点归纳**: Chyros是一个全天候运行的后台守护进程，每隔几秒接收心跳提示，判断是否需要主动行动，可在用户睡觉或工作时自动修复错误、回复消息、更新文件
- **关键数据/案例**: 示例：网站宕机时自动重启服务器并通知用户；凌晨2点收到客户投诉邮件时自动回复并记录；发现Stripe订阅页面上线3天的拼写错误时自动修复
- **AI PM 视角/启发**: 这预示着后提示词时代即将来临，AI将逐渐成为后台基础设施而非用户直接交互的前台产品

### OpenAI融资与战略布局

- **关键数据/案例**: 完成122亿美元融资，估值8520亿美元，月收入20亿美元，增长速度是Alphabet和Meta的4倍
- **核心观点归纳**: OpenAI明确表示正在打造统一AI超级应用，将ChatGPT、Codex、浏览等功能整合到一个以代理为中心体验的应用中
- **AI PM 视角/启发**: 微软仍参与此轮融资，粉碎了双方闹翻的传闻；Sora因每天亏损约100万美元被关闭；Peter Steinberger（OpenClaw创造者）已加入团队

### 新模型发布潮

- **关键数据/案例**: Gemma 4：Google开源模型，可在Android设备和笔记本GPU上运行；Qwen 3.6 Plus：100万token上下文窗口，代理编程能力接近Opus 4.5；Trinity Large Thinking：RC发布的开源模型
- **技术逻辑拆解**: 开源模型正在快速追赶闭源模型，虽然仍稍落后但差距在缩小，本地运行和微调能力使得边缘设备AI成为可能
- **AI PM 视角/启发**: 对于产品决策者，开源模型的可获取性意味着可以在自有基础设施上构建定制化AI产品，降低对单一供应商的依赖

### 其他重要发布

- **关键数据/案例**: 微软MAI Transcribe 1：在25种语言上实现最佳转录准确率；Google Veo 3.1 Light：5美分生成720p视频；Recraft V4：专业级矢量图形生成
- **AI PM 视角/启发**: 微软将MAI Transcribe 1、MAI Voice One、MAI Image 2整合到Microsoft Foundry；Slack推出30个新AI功能，包括会议转录和原生客户管理
