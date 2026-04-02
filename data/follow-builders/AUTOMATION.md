# follow-builders 自动化

## 当前行为
每天 `09:00`（本机 cron）执行：
1. 导出结构化 JSON
2. 提交 `data/follow-builders/` 变更
3. 推送到 GitHub `origin/main`

## 相关脚本
- `scripts/export-follow-builders-json.mjs`
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
