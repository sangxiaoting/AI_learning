# follow-builders JSON exports

这个目录保存 `follow-builders` 的结构化导出结果。

## 文件
- `latest.json`：最新一次完整导出
- `latest-lite.json`：最新一次轻量导出，适合前端/页面直接读取
- `history/YYYY-MM-DD.json`：按天归档

## 生成
在工作区根目录执行：

```bash
node scripts/export-follow-builders-json.mjs
node scripts/export-follow-builders-lite.mjs
```

## 推送到 GitHub

```bash
zsh scripts/push-follow-builders-json.sh
```

当前远端仓库：
- `https://github.com/sangxiaoting/AI_learning.git`
