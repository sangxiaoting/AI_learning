# GitHub 部署指南

## 方案 A：推送到现有仓库

如果你已经有一个 GitHub 仓库，可以这样配置：

```bash
cd /Users/sangxiaoting/.openclaw/workspace/youtube-pipeline
export GITHUB_REMOTE="https://github.com/你的用户名/你的仓库.git"
python3 scripts/push_to_github.py --remote "$GITHUB_REMOTE"
```

## 方案 B：创建新的内容仓库

如果你希望专门为这个数据创建一个新仓库：

1. 在 GitHub 上创建一个新仓库，比如 `youtube-knowledge-base`
2. 设置 remote：

```bash
cd /Users/sangxiaoting/.openclaw/workspace/youtube-pipeline
git init
git remote add origin https://github.com/你的用户名/youtube-knowledge-base.git
python3 scripts/push_to_github.py --remote "$GITHUB_REMOTE"
```

## 方案 C：定时任务 + 自动推送

在 `.env` 文件中设置：

```bash
MINIMAX_API_KEY=你的key
GITHUB_REMOTE=https://github.com/你的用户名/你的仓库.git
```

然后运行：

```bash
./scripts/run_full_pipeline.sh
```

## 前端网站如何消费

你的前端网站可以直接读取这个仓库的数据：

### 方式 1：直接读取 GitHub raw URL

```javascript
// 读取最新索引
fetch('https://raw.githubusercontent.com/你的用户名/仓库/main/data/youtube/latest.json')
  .then(r => r.json())
  .then(data => console.log(data))
```

### 方式 2：克隆仓库到构建时

在 Next.js / Astro 等静态站点中，可以在构建时 clone 仓库并读取数据。

### 方式 3：通过 GitHub API

```javascript
// 获取仓库内容
fetch('https://api.github.com/repos/你的用户名/仓库/contents/data/youtube/latest.json')
  .then(r => r.json())
  .then(data => {
    const content = atob(data.content) // base64 decode
    return JSON.parse(content)
  })
```

## 目录结构示例

仓库会包含：

```
youtube-knowledge-base/
├── data/
│   └── youtube/
│       ├── 2026-03-30/
│       │   ├── intentional-product-manager-vqo64rHIsLE.json
│       │   └── aakash-gupta-Eqh2iwSl570.json
│       └── latest.json
├── content/
│   └── youtube/
│       └── 2026-03-30/
│           ├── intentional-product-manager-vqo64rHIsLE.md
│           └── aakash-gupta-Eqh2iwSl570.md
└── transcripts/
    └── youtube/
        └── 2026-03-30/
            ├── vqo64rHIsLE.txt
            └── Eqh2iwSl570.txt
```

## 安全提醒

**重要**：不要将 API key 提交到 GitHub！

1. 使用 `.env` 文件并添加到 `.gitignore`
2. 或者在 OpenClaw cron 中直接设置环境变量
3. 或者使用 GitHub Secrets（如果使用 GitHub Actions）

## 扩展频道列表

编辑 `config/channels.json`，添加更多频道：

```json
{
  "channels": [
    {
      "name": "Intentional Product Manager",
      "url": "https://www.youtube.com/@IntentionalProductManager",
      "category": "product",
      "lang": "en",
      "enabled": true
    },
    {
      "name": "AI Explained",
      "url": "https://www.youtube.com/@aiexplained-official",
      "category": "tech",
      "lang": "en",
      "enabled": true
    }
  ]
}
```
