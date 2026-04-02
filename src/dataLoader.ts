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
  if (!date) return 'Unknown';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) return 'Today';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function normalizeFollowBuildersItems(payload: any): LearningItem[] {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return items
    .filter((item: any) => item.type === 'x_post')
    .map((item: any, index: number) => ({
      id: item.url || `follow-builders-${index}`,
      type: 'twitter' as const,
      title: `${item.author || 'Builder'} update`,
      author: item.author || 'Unknown',
      date: item.publishedAt || payload?.date || new Date().toISOString(),
      dateText: formatDateText(item.publishedAt || payload?.date),
      tldr: item.summary || 'No summary available.',
      takeaways: item.summary ? [item.summary] : [],
      content: item.summary || '',
      link: item.url || '#',
      tags: ['Follow Builders', 'X', ...(item.role ? [item.role] : [])],
    }));
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
