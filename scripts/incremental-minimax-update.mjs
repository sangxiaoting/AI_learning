#!/usr/bin/env node
import 'dotenv/config';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const LATEST_FILE = join(ROOT, 'data', 'follow-builders', 'latest.json');
const FINAL_FILE = join(ROOT, 'data', 'follow-builders', 'final-digest.json');
const PROMPT_FILE = join(ROOT, 'config', 'follow_builders_digest_system.txt');

function clean(text = '') {
  return String(text).replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
}

function fallbackDigest(author, text) {
  const t = clean(text);
  const lower = t.toLowerCase();
  const weakPatterns = [
    /^louder[!. ]*$/i,
    /^lol[!. ]*$/i,
    /^so true[!. ]*$/i,
    /^exactly[!. ]*$/i,
    /^nice[!. ]*$/i,
    /^looks good[!. ]*$/i,
    /^looks delicious[!. ]*$/i,
    /^bookmark this/i,
    /^see you there/i,
    /^interesting triangles/i,
  ];
  if (!t || t.length < 12 || weakPatterns.some((p) => p.test(t)) || (t.length < 40 && !/[\u4e00-\u9fff]/.test(t) && !/(agent|model|ai|gpt|claude|openclaw|workflow|tool|product|launch|revenue|growth|code)/i.test(lower))) {
    return {
      shouldInclude: false,
      title: '',
      summary: '',
      translatedText: '',
      contentType: 'industry_commentary',
      confidence: 0.2,
    };
  }
  const short = t.length > 140 ? t.slice(0, 139).trimEnd() + '…' : t;
  return {
    shouldInclude: true,
    title: '',
    summary: short,
    translatedText: t,
    contentType: 'industry_commentary',
    confidence: 0.35,
  };
}

function shortenRole(role = '') {
  const t = clean(role).replace(/[|•·]+/g, ' ').trim();
  if (!t) return undefined;
  return t.length > 90 ? t.slice(0, 89).trimEnd() + '…' : t;
}

function shouldKeepSummary(summary = '', originalText = '') {
  const s = clean(summary);
  const o = clean(originalText);
  const lower = s.toLowerCase();
  if (!s || s.length < 8) return false;
  const exactWeak = [
    '说得太对了。',
    '看起来很好吃',
    '看起来很好吃。',
    'gpteesus 已复活',
    'gpteesus 已复活。',
  ];
  if (exactWeak.includes(lower) || exactWeak.includes(s)) return false;
  const weakPatterns = [
    /^(说得太对了|确实如此|完全同意|太对了|哈哈|笑死|回头见)[。！! ]*$/,
    /^(看起来很好吃|看起来不错|看起来很棒)[。！! ]*$/,
    /^(bookmark this|see you there|interesting triangles|louder|lol|so true|exactly|nice)[.! ]*$/i,
  ];
  if (weakPatterns.some((p) => p.test(s))) return false;
  const hasSignal = /(ai|agent|模型|workflow|工作流|代码|编程|产品|功能|上线|发布|增长|收入|融资|开源|提示词|prompt|llm|gpt|claude|openclaw|replit|vercel|linear|cursor|codex)/i.test(s + ' ' + o);
  if (!hasSignal && s.length < 18) return false;
  return true;
}

async function generateWithMinimax(systemPrompt, input) {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) return null;
  const userPrompt = JSON.stringify(input, null, 2);
  const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.MINIMAX_MODEL || 'MiniMax-M2.5',
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
      temperature: 0.2,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Minimax API error ${response.status}:`, errorText);
    return null;
  }

  const data = await response.json();
  const textBlock = (data.content || []).find(item => item.type === 'text');
  const text = textBlock?.text?.trim();
  if (!text) return null;
  let jsonText = text;
  const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (jsonMatch) jsonText = jsonMatch[1].trim();
  return JSON.parse(jsonText);
}

async function summarizePost(systemPrompt, post) {
  try {
    const llm = await generateWithMinimax(systemPrompt, post);
    if (llm && typeof llm === 'object') return llm;
  } catch (e) {
    console.error('summarize failed:', e.message);
  }
  return fallbackDigest(post.author, post.originalText);
}

async function main() {
  const latest = JSON.parse(await readFile(LATEST_FILE, 'utf8'));
  const final = existsSync(FINAL_FILE)
    ? JSON.parse(await readFile(FINAL_FILE, 'utf8'))
    : { schemaVersion: '3.0-final-digest', generatedAt: latest.generatedAt, date: latest.date, language: latest?.config?.language || 'zh', items: [] };
  const systemPrompt = existsSync(PROMPT_FILE) ? await readFile(PROMPT_FILE, 'utf8') : '只输出 JSON。';

  const existing = new Set(final.items.map(item => item.url || item.id));
  const newItems = [];

  for (const builder of latest.sources?.x || []) {
    const author = builder.name || builder.username || 'Unknown';
    const role = shortenRole(builder.role || builder.bio || '');
    for (const tweet of builder.tweets || []) {
      const url = tweet.url || null;
      const id = url || `${author}-${tweet.id || Math.random()}`;
      if (existing.has(url || id)) continue;
      const originalText = clean(tweet.text || '');
      const publishedAt = tweet.createdAt || null;
      const result = await summarizePost(systemPrompt, { author, role, originalText, url, publishedAt, language: latest?.config?.language || 'zh' });
      if (!result?.shouldInclude) continue;
      const summary = clean(result.summary || '');
      if (!summary) continue;
      if (!shouldKeepSummary(summary, originalText)) continue;
      newItems.push({
        id,
        type: 'x_post',
        author,
        role,
        title: '',
        summary,
        whyItMatters: clean(result.whyItMatters || ''),
        translatedText: clean(result.translatedText || ''),
        originalText,
        url,
        publishedAt,
        contentType: result.contentType || 'industry_commentary',
        confidence: Number(result.confidence ?? 0.5),
      });
      console.log('added:', author, '-', (originalText || '').slice(0, 80));
    }
  }

  final.generatedAt = latest.generatedAt;
  final.date = latest.date;
  final.language = latest?.config?.language || final.language || 'zh';
  final.items = [...final.items, ...newItems].sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
  await writeFile(FINAL_FILE, JSON.stringify(final, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, added: newItems.length, total: final.items.length }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});