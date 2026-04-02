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
  if (/local models?/.test(lower)) return `${author} 看好本地模型的重要性。`;
  if (/signups are growing|mom/.test(lower)) return `${author} 提到业务增长正在明显加速。`;
  if (/linear agent|read the code|default setting/.test(lower)) return `${author} 认为 AI agent 正在降低读代码和查配置的门槛。`;
  if (/plan mode/.test(lower)) return `${author} 质疑 plan mode 的必要性。`;
  if (/openclaw/.test(lower) && /to-do|task/.test(lower)) return `${author} 在用 OpenClaw 重构待办管理方式。`;
  if (/agent 4/.test(lower)) return `${author} 介绍了 Agent 4 带来的平台变化。`;
  if (/claude code/.test(lower) && /mobile/.test(lower)) return `${author} 分享了 Claude Code 在移动端和桌面端联动的体验。`;
  if (/saas/.test(lower) && /agent-native/.test(lower)) return `${author} 认为 SaaS 需要转向 agent-native。`;
  if (/brains of an entire generation|short video/.test(lower)) return `${author} 讨论了短视频对注意力的侵蚀。`;
  if (/wealth creation/.test(lower)) return `${author} 谈到了当下财富创造速度的变化。`;
  return `${author} 分享了一个值得关注的观点。`;
}

function digestParagraph(author, role, text) {
  const intro = role ? `${author}（${role}）` : author;
  return `${intro} 最近的一个重要观点是：${truncate(text, 260)}`;
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
        fullText: text,
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
