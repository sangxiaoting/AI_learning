import { LearningItem } from './types';
import { MOCK_DATA } from './mockData';

const YOUTUBE_DATA_URL = '/data/youtube/latest.json';

export async function loadLearningData(): Promise<LearningItem[]> {
  try {
    // 1. 尝试加载 YouTube 数据
    const youtubeResponse = await fetch(YOUTUBE_DATA_URL);
    if (!youtubeResponse.ok) {
      throw new Error(`HTTP ${youtubeResponse.status}: ${youtubeResponse.statusText}`);
    }
    const youtubeItems = await youtubeResponse.json();

    // 2. 验证并转换格式
    const validatedYoutubeItems = youtubeItems.map((item: any) => ({
      id: item.id,
      type: 'youtube' as const,
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

    // 3. 合并 mock data 中的非 YouTube 内容
    const nonYoutubeMock = MOCK_DATA.filter(item => item.type !== 'youtube');

    // 4. 按日期排序（最新的在前）
    const allItems = [...validatedYoutubeItems, ...nonYoutubeMock];
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`Loaded ${validatedYoutubeItems.length} YouTube items, ${nonYoutubeMock.length} mock items`);
    return allItems;
  } catch (error) {
    console.warn('Failed to load YouTube data, falling back to mock data:', error);
    return MOCK_DATA;
  }
}
