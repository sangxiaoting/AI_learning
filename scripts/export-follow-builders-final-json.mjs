#!/usr/bin/env node
import 'dotenv/config';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { GoogleGenAI } from '@google/genai';

const ROOT = process.cwd();
const IN_FILE = join(ROOT, 'data', 'follow-builders', 'latest.json');
const OUT_FILE = join(ROOT, 'data', 'follow-builders', 'final-digest.json');
const PROMPT_FILE = join(ROOT, 'config', 'follow_builders_digest_system.txt');

function clean(text = '') {
  return String(text).replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
}

function formatDateText(date) {
  if (!date) return '未知';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) return '今天';
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function shortenRole(role = '') {
  const t = clean(role).replace(/[|•·]+/g, ' ').trim();
  if (!t) return undefined;
  return t.length > 90 ? t.slice(0, 89).trimEnd() + '…' : t;
}

function fallbackDigest(author, text) {
  const t = clean(text);
  const short = t.length > 220 ? t.slice(0, 219).trimEnd() + '…' : t;
  return {
    shouldInclude: t.length >= 24,
    title: t ? `${author} 的最新表达` : '',
    summary: t ? `${author} 提到：${short}` : '',
    whyItMatters: t ? '这条内容保留了原始表达，但尚未完成高质量结构化提炼。' : '',
    translatedText: t,
    contentType: 'industry_commentary',
    confidence: 0.35,
  };
}

async function generateWithGemini(systemPrompt, input) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const userPrompt = JSON.stringify(input, null, 2);
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const text = response.text?.trim();
  if (!text) return null;
  return JSON.parse(text);
}

async function summarizePost(systemPrompt, post) {
  try {
    const llm = await generateWithGemini(systemPrompt, post);
    if (llm && typeof llm === 'object') return llm;
  } catch {}
  return fallbackDigest(post.author, post.originalText);
}

async function main() {
  const raw = JSON.parse(await readFile(IN_FILE, 'utf8'));
  const systemPrompt = existsSync(PROMPT_FILE)
    ? await readFile(PROMPT_FILE, 'utf8')
    : '只输出 JSON。';

  const items = [];

  for (const builder of raw.sources?.x || []) {
    const author = builder.name || builder.username || 'Unknown';
    const role = shortenRole(builder.role || builder.bio || '');
    for (const tweet of builder.tweets || []) {
      const originalText = clean(tweet.text || '');
      const url = tweet.url || null;
      const publishedAt = tweet.createdAt || null;

      const result = await summarizePost(systemPrompt, {
        author,
        role,
        originalText,
        url,
        publishedAt,
        language: raw?.config?.language || 'zh',
      });

      if (!result?.shouldInclude) continue;

      items.push({
        id: url || `${author}-${tweet.id || Math.random()}`,
        type: 'x_post',
        author,
        role,
        title: clean(result.title || `${author} 的更新`),
        summary: clean(result.summary || ''),
        whyItMatters: clean(result.whyItMatters || ''),
        translatedText: clean(result.translatedText || ''),
        originalText,
        url,
        publishedAt,
        contentType: result.contentType || 'industry_commentary',
        confidence: Number(result.confidence ?? 0.5),
      });
    }
  }

  items.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

  const output = {
    schemaVersion: '3.0-final-digest',
    generatedAt: raw.generatedAt,
    date: raw.date,
    language: raw?.config?.language || 'zh',
    items,
  };

  await mkdir(join(ROOT, 'data', 'follow-builders'), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, outFile: OUT_FILE, items: items.length }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
