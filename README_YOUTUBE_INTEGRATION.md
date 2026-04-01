# YouTube 数据集成指南

本前端项目现已集成自动化的 YouTube 视频摘要数据。

## 数据来源

数据由 **OpenClaw YouTube Pipeline** 生成，包含：

- 结构化 JSON 摘要（`public/data/youtube/latest.json`）
- Markdown 格式内容（`public/content/youtube/`）
- 原始字幕文本（`public/transcripts/youtube/`）

## 数据格式

每个 YouTube 视频生成以下字段：

```typescript
{
  id: string;           // 视频ID
  type: 'youtube';      // 内容类型
  title: string;        // 视频标题
  author: string;       // 频道名称
  date: string;         // 发布日期 (YYYY-MM-DD)
  dateText: string;     // 显示日期 (如 "Mar 30")
  duration: string;     // 视频时长 (如 "16:28")
  tldr: string;         // 1-2句核心总结
  takeaways: string[];  // 3-5条关键要点
  quote: string;        // 原文金句
  link: string;         // YouTube 链接
  tags: string[];       // 标签 (AI PM, Career, etc.)
  detailedBreakdown: [  // 深度拆解笔记
    {
      subtitle: string;
      points: [
        { label: string; content: string; }
      ]
    }
  ]
}
```

## 前端加载逻辑

前端通过 `src/dataLoader.ts` 加载数据：

1. 优先加载 `public/data/youtube/latest.json`
2. 如果加载失败，回退到 `src/mockData.ts`
3. 自动合并 YouTube 数据与 mock 中的 podcast/twitter 数据
4. 按日期排序（最新的在前）

## 如何更新数据

### 手动更新

```bash
# 1. 运行 YouTube pipeline
cd ~/.openclaw/workspace/youtube-pipeline
export MINIMAX_API_KEY='你的key'
python3 scripts/run_pipeline.py --limit-per-channel 1

# 2. 复制数据到前端
rsync -a --delete ~/.openclaw/workspace/youtube-pipeline/data/youtube/ public/data/youtube/
rsync -a --delete ~/.openclaw/workspace/youtube-pipeline/content/youtube/ public/content/youtube/

# 3. 提交并推送
git add public/data/youtube/ public/content/youtube/
git commit -m "chore: update YouTube data"
git push
```

### 自动更新（推荐）

配置定时任务：

```bash
# 在 OpenClaw 中设置 cron
cd ~/.openclaw/workspace/youtube-pipeline
./scripts/setup_cron.sh
```

定时任务会自动：
- 抓取新视频
- 生成摘要
- 推送到 GitHub

## 前端开发

### 本地运行

```bash
npm install
npm run dev
```

### 构建部署

```bash
npm run build
npm run preview
```

## 数据目录结构

```
public/
├── data/
│   └── youtube/
│       ├── latest.json              # 最新视频索引
│       └── 2026-03-30/              # 按日期分组
│           ├── intentional-product-manager-vqo64rHIsLE.json
│           └── aakash-gupta-Eqh2iwSl570.json
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

## 监控的 YouTube 频道

当前监控的频道（可在 `youtube-pipeline/config/channels.json` 中修改）：

1. Intentional Product Manager
2. Aakash Gupta
3. PM Accelerator
4. AI Explained
5. Two Minute Papers
6. Matthew Berman
7. Dwarkesh Patel
8. Lex Fridman
9. Matt Wolfe
10. DeepLearning.AI

## 故障排除

### 数据加载失败

1. 检查 `public/data/youtube/latest.json` 是否存在
2. 检查控制台错误信息
3. 确保 JSON 格式正确

### 视频无字幕

- 某些视频可能没有字幕
- pipeline 会自动跳过无字幕视频
- 状态记录在 `youtube-pipeline/state/videos.json`

### 模型调用失败

- 检查 `MINIMAX_API_KEY` 环境变量
- 确认 API 配额充足
- 查看 `youtube-pipeline/logs/` 中的错误日志

## 扩展功能

### 添加新频道

编辑 `youtube-pipeline/config/channels.json`：

```json
{
  "name": "新频道名称",
  "url": "https://www.youtube.com/@频道ID",
  "category": "tech",
  "lang": "en",
  "enabled": true
}
```

### 自定义摘要 prompt

修改 `youtube-pipeline/config/prompt_system.txt`

### 调整数据字段

更新 `src/types.ts` 和 `src/dataLoader.ts`
