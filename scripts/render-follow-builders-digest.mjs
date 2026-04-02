#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const ROOT = process.cwd();
const USER_CONFIG = join(homedir(), '.follow-builders', 'config.json');
const IN_FILE = join(ROOT, 'data', 'follow-builders', 'latest.json');
const OUT_FILE = join(ROOT, 'data', 'follow-builders', 'digest-zh.json');

function clean(text = '') {
  return String(text).replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
}

function short(text = '', max = 160) {
  const t = clean(text);
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

function roleZh(role = '') {
  return short(
    clean(role)
      .replace(/\bhead of product\b/ig, '产品负责人')
      .replace(/\bproduct at\b/ig, '任职于')
      .replace(/\bpresident & ceo\b/ig, '总裁兼 CEO')
      .replace(/\bceo\b/ig, 'CEO')
      .replace(/\bfounder\b/ig, '创始人')
      .replace(/\bpartner\b/ig, '合伙人')
      .replace(/\bprev:.*$/ig, '')
      .replace(/\|.*$/g, '')
      .trim(),
    48
  );
}

function classify(text = '') {
  const t = text.toLowerCase();
  if (/launch|released|introduc|coming soon|support|shipped/.test(t)) return 'product';
  if (/agent|workflow|automation|tool|skill/.test(t)) return 'agent';
  if (/model|llm|gpt|claude|mistral|local models/.test(t)) return 'model';
  if (/growth|signup|revenue|users|mom/.test(t)) return 'business';
  if (/think|believe|argue|should|never|love/.test(t)) return 'opinion';
  return 'update';
}

function makeZhSummary(author, text) {
  const s = short(text, 140);
  const kind = classify(text);
  if (!s) return `${author} 今天分享了一则更新。`;
  switch (kind) {
    case 'product':
      return `${author} 分享了产品或功能更新：${s}`;
    case 'agent':
      return `${author} 提到了 agent / 工具相关的新动态：${s}`;
    case 'model':
      return `${author} 分享了对模型能力或模型生态的看法：${s}`;
    case 'business':
      return `${author} 提到了业务增长或市场信号：${s}`;
    case 'opinion':
      return `${author} 表达了一个比较鲜明的观点：${s}`;
    default:
      return `${author} 的最新动态：${s}`;
  }
}

function makeZhTitle(author, text) {
  const s = short(text, 32);
  return s || `${author} 的最新观点`;
}

function isNotable(text = '') {
  const t = clean(text);
  if (!t || t.length < 20) return false;
  if (/^@\w+/.test(t) && t.length < 50) return false;
  if (/^(see you there|oh dear|louder|apr 1 lmao)$/i.test(t)) return false;
  if (/^https?:\/\//i.test(t)) return false;
  return /(agent|model|llm|gpt|claude|launch|release|tool|skill|growth|signup|revenue|users|product|pm|engineer|code|ai)/i.test(t) || t.length > 80;
}

function groupByAuthor(xItems = []) {
  const map = new Map();
  for (const item of xItems) {
    const key = item.name || item.username || 'Unknown';
    if (!map.has(key)) {
      map.set(key, {
        author: key,
        role: roleZh(item.role || item.bio || ''),
        posts: []
      });
    }
    for (const tweet of item.tweets || []) {
      const plain = clean(tweet.text || '');
      if (!isNotable(plain)) continue;
      map.get(key).posts.push({
        url: tweet.url || null,
        publishedAt: tweet.createdAt || null,
        title: makeZhTitle(key, plain),
        summary: makeZhSummary(key, plain),
        raw: plain
      });
    }
  }
  return Array.from(map.values())
    .map(group => ({
      ...group,
      posts: group.posts
        .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')))
        .slice(0, 5)
    }))
    .filter(group => group.posts.length > 0)
    .sort((a, b) => String(b.posts[0]?.publishedAt || '').localeCompare(String(a.posts[0]?.publishedAt || '')));
}

function podcastDigest(items = []) {
  return items.map(ep => ({
    type: 'podcast_episode',
    podcast: ep.podcast,
    title: ep.title,
    url: ep.url,
    publishedAt: ep.publishedAt,
    summary: short(ep.summary || ep.transcript || '', 240)
      ? `这期播客《${ep.title}》的重点是：${short(ep.summary || ep.transcript || '', 240)}`
      : `这期播客《${ep.title}》值得关注。`
  }));
}

function blogDigest(items = []) {
  return items.map(blog => ({
    type: 'blog_post',
    source: blog.source,
    title: blog.title,
    url: blog.url,
    publishedAt: blog.publishedAt,
    summary: short(blog.summary || blog.content || '', 240)
      ? `这篇文章《${blog.title}》的重点是：${short(blog.summary || blog.content || '', 240)}`
      : `这篇文章《${blog.title}》值得一读。`
  }));
}

async function main() {
  const raw = JSON.parse(await readFile(IN_FILE, 'utf8'));
  const config = JSON.parse(await readFile(USER_CONFIG, 'utf8'));

  const digest = {
    schemaVersion: '1.0-digest-zh',
    generatedAt: raw.generatedAt,
    date: raw.date,
    language: config.language || 'zh',
    sourceStats: raw.sourceStats,
    twitterDigest: groupByAuthor(raw.sources?.x || []),
    podcastDigest: podcastDigest(raw.sources?.podcasts || []),
    blogDigest: blogDigest(raw.sources?.blogs || [])
  };

  await mkdir(join(ROOT, 'data', 'follow-builders'), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(digest, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, outFile: OUT_FILE, builders: digest.twitterDigest.length }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
