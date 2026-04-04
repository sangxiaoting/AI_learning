# LearningHub

一个面向 AI / 产品方向的个人学习聚合站，自动抓取 YouTube、播客、Twitter/X 内容，通过 AI 结构化提炼后呈现在前端，支持搜索、笔记本收藏和划线问 AI。

---

## 功能概览

### 前端（React + Vite）
- 多来源内容聚合：YouTube、播客、Twitter/X
- 全文搜索 + 类型 / 日期筛选
- 详情页：TL;DR、核心要点、深度摘要、时间轴拆解
- **笔记本**：一键收藏任意卡片，支持写笔记、持久保存（localStorage）、从 Header 快速查看
- **划线问 AI**：在详情页选中文字 → 浮现"问一问 AI"按钮 → Gemini 多轮对话

### 数据流水线（Python + Shell）
- 定时抓取配置频道的新视频（`config/channels.json`）
- `yt-dlp` 提取字幕，MiniMax 结构化提炼
- 输出 JSON 供前端消费 + Markdown 供人阅读
- 同步到前端 `public/` 目录并自动提交推送

---

## 项目结构

```
├── src/                    # 前端源码（React + TypeScript）
│   ├── App.tsx             # 主组件（所有功能入口）
│   ├── types.ts            # 类型定义
│   ├── dataLoader.ts       # 数据加载逻辑
│   └── mockData.ts         # 本地 mock 数据
├── config/
│   ├── channels.json       # YouTube 频道订阅列表
│   ├── prompt_system.txt   # YouTube 总结 system prompt
│   └── follow_builders_digest_system.txt  # Twitter 动态 prompt
├── scripts/
│   ├── run_pipeline.py         # YouTube 主流程
│   ├── run_follow_builders_pipeline.sh  # Twitter 动态流程
│   ├── run_full_pipeline.sh    # 一键全流程
│   └── run_cron_pipeline.sh    # cron 入口（读取 .env.local）
├── data/                   # 结构化 JSON 输出
├── content/                # Markdown 输出
├── transcripts/            # 原始字幕
├── state/                  # 已处理视频状态
└── public/                 # 前端静态资源（构建产物 + 数据）
```

---

## 快速开始

### 前端本地开发

```bash
npm install
npm run dev        # http://localhost:3000
```

配置 Gemini API（划线问 AI 功能需要）：

```bash
# .env
VITE_GEMINI_API_KEY=your_key_here
```

### 数据流水线

**依赖：**
- Python 3.10+
- `yt-dlp`（`brew install yt-dlp` 或 `pip install yt-dlp`）
- MiniMax API Key

**推荐：在仓库根目录创建 `.env.local`**

```bash
MINIMAX_API_KEY=your_key_here
GITHUB_REMOTE=https://github.com/your_username/AI_learning.git
```

**一键运行（生成数据 + 同步前端 + 自动 push）：**

```bash
bash ./scripts/run_cron_pipeline.sh
```

**只跑 YouTube，不 push：**

```bash
export MINIMAX_API_KEY='your_key'
python3 scripts/run_pipeline.py --limit-per-channel 1

# 只检查频道，不调用 AI 总结：
python3 scripts/run_pipeline.py --discover-only
```

**设置定时任务（每天 10:30 和 18:30 自动运行）：**

```bash
bash ./scripts/setup_cron.sh
```

或手动添加 cron：

```cron
30 10,18 * * * /path/to/AI_learning/scripts/run_cron_pipeline.sh >> /path/to/logs/cron.log 2>&1
```

---

## 已订阅频道

| 频道 | 分类 |
|------|------|
| Intentional Product Manager | 产品 |
| Aakash Gupta | 产品 |
| PM Accelerator | 产品 |
| AI Explained | 技术 |
| Two Minute Papers | 技术 |
| Matthew Berman | 技术 |
| Dwarkesh Patel | 行业 |
| Lex Fridman | 行业 |
| Matt Wolfe | 行业 |
| DeepLearning.AI | 基础 |

---

## 数据输出格式

每个 YouTube 视频生成三份文件：

```
data/youtube/YYYY-MM-DD/<slug>-<video_id>.json   # 结构化 JSON（前端消费）
content/youtube/YYYY-MM-DD/<slug>-<video_id>.md  # Markdown（人类阅读）
transcripts/youtube/YYYY-MM-DD/<video_id>.txt    # 原始字幕
```

前端统一从以下路径读取最新数据：

```
public/data/youtube/latest.json
public/data/podcast/latest.json
public/data/twitter/latest.json
```

---

## Tech Stack

| 层 | 技术 |
|----|------|
| 前端框架 | React 19 + TypeScript + Vite |
| 样式 | Tailwind CSS v4 |
| 动画 | Motion (Framer Motion) |
| AI 对话 | Google Gemini 2.0 Flash (`@google/genai`) |
| 数据抓取 | yt-dlp + Python |
| AI 总结 | MiniMax M2.5 |

---

## License

MIT
