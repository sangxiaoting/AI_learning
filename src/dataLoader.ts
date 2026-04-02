import { LearningItem } from './types';
import { MOCK_DATA } from './mockData';

const YOUTUBE_DATA_URL = '/data/youtube/latest.json';
const PODCAST_DATA_URL = '/data/podcast/latest.json';
const FOLLOW_BUILDERS_DATA_URL = '/data/follow-builders/latest-lite.json';

function normalizeRemoteItems(items: any[], type: 'youtube' | 'podcast'): LearningItem[] {
  return items.map((item: any) => ({
    id: item.id,
    type,
    title: item.title,
    author: item.author,
    date: item.date,
    dateText: item.dateText,
    duration: item.duration,
    tldr: item.tldr,
    takeaways: item.takeaways,
    quote: item.quote,
    link: item.link,
    tags: item.tags,
    detailedBreakdown: item.detailedBreakdown,
  }));
}

function formatDateText(date?: string): string {
  if (!date) return '未知';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) return '今天';
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function cleanText(text?: string, max = 180): string {
  if (!text) return '';
  const cleaned = String(text)
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  return cleaned.length > max ? cleaned.slice(0, max - 1).trimEnd() + '…' : cleaned;
}

function shortenRole(role?: string): string | undefined {
  if (!role) return undefined;
  const cleaned = cleanText(role, 90)
    .replace(/\b(prev|previous|join|links?|youtube|github)\b.*$/i, '')
    .replace(/[|•·]+$/g, '')
    .trim();
  return cleaned || undefined;
}

function buildTwitterTitle(author: string, summary?: string): string {
  const cleaned = cleanText(summary, 72);
  if (!cleaned) return `${author} 观点`;
  return cleaned;
}

function buildTwitterTakeaways(summary?: string): string[] {
  const cleaned = cleanText(summary, 220);
  if (!cleaned) return [];
  return [cleaned];
}

function normalizeFollowBuildersItems(payload: any): LearningItem[] {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return items
    .filter((item: any) => item.type === 'x_post')
    .map((item: any, index: number) => {
      const author = item.author || '未知作者';
      const role = shortenRole(item.role);
      const summary = cleanText(item.summary, 220) || '暂无摘要。';
      return {
        id: item.url || `follow-builders-${index}`,
        type: 'twitter' as const,
        title: buildTwitterTitle(author, item.summary),
        author,
        role,
        sourceLabel: 'Builder 动态',
        date: item.publishedAt || payload?.date || new Date().toISOString(),
        dateText: formatDateText(item.publishedAt || payload?.date),
        tldr: summary,
        takeaways: buildTwitterTakeaways(item.summary),
        content: summary,
        link: item.url || '#',
        tags: ['Builder 动态', 'X'],
      };
    })
    .filter((item: LearningItem) => item.content && item.content.length > 12);
}

async function loadJson(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Data file not found: ${url}, treating as empty`);
      return null;
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function loadJsonArray(url: string): Promise<any[]> {
  const data = await loadJson(url);
  return Array.isArray(data) ? data : [];
}

export async function loadLearningData(): Promise<LearningItem[]> {
  try {
    const [youtubeItems, podcastItems, followBuildersPayload] = await Promise.all([
      loadJsonArray(YOUTUBE_DATA_URL),
      loadJsonArray(PODCAST_DATA_URL),
      loadJson(FOLLOW_BUILDERS_DATA_URL),
    ]);

    const validatedYoutubeItems = normalizeRemoteItems(youtubeItems, 'youtube');
    const validatedPodcastItems = normalizeRemoteItems(podcastItems, 'podcast');
    const twitterItems = normalizeFollowBuildersItems(followBuildersPayload);

    const nonRemoteMock = MOCK_DATA.filter(
      item => item.type !== 'youtube' && item.type !== 'podcast' && item.type !== 'twitter'
    );

    const allItems = [...validatedYoutubeItems, ...validatedPodcastItems, ...twitterItems, ...nonRemoteMock];
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(
      `Loaded ${validatedYoutubeItems.length} YouTube items, ${validatedPodcastItems.length} podcast items, ${twitterItems.length} follow-builders items, ${nonRemoteMock.length} mock items`
    );
    return allItems;
  } catch (error) {
    console.warn('Failed to load remote data, falling back to mock data:', error);
    return MOCK_DATA;
  }
}
