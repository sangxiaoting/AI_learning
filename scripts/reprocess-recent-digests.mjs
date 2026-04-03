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

function shortenRole(role = '') {
  const t = clean(role).replace(/[|•·]+/g, ' ').trim();
  if (!t) return undefined;
  return t.length > 90 ? t.slice(0, 89).trimEnd() + '…' : t;
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
  if (!response.ok) throw new Error(`Minimax ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const textBlock = (data.content || []).find(item => item.type === 'text');
  const text = textBlock?.text?.trim();
  if (!text) return null;
  let jsonText = text;
  const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
  if (jsonMatch) jsonText = jsonMatch[1].trim();
  return JSON.parse(jsonText);
}

async function main() {
  const latest = JSON.parse(await readFile(LATEST_FILE, 'utf8'));
  const final = JSON.parse(await readFile(FINAL_FILE, 'utf8'));
  const systemPrompt = existsSync(PROMPT_FILE) ? await readFile(PROMPT_FILE, 'utf8') : '只输出 JSON。';

  const latestByUrl = new Map();
  for (const builder of latest.sources?.x || []) {
    const author = builder.name || builder.username || 'Unknown';
    const role = shortenRole(builder.role || builder.bio || '');
    for (const tweet of builder.tweets || []) {
      if (!tweet.url) continue;
      latestByUrl.set(tweet.url, {
        author,
        role,
        originalText: clean(tweet.text || ''),
        url: tweet.url,
        publishedAt: tweet.createdAt || null,
        language: latest?.config?.language || 'zh'
      });
    }
  }

  const targets = final.items.slice(0, 8);
  let updated = 0;

  for (const item of targets) {
    const source = latestByUrl.get(item.url);
    if (!source) continue;
    const result = await generateWithMinimax(systemPrompt, source);
    if (!result || result.shouldInclude === false) continue;
    item.title = clean(result.title || item.title || '');
    item.summary = clean(result.summary || item.summary || '');
    item.translatedText = clean(result.translatedText || item.translatedText || '');
    delete item.whyItMatters;
    delete item.contentType;
    delete item.confidence;
    updated += 1;
    console.log('reprocessed:', item.author, '-', item.title);
  }

  await writeFile(FINAL_FILE, JSON.stringify(final, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, updated }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});