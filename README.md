# YouTube Pipeline

定时抓取指定 YouTube 频道的新视频，提取字幕，调用 MiniMax 做结构化提炼，并输出给前端消费的 `json` 与给人阅读的 `markdown`。

## 目录

- `config/channels.json`：频道配置
- `config/prompt_system.txt`：总结模型的 system prompt
- `scripts/run_pipeline.py`：主流程脚本
- `state/videos.json`：已处理视频状态
- `data/`：结构化 JSON 输出
- `content/`：Markdown 输出
- `transcripts/`：原始字幕
- `logs/`：运行日志

## 依赖

- `yt-dlp`
- Python 3.10+

## 环境变量

- `MINIMAX_API_KEY`：MiniMax API key
- `MINIMAX_MODEL`：可选，默认 `MiniMax-M2.5`
- `YOUTUBE_PIPELINE_BASE_URL`：可选，默认 `https://api.minimaxi.com/v1/text/chatcompletion_v2`

## 使用

```bash
export MINIMAX_API_KEY='你的key'
python3 youtube-pipeline/scripts/run_pipeline.py --limit-per-channel 1
```

只检查频道，不调用总结：

```bash
python3 youtube-pipeline/scripts/run_pipeline.py --discover-only
```

## 输出说明

每个视频会生成：

- `data/youtube/YYYY-MM-DD/<slug>-<video_id>.json`
- `content/youtube/YYYY-MM-DD/<slug>-<video_id>.md`
- `transcripts/youtube/YYYY-MM-DD/<video_id>.txt`

同时会刷新：

- `data/youtube/latest.json`

## 定时任务示例

```cron
0 9,15 * * * cd /Users/sangxiaoting/.openclaw/workspace && /usr/bin/env python3 youtube-pipeline/scripts/run_pipeline.py >> youtube-pipeline/logs/cron.log 2>&1
```
