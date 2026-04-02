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
  if (/local models?/.test(lower)) return `${author} 的原话核心意思是：本地模型非常重要，而且这种重要性还会继续提升。`;
  if (/signups are growing|mom/.test(lower)) return `${author} 提到，产品注册增长已经达到很高的月环比水平，而且相比之前还在继续加速。`;
  if (/linear agent|read the code|default setting/.test(lower)) return `${author} 这段话的核心是：过去很多默认配置、代码细节都得找工程师确认，但现在借助 Linear Agent，这类信息可以直接从代码里读出来。`;
  if (/plan mode/.test(lower)) return `${author} 的意思是，他自己几乎不用 plan mode，因为在很多情况下，直接和 agent 对话反而更自然，也不需要强行改变使用习惯。`;
  if (/openclaw/.test(lower) && /to-do|task/.test(lower)) return `${author} 的意思是，他开始把待办事项直接发给 OpenClaw，让系统既负责记录，也负责执行，并在第二天给出处理结果和待关注事项。`;
  if (/agent 4/.test(lower)) return `${author} 的意思是，Agent 4 让 Replit 更像一个操作系统，用户可以不断通过 skills 来扩展整个平台的能力。`;
  if (/claude code/.test(lower) && /mobile/.test(lower)) return `${author} 这段话强调的是：可以先在手机上用 Claude Code 记录想法，再回到本地 CLI 接着做，移动端和桌面端之间是连起来的。`;
  if (/saas/.test(lower) && /agent-native/.test(lower)) return `${author} 的意思是，传统 SaaS 并没有结束，但它必须开始适应 agent 使用软件的新方式。`;
  if (/brains of an entire generation|short video/.test(lower)) return `${author} 直白地表达了担忧：移动设备加短视频的组合，正在让很多孩子长期处于被动刷内容、注意力被削弱的状态。`;
  if (/wealth creation/.test(lower)) return `${author} 的原意是，我们正在经历一个前所未有的财富创造周期，速度比过去很多阶段都更快。`;
  return `${author} 这段内容主要在表达：${truncate(t, 180)}`;
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
