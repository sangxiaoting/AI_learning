#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const ROOT = process.cwd();
const USER_CONFIG = join(homedir(), '.follow-builders', 'config.json');
const IN_FILE = join(ROOT, 'data', 'follow-builders', 'latest.json');
const OUT_FILE = join(ROOT, 'data', 'follow-builders', 'latest-lite.json');

function excerpt(text, max = 240) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

function stripUrls(text = '') {
  return text.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
}

function zhRole(role) {
  if (!role) return '';
  return excerpt(
    stripUrls(String(role))
      .replace(/\bceo\b/ig, 'CEO')
      .replace(/\bhead of product\b/ig, '产品负责人')
      .replace(/\bproduct at\b/ig, '任职于')
      .replace(/\bpartner\b/ig, '合伙人')
      .replace(/\bpresident & ceo\b/ig, '总裁兼 CEO')
      .replace(/\bfounder\b/ig, '创始人')
      .replace(/\bclaude code\b/ig, 'Claude Code')
      .replace(/\bprev:.*$/ig, '')
      .replace(/\|.*$/g, '')
      .trim(),
    60
  );
}

function zhTweetSummary(author, text) {
  const clean = excerpt(stripUrls(text), 140);
  if (!clean) return `${author} 今天分享了一则更新。`;

  if (/agent/i.test(clean)) return `${author} 提到 agent 相关进展：${clean}`;
  if (/model|llm|gpt|claude|mistral/i.test(clean)) return `${author} 分享了对模型发展的看法：${clean}`;
  if (/launch|released|introduc|coming soon|support/i.test(clean)) return `${author} 发布了新的产品或功能动态：${clean}`;
  if (/growth|signup|revenue|users|mom/i.test(clean)) return `${author} 分享了业务增长相关数据：${clean}`;
  if (/think|argue|believe|love|never|should/i.test(clean)) return `${author} 表达了一个鲜明观点：${clean}`;
  return `${author} 的最新动态：${clean}`;
}

function zhTweetTitle(author, text) {
  const clean = excerpt(stripUrls(text), 36);
  if (!clean) return `${author} 的最新观点`;
  return clean;
}

function zhPodcastSummary(title, text) {
  const clean = excerpt(stripUrls(text), 220);
  return clean ? `这期播客围绕《${title}》展开，核心内容包括：${clean}` : `这期播客《${title}》值得关注。`;
}

function zhBlogSummary(title, text) {
  const clean = excerpt(stripUrls(text), 220);
  return clean ? `这篇文章《${title}》的重点是：${clean}` : `这篇文章《${title}》值得一读。`;
}

async function main() {
  const raw = JSON.parse(await readFile(IN_FILE, 'utf8'));
  const config = JSON.parse(await readFile(USER_CONFIG, 'utf8'));
  const language = config.language || 'en';

  const lite = {
    schemaVersion: '1.0-lite',
    generatedAt: raw.generatedAt,
    date: raw.date,
    language,
    sourceStats: raw.sourceStats,
    items: []
  };

  for (const builder of raw.sources?.x || []) {
    for (const tweet of builder.tweets || []) {
      const plain = stripUrls(tweet.text || '');
      lite.items.push({
        type: 'x_post',
        author: builder.name,
        role: language === 'zh' ? zhRole(builder.role) : builder.role,
        url: tweet.url,
        publishedAt: tweet.createdAt,
        title: language === 'zh' ? zhTweetTitle(builder.name, plain) : excerpt(plain, 60),
        summary: language === 'zh' ? zhTweetSummary(builder.name, plain) : excerpt(plain, 220)
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
      summary: language === 'zh' ? zhPodcastSummary(ep.title, ep.summary || ep.transcript) : excerpt(ep.summary || ep.transcript, 400)
    });
  }

  for (const blog of raw.sources?.blogs || []) {
    lite.items.push({
      type: 'blog_post',
      source: blog.source,
      title: epOrTitle(blog.title),
      url: blog.url,
      publishedAt: blog.publishedAt,
      summary: language === 'zh' ? zhBlogSummary(blog.title, blog.summary || blog.content) : excerpt(blog.summary || blog.content, 400)
    });
  }

  lite.items.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

  await mkdir(join(ROOT, 'data', 'follow-builders'), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(lite, null, 2) + '\n');
  console.log(JSON.stringify({ ok: true, outFile: OUT_FILE, items: lite.items.length, language }, null, 2));
}

function epOrTitle(title) {
  return title || 'Untitled';
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
