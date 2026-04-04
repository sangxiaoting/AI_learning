# 数据更新流水线

本文档面向维护者，记录数据抓取与处理流程。

---

## 依赖

- Python 3.10+
- `yt-dlp`（`brew install yt-dlp` 或 `pip install yt-dlp`）
- MiniMax API Key

---

## 环境变量配置

在仓库根目录创建 `.env.local`：

```bash
MINIMAX_API_KEY=your_key_here
GITHUB_REMOTE=https://github.com/your_username/AI_learning.git
```

---

## 运行命令

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

---

## cron 定时任务

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

配置文件：`config/channels.json`

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

## 相关脚本

```
scripts/
├── run_pipeline.py                  # YouTube 主流程
├── run_follow_builders_pipeline.sh  # Twitter 动态流程
├── run_full_pipeline.sh             # 一键全流程
└── run_cron_pipeline.sh             # cron 入口（读取 .env.local）
```

配置文件：

```
config/
├── channels.json                        # YouTube 频道订阅列表
├── prompt_system.txt                    # YouTube 总结 system prompt
└── follow_builders_digest_system.txt    # Twitter 动态 prompt
```
