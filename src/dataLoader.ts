import { LearningItem } from './types';
import { MOCK_DATA } from './mockData';

const YOUTUBE_DATA_URL = '/data/youtube/latest.json';
const PODCAST_DATA_URL = '/data/podcast/latest.json';

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

async function loadJsonArray(url: string): Promise<any[]> {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Data file not found: ${url}, treating as empty`);
      return [];
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function loadLearningData(): Promise<LearningItem[]> {
  try {
    // 1. 并行加载远程数据源
    const [youtubeItems, podcastItems] = await Promise.all([
      loadJsonArray(YOUTUBE_DATA_URL),
      loadJsonArray(PODCAST_DATA_URL),
    ]);

    // 2. 验证并转换格式
    const validatedYoutubeItems = normalizeRemoteItems(youtubeItems, 'youtube');
    const validatedPodcastItems = normalizeRemoteItems(podcastItems, 'podcast');

    // 3. 合并 mock data 中的非远程内容
    const nonRemoteMock = MOCK_DATA.filter(
      item => item.type !== 'youtube' && item.type !== 'podcast'
    );

    // 4. 按日期排序（最新的在前）
    const allItems = [...validatedYoutubeItems, ...validatedPodcastItems, ...nonRemoteMock];
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(
      `Loaded ${validatedYoutubeItems.length} YouTube items, ${validatedPodcastItems.length} podcast items, ${nonRemoteMock.length} mock items`
    );
    return allItems;
  } catch (error) {
    console.warn('Failed to load remote data, falling back to mock data:', error);
    return MOCK_DATA;
  }
}
