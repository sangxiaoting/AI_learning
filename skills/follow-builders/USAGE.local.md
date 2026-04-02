# follow-builders 本地使用

## 位置
- 工作区版本：`skills/follow-builders`
- 全局版本：`~/.agents/skills/follow-builders`

## 直接运行准备脚本
在工作区根目录执行：

```bash
zsh scripts/use-follow-builders.sh
```

它会运行：

```bash
cd skills/follow-builders/scripts && node prepare-digest.js
```

## 说明
- `prepare-digest.js` 会输出 digest 所需的 JSON 数据
- 真正的摘要重组和投递，仍需代理/助手按 `SKILL.md` 流程处理
- 如果后续要接定时任务、投递到聊天渠道、或者做工作区级命令封装，可以继续加
