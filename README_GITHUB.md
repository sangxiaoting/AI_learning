# 发布说明

`youtube-pipeline` 现在不再作为独立的 GitHub 发布仓库。

它的职责只有：
1. 抓取 YouTube 视频
2. 生成摘要 / markdown / transcript
3. 自动同步到真正的前端仓库：`/Users/sangxiaoting/.openclaw/workspace/AI_learning`
4. 由 `AI_learning` 仓库负责 commit + push 到 GitHub

## 正确的发布链路

```bash
youtube-pipeline (生成数据)
  -> sync_to_ai_learning.sh
  -> AI_learning/public/
  -> AI_learning git commit/push
```

## 不再推荐的做法

以下做法已废弃，不建议再使用：
- 在 `youtube-pipeline` 目录里单独配置 `origin`
- 让 `youtube-pipeline` 直接 push 到 `AI_learning.git`
- 让前端直接把 `youtube-pipeline` 当成发布仓库

## 现在前端如何读取

前端统一从 `AI_learning/public/` 读取：

- `public/data/youtube/latest.json`
- `public/content/youtube/...`
- `public/transcripts/youtube/...`

## 日常使用

只需要运行：

```bash
cd /Users/sangxiaoting/.openclaw/workspace/youtube-pipeline
./scripts/run_full_pipeline.sh
```

它会自动：
- 生成数据
- 同步到 `AI_learning/public`
- 在 `AI_learning` 仓库里提交并推送
