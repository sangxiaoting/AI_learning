import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Podcast, 
  Youtube, 
  Twitter, 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  Lightbulb, 
  Quote, 
  Link as LinkIcon, 
  Bookmark, 
  Copy, 
  Share2, 
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameDay, parseISO } from 'date-fns';
import { cn } from './lib/utils';
import { LearningItem, ContentType } from './types';
import { MOCK_DATA } from './mockData';
import { loadLearningData } from './dataLoader';

// --- Components ---

interface TagBadgeProps {
  children: React.ReactNode;
  key?: React.Key;
}

const TagBadge = ({ children }: TagBadgeProps) => (
  <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
    {children}
  </span>
);

const TwitterCard = ({ item, onClick }: ContentCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.12), 0 8px 10px -6px rgba(14, 165, 233, 0.12)' }}
    onClick={onClick}
    className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100 cursor-pointer relative group transition-all"
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-50 flex-shrink-0">
          <Twitter className="w-5 h-5 text-sky-500" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
              {item.author}
            </h3>
            {item.sourceLabel && <TagBadge>{item.sourceLabel}</TagBadge>}
          </div>
          {item.role && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.role}</p>}
        </div>
      </div>
      <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap">{item.dateText}</span>
    </div>

    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-900 leading-relaxed line-clamp-4">
        {item.tldr}
      </p>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <div className="flex gap-1.5 flex-wrap">
        {item.tags.slice(0, 2).map(tag => (
          <TagBadge key={tag}>{tag}</TagBadge>
        ))}
      </div>
      <a
        href={item.link}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
      >
        查看原帖 <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  </motion.div>
);

interface ContentCardProps {
  item: LearningItem;
  onClick: () => void;
  key?: React.Key;
}

const ContentCard = ({ item, onClick }: ContentCardProps) => {
  const Icon = item.type === 'podcast' ? Podcast : item.type === 'youtube' ? Youtube : Twitter;
  const iconColor = item.type === 'podcast' ? 'text-purple-600' : item.type === 'youtube' ? 'text-red-600' : 'text-sky-500';
  const bgColor = item.type === 'podcast' ? 'bg-purple-50' : item.type === 'youtube' ? 'bg-red-50' : 'bg-sky-50';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer relative group transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", bgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium tracking-wider">
            {item.author} • {item.dateText}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          <span className="font-bold text-gray-900">摘要：</span> {item.tldr}
        </p>
        {item.type !== 'twitter' && item.takeaways.length > 0 && (
          <p className="text-sm text-gray-600 line-clamp-1">
            <span className="font-bold text-gray-900">要点：</span> {item.takeaways[0]}
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-1.5 flex-wrap">
        {item.tags.slice(0, 3).map(tag => (
          <TagBadge key={tag}>{tag}</TagBadge>
        ))}
      </div>

      <div className={cn(
        "absolute bottom-4 right-4 w-2 h-2 rounded-full",
        item.dateText === '今天' ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
      )} />
    </motion.div>
  );
};

const DetailModal = ({ item, onClose }: { item: LearningItem; onClose: () => void }) => {
  const [notes, setNotes] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0",
              item.type === 'podcast' ? 'bg-purple-50' : item.type === 'youtube' ? 'bg-red-50' : 'bg-sky-50'
            )}>
              {item.type === 'podcast' ? <Podcast className="w-10 h-10 text-purple-600" /> : 
               item.type === 'youtube' ? <Youtube className="w-10 h-10 text-red-600" /> : 
               <Twitter className="w-10 h-10 text-sky-500" />}
            </div>
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                {item.tags.map(tag => <TagBadge key={tag}>{tag}</TagBadge>)}
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-3">
                {item.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {item.author}</span>
                {item.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {item.duration}</span>}
                <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {item.dateText}</span>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Summary Card Section (For YouTube) */}
            {item.type === 'youtube' && (
              <section className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 shadow-sm">
                <h3 className="text-2xl font-black text-indigo-900 mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                  ⚡️ 摘要卡片 (Summary)
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2">TL;DR</h4>
                    <p className="text-xl text-gray-800 font-bold leading-relaxed">
                      {item.tldr}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> 核心要点 (Key Takeaways)
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.takeaways.map((point, i) => (
                        <li key={i} className="flex gap-3 items-start bg-white/60 p-3 rounded-xl border border-indigo-50">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.quote && (
                    <div>
                      <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Quote className="w-4 h-4" /> 金句摘录
                      </h4>
                      <div className="bg-white/80 p-5 rounded-2xl border-l-4 border-amber-400 italic text-lg text-gray-800 font-serif">
                        "{item.quote}"
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Standard Summary (For non-YouTube) */}
            {item.type !== 'youtube' && (
              <section className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                <h4 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" /> 摘要
                </h4>
                <p className="text-gray-700 leading-relaxed text-lg font-medium">
                  {item.tldr}
                </p>
              </section>
            )}

            {/* Detailed Breakdown (For YouTube) */}
            {item.type === 'youtube' && item.detailedBreakdown && (
              <section className="space-y-8">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  📖 深度拆解笔记 (Detailed Breakdown)
                </h3>
                
                <div className="space-y-12">
                  {item.detailedBreakdown.map((chapter, idx) => (
                    <div key={idx} className="relative pl-8 border-l-2 border-gray-100 pb-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-emerald-500" />
                      <h4 className="text-xl font-black text-gray-900 mb-6 group flex items-center gap-2">
                        {chapter.subtitle}
                      </h4>
                      <ul className="space-y-6">
                        {chapter.points.map((p, pIdx) => (
                          <li key={pIdx} className="group">
                            <div className="flex gap-3 items-start">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                              <p className="text-gray-700 leading-relaxed">
                                <strong className="text-gray-900 font-black mr-2">[{p.label}]</strong>: {p.content}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {item.type === 'twitter' && item.content && (
              <section className="space-y-5">
                <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                  <h4 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" /> 一句话总结
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-lg font-medium">
                    {item.tldr}
                  </p>
                </div>

                {item.takeaways.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="text-gray-900 font-bold mb-3">Digest</h4>
                    <p className="text-gray-700 leading-relaxed text-base">
                      {item.takeaways[0]}
                    </p>
                  </div>
                )}

                <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-xl">
                  <h4 className="text-sm font-bold text-sky-300 mb-4 tracking-wider">全文 / 原文</h4>
                  <p className="text-lg leading-relaxed font-serif whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </section>
            )}

            {item.type !== 'youtube' && item.takeaways.length > 0 && (
              <section>
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  关键要点
                </h3>
                <ul className="space-y-4">
                  {item.takeaways.map((point, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {item.type !== 'youtube' && item.quote && (
              <section>
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <Quote className="w-6 h-6 text-amber-500" />
                  金句摘录
                </h3>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-8 rounded-r-2xl italic text-2xl text-gray-800 font-serif leading-snug">
                  "{item.quote}"
                </div>
              </section>
            )}

            <section>
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-gray-400 rounded-full" />
                Personal Reflections
              </h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you learn? How will you apply this?"
                className="w-full p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[150px] transition-all text-gray-700"
              />
            </section>

            <div className="flex flex-wrap gap-3 pt-8 border-t border-gray-100">
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <ExternalLink className="w-4 h-4" /> View Original
              </a>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                <Bookmark className="w-4 h-4" /> Save
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [data, setData] = useState<LearningItem[]>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContentType | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);

  // Data Loading Logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loadedData = await loadLearningData();
        setData(loadedData);
      } catch (error) {
        console.error("Failed to load data, using mock data.", error);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = activeFilter === 'all' || item.type === activeFilter;
      const matchesDate = selectedDate === 'all' || item.date === selectedDate;

      return matchesSearch && matchesType && matchesDate;
    });
  }, [data, searchQuery, activeFilter, selectedDate]);

  const podcasts = filteredData.filter(i => i.type === 'podcast');
  const youtube = filteredData.filter(i => i.type === 'youtube');
  const twitter = filteredData.filter(i => i.type === 'twitter');

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Lightbulb className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 hidden sm:block">
              Learning<span className="text-indigo-600">Hub</span>
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索观点、作者或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 rounded-2xl outline-none transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-gray-400 tracking-widest">连续记录</span>
              <span className="text-sm font-black text-indigo-600">12 天</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters & Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'podcast', 'youtube', 'twitter'] as const).map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize",
                  activeFilter === type 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
                )}
              >
                {type === 'all' ? '全部来源' : type === 'podcast' ? '播客' : type === 'youtube' ? 'YouTube' : 'Twitter'}
              </button>
            ))}
            
            <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate('all')}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  selectedDate === 'all' ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-100"
                )}
              >
                全部时间
              </button>
              <button
                onClick={() => setSelectedDate('2026-03-30')}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  selectedDate === '2026-03-30' ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-100"
                )}
              >
                今天
              </button>
            </div>
          </div>

          <div className="flex items-center gap-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex gap-1">
              {[0.8, 0.9, 0.4, 0.2, 0, 0.7, 0.5].map((opacity, i) => (
                <div 
                  key={i} 
                  className="w-4 h-4 rounded-sm bg-emerald-500" 
                  style={{ opacity: opacity || 0.1 }} 
                />
              ))}
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="block text-xs font-bold text-gray-400">总计</span>
                <span className="font-black text-gray-900">{data.length} 条</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400">新增</span>
                <span className="font-black text-emerald-600">+3 今日</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Podcasts */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Podcast className="w-5 h-5 text-purple-600" />
                播客
              </h2>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{podcasts.length}</span>
            </div>
            <div className="space-y-5">
              {podcasts.map(item => (
                <ContentCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
              ))}
              {podcasts.length === 0 && <EmptyState />}
            </div>
          </section>

          {/* YouTube */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                YouTube
              </h2>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{youtube.length}</span>
            </div>
            <div className="space-y-5">
              {youtube.map(item => (
                <ContentCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
              ))}
              {youtube.length === 0 && <EmptyState />}
            </div>
          </section>

          {/* Twitter */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Twitter className="w-5 h-5 text-sky-500" />
                Builder 动态
              </h2>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{twitter.length}</span>
            </div>
            <div className="space-y-5">
              {twitter.map(item => (
                <TwitterCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
              ))}
              {twitter.length === 0 && <EmptyState />}
            </div>
          </section>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
      <p className="text-sm text-gray-400 font-medium">这个筛选条件下还没有内容。</p>
    </div>
  );
}
