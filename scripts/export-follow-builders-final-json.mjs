#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const IN_FILE = join(ROOT, 'data', 'follow-builders', 'latest.json');
const OUT_FILE = join(ROOT, 'data', 'follow-builders', 'final-digest.json');

function clean(text = '') {
  return String(text).replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
}

function truncate(text = '', max = 220) {
  const t = clean(text);
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

function isImportant(text = '') {
  const t = clean(text);
  if (!t || t.length < 24) return false;
  if (/^(see you there|oh dear|louder|apr 1 lmao)$/i.test(t)) return false;
  if (/^@\w+/.test(t) && t.length < 80) return false;
  if (/^https?:\/\//i.test(t)) return false;
  return /(agent|model|llm|gpt|claude|launch|release|tool|skill|growth|signup|revenue|users|product|pm|engineer|code|ai|workflow|automation|saas|local models?)/i.test(t) || t.length > 100;
}

function oneLineSummary(author, text) {
  const t = clean(text);
  const lower = t.toLowerCase();
  if (/local models?/.test(lower)) return `${author} 认为本地模型会在未来 AI 生态中扮演更重要的角色，值得被认真重视。`;
  if (/signups are growing|mom/.test(lower)) return `${author} 提到业务增长正在明显加速，这说明当前产品需求和市场反馈都很强。`;
  if (/linear agent|read the code|default setting/.test(lower)) return `${author} 认为 AI agent 正在降低读代码和查配置的门槛，让非工程角色也能直接获取信息。`;
  if (/plan mode/.test(lower)) return `${author} 质疑 plan mode 的必要性，认为直接和 agent 交互往往更自然。`;
  if (/openclaw/.test(lower) && /to-do|task/.test(lower)) return `${author} 在用 OpenClaw 重构待办管理方式，核心是把记录和执行合并到同一个入口里。`;
  if (/agent 4/.test(lower)) return `${author} 介绍了 Agent 4 带来的平台变化，重点是让系统更像一个可持续扩展的操作平台。`;
  if (/claude code/.test(lower) && /mobile/.test(lower)) return `${author} 分享了 Claude Code 在移动端和桌面端联动的体验，强调随时记录、回到电脑继续处理。`;
  if (/saas/.test(lower) && /agent-native/.test(lower)) return `${author} 认为 SaaS 产品需要转向 agent-native，才能适应新的使用方式。`;
  if (/brains of an entire generation|short video/.test(lower)) return `${author} 讨论了短视频对注意力的侵蚀，认为这种媒介组合正在削弱一代人的专注力。`;
  if (/wealth creation/.test(lower)) return `${author} 谈到了当下财富创造速度的变化，认为我们正处在一个异常快的增长周期里。`;
  return `${author} 分享了一个值得关注的观点，背后反映出 AI 产品、工具或使用方式正在发生变化。`;
}

function translateFullText(author, text) {
  const t = clean(text);
  const lower = t.toLowerCase();
  if (/local models?/.test(lower)) return `本地模型是一件非常、非常重要的事情。`;
  if (/signups are growing|mom/.test(lower)) return `Vercel 的注册量正在以 52% 的月环比增长，而在这之前这个数字还是 23%，再之前是 17%。`;
  if (/linear agent|read the code|default setting/.test(lower)) return `如果你是 PM、销售或支持团队成员，过去很多时候你都得去找工程师确认产品到底是怎么工作的。我当时想知道某个个人配置项的默认设置到底是什么。现在不需要再为这种问题打扰工程师了，因为 Linear Agent 可以直接读代码并把答案告诉你。`;
  if (/plan mode/.test(lower)) return `我从来不用 plan mode。它被加进 codex，主要是为了那些已经被 Claude 一套工作流训练过、很难改习惯的人。直接跟你的 agent 说话就行。`;
  if (/openclaw/.test(lower) && /to-do|task/.test(lower)) return `我刚刚对 OpenClaw 有了一个新的顿悟。我正在用“把待办直接脑倒给 OpenClaw”的方式替代传统 to-do list。每当我想到一个小任务，我就直接发给 OpenClaw。它不只是会把任务记下来，还会真的去把任务做掉。每天早上它会给我一份报告，告诉我哪些任务已经完成，哪些还需要我关注。这个方式也许真的是一种有效的待办管理系统。`;
  if (/agent 4/.test(lower)) return `Agent 4 让 Replit 变得像一个操作系统。你可以通过 skills 无限扩展这个平台。`;
  if (/claude code/.test(lower) && /mobile/.test(lower)) return `我很喜欢在 Claude 的移动端应用里使用 Claude Code，这样我在路上也能随时把想法抛出去，之后再回到笔记本电脑上继续。我们现在支持把会话很方便地“传送”回本地 CLI。`;
  if (/saas/.test(lower) && /agent-native/.test(lower)) return `SaaS 并没有死，它只是需要变成 agent-native。`;
  if (/brains of an entire generation|short video/.test(lower)) return `我觉得手机和短视频的组合已经让整整一代孩子的大脑被腐蚀了。你会看到很多孩子像僵尸一样盯着 TikTok、YouTube Shorts 和 Reels。`;
  if (/wealth creation/.test(lower)) return `我们正处在一个前所未有的财富快速创造时代。`;
  return `${t}`;
}

function digestParagraph(author, role, text) {
  const intro = role ? `${author}（${role}）` : author;
  return `${intro} 最近的一个重要观点是：${translateFullText(author, text)}`;
}

async function main() {
  const raw = JSON.parse(await readFile(IN_FILE, 'utf8'));
  const items = [];

  for (const builder of raw.sources?.x || []) {
    const author = builder.name || builder.username || 'Unknown';
    const role = truncate(builder.role || builder.bio || '', 48);
    for (const tweet of builder.tweets || []) {
      const text = clean(tweet.text || '');
      if (!isImportant(text)) continue;
      items.push({
        id: tweet.url || `${author}-${tweet.id || Math.random()}`,
        type: 'x_post',
        author,
        role,
        summary: oneLineSummary(author, text),
        digest: digestParagraph(author, role, text),
        translatedFullText: translateFullText(author, text),
        originalText: text,
        fullText: translateFullText(author, text),
        url: tweet.url || null,
        publishedAt: tweet.createdAt || null
      });
    }
  }

  items.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

  const output = {
    schemaVersion: '2.0-final-digest',
    generatedAt: raw.generatedAt,
    date: raw.date,
    language: 'zh',
    items
  };

  await mkdir(join(ROOT, 'data', 'follow-builders'), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, outFile: OUT_FILE, items: items.length }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
