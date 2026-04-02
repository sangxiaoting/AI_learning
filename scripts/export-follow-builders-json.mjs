#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';

const USER_DIR = join(homedir(), '.follow-builders');
const CONFIG_PATH = join(USER_DIR, 'config.json');
const ROOT = process.cwd();
const SKILL_DIR = join(ROOT, 'skills', 'follow-builders');
const OUT_DIR = join(ROOT, 'data', 'follow-builders');

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function pickRoleFromBio(bio) {
  if (!bio) return null;
  return bio.replace(/\s+/g, ' ').trim();
}

function normalizeTweetBuilder(builder) {
  return {
    type: 'x_builder',
    name: builder.name || builder.username || null,
    username: builder.username || null,
    bio: builder.bio || null,
    role: pickRoleFromBio(builder.bio),
    profileUrl: builder.url || (builder.username ? `https://x.com/${builder.username.replace(/^@/, '')}` : null),
    tweets: Array.isArray(builder.tweets) ? builder.tweets.map(t => ({
      id: t.id || null,
      text: t.text || '',
      url: t.url || null,
      createdAt: t.createdAt || null
    })) : []
  };
}

function normalizePodcast(p) {
  return {
    type: 'podcast_episode',
    podcast: p.name || null,
    title: p.title || null,
    url: p.url || null,
    publishedAt: p.publishedAt || p.date || null,
    transcript: p.transcript || null,
    summary: p.summary || null
  };
}

function normalizeBlog(b) {
  return {
    type: 'blog_post',
    source: b.source || b.name || null,
    title: b.title || null,
    url: b.url || null,
    publishedAt: b.publishedAt || b.date || null,
    content: b.content || null,
    summary: b.summary || null
  };
}

async function main() {
  const config = existsSync(CONFIG_PATH) ? await readJson(CONFIG_PATH) : {};
  const feedX = await readJson(join(SKILL_DIR, 'feed-x.json'));
  const feedPodcasts = await readJson(join(SKILL_DIR, 'feed-podcasts.json'));
  const feedBlogs = await readJson(join(SKILL_DIR, 'feed-blogs.json'));

  const xItems = Array.isArray(feedX.x) ? feedX.x.map(normalizeTweetBuilder) : [];
  const podcastItems = Array.isArray(feedPodcasts.podcasts) ? feedPodcasts.podcasts.map(normalizePodcast) : [];
  const blogItems = Array.isArray(feedBlogs.blogs) ? feedBlogs.blogs.map(normalizeBlog) : [];

  const generatedAt = new Date().toISOString();
  const date = generatedAt.slice(0, 10);
  const payload = {
    schemaVersion: '1.0',
    generatedAt,
    date,
    config: {
      platform: config.platform || 'openclaw',
      language: config.language || 'zh',
      timezone: config.timezone || 'Asia/Shanghai',
      frequency: config.frequency || 'daily',
      deliveryTime: config.deliveryTime || null,
      delivery: config.delivery || null
    },
    sourceStats: {
      xBuilders: xItems.length,
      totalTweets: xItems.reduce((sum, item) => sum + item.tweets.length, 0),
      podcastEpisodes: podcastItems.length,
      blogPosts: blogItems.length,
      feedsGeneratedAt: feedX.generatedAt || feedPodcasts.generatedAt || feedBlogs.generatedAt || null
    },
    sources: {
      x: xItems,
      podcasts: podcastItems,
      blogs: blogItems
    }
  };

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(join(OUT_DIR, 'history'), { recursive: true });
  await writeFile(join(OUT_DIR, 'latest.json'), JSON.stringify(payload, null, 2) + '\n');
  await writeFile(join(OUT_DIR, 'history', `${date}.json`), JSON.stringify(payload, null, 2) + '\n');

  console.log(JSON.stringify({ ok: true, outDir: OUT_DIR, date, files: ['latest.json', `history/${date}.json`] }, null, 2));
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
