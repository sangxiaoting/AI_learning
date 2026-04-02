# follow-builders 自动化

## 当前行为
每天 `09:00`（本机 cron）执行：
1. 导出结构化 JSON
2. 导出轻量版 JSON
3. 提交 `data/follow-builders/` 变更
4. 推送到 GitHub `origin/main`

## 文件
- `latest.json`：完整结构化数据
- `latest-lite.json`：更适合前端/页面消费的轻量版
- `history/YYYY-MM-DD.json`：按天归档

## 相关脚本
- `scripts/export-follow-builders-json.mjs`
- `scripts/export-follow-builders-lite.mjs`
- `scripts/push-follow-builders-json.sh`
- `scripts/run_follow_builders_pipeline.sh`
- `scripts/setup_follow_builders_cron.sh`

## 手动安装 cron
```bash
bash scripts/setup_follow_builders_cron.sh
```

## 手动执行一次
```bash
bash scripts/run_follow_builders_pipeline.sh
```

## 日志
- `logs/follow-builders-cron.log`
