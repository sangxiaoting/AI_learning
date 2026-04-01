export type ContentType = 'podcast' | 'youtube' | 'twitter';

export interface ChapterPoint {
  label: string;
  content: string;
}

export interface Chapter {
  subtitle: string;
  points: ChapterPoint[];
}

export interface LearningItem {
  id: string;
  type: ContentType;
  title: string;
  author: string;
  date: string; // ISO format YYYY-MM-DD
  dateText: string;
  duration?: string;
  tldr: string;
  takeaways: string[];
  quote?: string;
  link: string;
  tags: string[];
  content?: string; // For twitter threads
  detailedBreakdown?: Chapter[]; // For YouTube
}

export interface ActivityData {
  date: string;
  count: number;
}
