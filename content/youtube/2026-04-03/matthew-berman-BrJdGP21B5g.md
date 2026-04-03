# Google just dropped Gemma 4... (WOAH)

- Author: `Matthew Berman`
- Date: `2026-04-03`
- Duration: `9:47`
- Link: https://www.youtube.com/watch?v=BrJdGP21B5g
- Tags: LLM, Google Gemma, Open Source, Edge AI, Agents, Model Distillation

## TL;DR

Google发布Gemma 4系列开源模型，31B dense和26B MoE版本在仅需极小参数量的前提下达到接近顶级闭源模型的性能，排名Arena AI文本榜单第三，成为端侧AI和本地部署的重要里程碑。

## Takeaways

- Gemma 4 31B参数模型在ELO评测中性能接近Qwen 3.5（397B活跃参数），但体积小至可在普通消费级GPU上运行
- 31B模型在Arena AI文本排行榜位列全球第三开源模型，仅次于GLM5和Kimi K2.5这些万亿级参数巨无霸
- 全系支持Agentic工作流：原生函数调用、结构化JSON输出、系统指令，可构建自主执行工作流的AI代理
- 有效参数模型E2B/E4B专为移动端设计，运行时仅占用2B/4B参数，可离线运行于手机树莓派等边缘设备
- 上下文窗口：边缘型号128K，大型号256K；支持多模态（图像视频处理），小模型额外支持音频输入

## Quote

> Gemma delivers an unprecedented level of intelligence per parameter.

## Detailed Breakdown

### 核心性能突破：小模型实现大模型效果

- **关键数据/案例**: Gemma 4 31B在ELO评测中分数接近Qwen 3.5，但后者是397B活跃参数（17B实际运行）的巨无霸模型
- **AI PM 视角/启发**: 开源模型正朝着「更小更强」演进，边缘计算可行性大幅提升，大多数任务可在本地完成不必调用云端API
- **核心观点归纳**: Gemma 4证明小模型也能达到接近顶级闭源模型的推理能力，为本地AI应用和商业化部署打开新空间

### 模型规格与产品线布局

- **关键数据/案例**: 四款型号：E2B（有效20亿）、E4B（有效40亿）、26B MoE（混合专家）、31B dense稠密模型
- **技术逻辑拆解**: 有效参数技术通过为每个解码层配置独立的小型embedding表，在保持性能的同时大幅降低实际参数量
- **核心观点归纳**: Google为不同场景提供差异化选择：从手机端到工作站，从离线推理到复杂Agent工作流

### Agent与工作流能力

- **核心观点归纳**: 原生支持函数调用、结构化JSON输出、系统指令，开发者可直接构建能调用外部工具和API的自主代理
- **AI PM 视角/启发**: 对于需要可靠执行多步骤工作流的企业应用，Gemma 4的函数调用和结构化输出能力降低了集成门槛
- **关键数据/案例**: Tool Call 15基准测试中，Gemma 4 31B获得满分，验证了其工具调用能力的顶尖水平

### 多模态与边缘部署

- **关键数据/案例**: 全系支持图像和视频处理（OCR、图表理解）；E2B/E4B额外支持音频输入
- **技术逻辑拆解**: 与Google Pixel、高通、联发科深度合作优化，可在手机、Jetson、Orin等设备离线运行，接近零延迟
- **局限与挑战**: 上下文窗口偏小：边缘型号128K，大型号256K，未达到业界512K-1M的主流顶级水平

### 许可证与生态支持

- **关键数据/案例**: 采用Apache 2.0商业友好许可证，支持HuggingFace、LM Studio、Ollama、LlamaCPP、MLX等多种部署渠道
- **核心观点归纳**: Google持续坚持开源开放策略，为开发者提供高度灵活的商用权限和丰富的微调选项
