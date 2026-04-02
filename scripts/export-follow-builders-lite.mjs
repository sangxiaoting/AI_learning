#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const IN_FILE = join(ROOT, 'data', 'follow-builders', 'digest-zh.json');
const OUT_FILE = join(ROOT, 'data', 'follow-builders', 'latest-lite.json');

async function main() {
  const raw = JSON.parse(await readFile(IN_FILE, 'utf8'));
  const lite = {
    schemaVersion: '1.1-lite',
    generatedAt: raw.generatedAt,
    date: raw.date,
    language: raw.language,
    sourceStats: raw.sourceStats,
    items: []
  };

  for (const builder of raw.twitterDigest || []) {
    for (const post of builder.posts || []) {
      lite.items.push({
        type: 'x_post',
        author: builder.author,
        role: builder.role,
        url: post.url,
        publishedAt: post.publishedAt,
        title: post.title,
        summary: post.summary
      });
    }
  }

  for (const ep of raw.podcastDigest || []) {
    lite.items.push(ep);
  }

  for (const blog of raw.blogDigest || []) {
    lite.items.push(blog);
  }

  lite.items.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

  await mkdir(join(ROOT, 'data', 'follow-builders'), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(lite, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, outFile: OUT_FILE, items: lite.items.length, schemaVersion: lite.schemaVersion }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
