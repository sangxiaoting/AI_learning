export type ContentType = 'podcast' | 'youtube' | 'twitter';

export interface ChapterPoint {
  label: string;
  content: string;
}

export interface Chapter {
  subtitle: string;
  points: ChapterPoint[];
}

export interface ReferenceItem {
  term: string;
  desc: string;
}

export interface InsightGroup {
  title: string;
  corePoint?: string;
  whyImportant?: string;
  evidence?: string;
  implication?: string;
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
  content?: string; // For twitter translated/full content
  detailedBreakdown?: Chapter[] | null; // For YouTube / optional rich breakdown
  role?: string;
  sourceLabel?: string;
  whyItMatters?: string | string[];
  originalText?: string;
  contentType?: string;
  confidence?: number;
  guest?: string;
  summaryLong?: string;
  insightGroups?: InsightGroup[];
  actionableAdvice?: string[];
  references?: ReferenceItem[];
  contrarianPoints?: string[];
  openQuestions?: string[];
}

export interface ActivityData {
  date: string;
  count: number;
}
