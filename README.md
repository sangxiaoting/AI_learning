# AI Learning + YouTube Pipeline

这个仓库现在同时包含：

1. 前端应用（远程仓库既有内容）
2. YouTube 数据抓取与总结流水线（本次并入）

## YouTube Pipeline

定时抓取指定 YouTube 频道的新视频，提取字幕，调用 MiniMax 做结构化提炼，并输出给前端消费的 `json` 与给人阅读的 `markdown`。

### 目录

- `config/channels.json`：频道配置
- `config/prompt_system.txt`：总结模型的 system prompt
- `scripts/run_pipeline.py`：主流程脚本
- `state/videos.json`：已处理视频状态
- `data/`：结构化 JSON 输出
- `content/`：Markdown 输出
- `transcripts/`：原始字幕
- `logs/`：运行日志

### 依赖

- `yt-dlp`（脚本会优先尝试 `/opt/homebrew/bin/yt-dlp`，也可用 `YT_DLP_PATH` 覆盖）
- Python 3.10+

### 环境变量

- `MINIMAX_API_KEY`：MiniMax API key
- `MINIMAX_MODEL`：可选，默认 `MiniMax-M2.5`
- `YOUTUBE_PIPELINE_BASE_URL`：可选，默认 `https://api.minimaxi.com/v1/text/chatcompletion_v2`

### 使用

```bash
export MINIMAX_API_KEY='你的key'
python3 scripts/run_pipeline.py --limit-per-channel 1
```

只检查频道，不调用总结：

```bash
python3 scripts/run_pipeline.py --discover-only
```

### 输出说明

每个视频会生成：

- `data/youtube/YYYY-MM-DD/<slug>-<video_id>.json`
- `content/youtube/YYYY-MM-DD/<slug>-<video_id>.md`
- `transcripts/youtube/YYYY-MM-DD/<video_id>.txt`

同时会刷新：

- `data/youtube/latest.json`

### 一键执行并推送

```bash
export MINIMAX_API_KEY='你的key'
export GITHUB_REMOTE='https://github.com/sangxiaoting/AI_learning.git'
bash ./scripts/run_full_pipeline.sh
```

### 本地保存配置（推荐）

在仓库根目录创建 `.env.local`：

```bash
MINIMAX_API_KEY=你的key
GITHUB_REMOTE=https://github.com/你的用户名/你的仓库.git
```

然后直接运行：

```bash
bash ./scripts/run_cron_pipeline.sh
```

这个脚本会自动读取 `.env.local`，所以不需要每次手动 export。

### 定时任务

可用 cron 定时执行，例如每天 10:30 和 18:30：

```cron
30 10,18 * * * /Users/sangxiaoting/.openclaw/workspace/youtube-pipeline/scripts/run_cron_pipeline.sh
```

日志会写到：

```bash
/Users/sangxiaoting/.openclaw/workspace/youtube-pipeline/logs/cron.log
```

## 原仓库说明

远程仓库原本包含一个前端应用；相关前端代码和 `public/` 目录仍然保留，可继续直接消费 YouTube / Podcast 数据。
