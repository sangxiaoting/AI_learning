#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const IN_FILE = join(ROOT, 'data', 'follow-builders', 'latest.json');
const OUT_FILE = join(ROOT, 'data', 'follow-builders', 'latest-lite.json');

function excerpt(text, max = 240) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

async function main() {
  const raw = JSON.parse(await readFile(IN_FILE, 'utf8'));
  const lite = {
    schemaVersion: '1.0-lite',
    generatedAt: raw.generatedAt,
    date: raw.date,
    sourceStats: raw.sourceStats,
    items: []
  };

  for (const builder of raw.sources?.x || []) {
    for (const tweet of builder.tweets || []) {
      lite.items.push({
        type: 'x_post',
        author: builder.name,
        role: builder.role,
        url: tweet.url,
        publishedAt: tweet.createdAt,
        summary: excerpt(tweet.text, 220)
      });
    }
  }

  for (const ep of raw.sources?.podcasts || []) {
    lite.items.push({
      type: 'podcast_episode',
      podcast: ep.podcast,
      title: ep.title,
      url: ep.url,
      publishedAt: ep.publishedAt,
      summary: excerpt(ep.summary || ep.transcript, 400)
    });
  }

  for (const blog of raw.sources?.blogs || []) {
    lite.items.push({
      type: 'blog_post',
      source: blog.source,
      title: blog.title,
      url: blog.url,
      publishedAt: blog.publishedAt,
      summary: excerpt(blog.summary || blog.content, 400)
    });
  }

  lite.items.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

  await mkdir(join(ROOT, 'data', 'follow-builders'), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(lite, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, outFile: OUT_FILE, items: lite.items.length }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
