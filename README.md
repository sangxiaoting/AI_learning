# LearningHub

聚合 AI / 产品方向的学习内容，支持搜索、笔记本收藏和划线问 AI。数据已内置在 `public/` 目录，clone 即可使用。

---

## 功能特性

- 多来源内容聚合：YouTube、播客、Twitter/X
- 全文搜索 + 类型 / 日期筛选
- 详情页：TL;DR、核心要点、深度摘要、时间轴拆解
- **笔记本**：一键收藏任意卡片，支持写笔记、持久保存（localStorage）、从 Header 快速查看
- **划线问 AI**：在详情页选中文字 → 浮现"问一问 AI"按钮 → Gemini 多轮对话

---

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

划线问 AI 功能需要 Gemini API Key（可选）：

```bash
# .env
VITE_GEMINI_API_KEY=your_key_here
```

---

## 项目结构

```
src/
├── App.tsx        # 主应用
├── types.ts       # 类型定义
├── dataLoader.ts  # 数据加载
└── mockData.ts    # 本地示例数据
```

---

## Tech Stack

| 层 | 技术 |
|----|------|
| 前端框架 | React 19 + TypeScript + Vite |
| 样式 | Tailwind CSS v4 |
| 动画 | Motion (Framer Motion) |
| AI 对话 | Google Gemini 2.0 Flash (`@google/genai`) |

---

## License

MIT

> 数据更新流程见 [PIPELINE.md](./PIPELINE.md)
