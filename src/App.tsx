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
  Bookmark,
  Share2,
  X,
  ExternalLink,
  Sparkles,
  ListChecks,
  MessagesSquare,
  BookOpen,
  HelpCircle,
  Target,
  Library,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { LearningItem, ContentType, InsightGroup } from './types';
import { MOCK_DATA } from './mockData';
import { loadLearningData } from './dataLoader';

interface TagBadgeProps {
  children: React.ReactNode;
  key?: React.Key;
}

const TagBadge = ({ children }: TagBadgeProps) => (
  <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
    {children}
  </span>
);

function normalizeStringList(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

interface SummaryTopic {
  title: string;
  points: string[];
}

function parseSummaryTopics(summary?: string): SummaryTopic[] {
  if (!summary) return [];

  const blocks = summary
    .split(/\n\s*\n+/)
    .map(block => block.trim())
    .filter(Boolean);

  const topics = blocks
    .map((block) => {
      const lines = block
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return null;

      const titleLine = lines[0]
        .replace(/^[-•*#\d\.\s]+/, '')
        .replace(/^[：:]/, '')
        .trim();

      const contentLines = lines.slice(1);
      const points = contentLines.length > 0
        ? contentLines.map(line => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
        : block
            .split(/(?=核心观点：|为什么重要：|支撑论据\/案例：|对现实的启发：)/)
            .map(part => part.trim())
            .filter(Boolean);

      return {
        title: titleLine || '主题摘要',
        points,
      };
    })
    .filter((topic): topic is SummaryTopic => Boolean(topic && (topic.title || topic.points.length)));

  if (topics.length > 0) return topics;

  return [{
    title: '深度摘要',
    points: summary
      .split(/(?=核心观点：|为什么重要：|支撑论据\/案例：|对现实的启发：)/)
      .map(part => part.trim())
      .filter(Boolean),
  }];
}

function SummaryTimeline({ summary }: { summary?: string }) {
  const topics = parseSummaryTopics(summary);

  if (topics.length === 0) return null;

  return (
    <div className="space-y-10">
      {topics.map((topic, idx) => (
        <div key={`${topic.title}-${idx}`} className="relative pl-8">
          {idx !== topics.length - 1 && (
            <div className="absolute left-[11px] top-7 bottom-[-32px] w-px bg-emerald-100" />
          )}
          <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-emerald-400 bg-white shadow-sm" />

          <div className="space-y-4">
            <h4 className="text-xl font-black text-gray-900 leading-relaxed">{topic.title}</h4>
            <div className="space-y-4">
              {topic.points.map((point, pointIdx) => (
                <div key={pointIdx} className="flex items-start gap-3 pl-2">
                  <span className="mt-2.5 w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <p className="text-[15px] text-gray-700 leading-8 font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightGroupsSection({ groups }: { groups: InsightGroup[] }) {
  if (!groups.length) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
        <h3 className="text-2xl font-black text-gray-900">深度摘要</h3>
      </div>

      <div className="space-y-10">
        {groups.map((group, idx) => (
          <div key={`${group.title}-${idx}`} className="relative pl-8">
            {idx !== groups.length - 1 && (
              <div className="absolute left-[11px] top-7 bottom-[-32px] w-px bg-emerald-100" />
            )}
            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-emerald-400 bg-white shadow-sm" />

            <div className="space-y-5">
              <h4 className="text-xl font-black text-gray-900 leading-relaxed">{group.title}</h4>

              {group.corePoint && (
                <div className="rounded-2xl bg-emerald-50/80 border border-emerald-100 p-5">
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">核心观点</p>
                  <p className="text-base text-gray-800 font-bold leading-8">{group.corePoint}</p>
                </div>
              )}

              <div className="space-y-4">
                {group.whyImportant && (
                  <div className="flex items-start gap-3 pl-2">
                    <span className="mt-2.5 w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-gray-900 mb-1">为什么重要</p>
                      <p className="text-[15px] text-gray-700 leading-8 font-medium">{group.whyImportant}</p>
                    </div>
                  </div>
                )}

                {group.evidence && (
                  <div className="flex items-start gap-3 pl-2">
                    <span className="mt-2.5 w-2.5 h-2.5 rounded-full bg-sky-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-gray-900 mb-1">案例支撑</p>
                      <p className="text-[15px] text-gray-700 leading-8 font-medium">{group.evidence}</p>
                    </div>
                  </div>
                )}

                {group.implication && (
                  <div className="flex items-start gap-3 pl-2">
                    <span className="mt-2.5 w-2.5 h-2.5 rounded-full bg-fuchsia-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-black text-gray-900 mb-1">启发</p>
                      <p className="text-[15px] text-gray-700 leading-8 font-medium">{group.implication}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

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

const PodcastCard = ({ item, onClick }: ContentCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.10), 0 8px 10px -6px rgba(124, 58, 237, 0.10)' }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 cursor-pointer relative group transition-all"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 flex-shrink-0">
          <Podcast className="w-5 h-5 text-purple-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-purple-600 transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium tracking-wider mt-1">
            {item.author} • {item.dateText}{item.duration ? ` • ${item.duration}` : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold text-purple-700 mb-1">总结</p>
          <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
            {item.tldr}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5 flex-wrap pr-6">
        {item.tags.slice(0, 3).map(tag => (
          <TagBadge key={tag}>{tag}</TagBadge>
        ))}
      </div>

      <div className={cn(
        'absolute bottom-4 right-4 w-2 h-2 rounded-full',
        item.dateText === '今天' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
      )} />
    </motion.div>
  );
};

const ContentCard = ({ item, onClick }: ContentCardProps) => {
  if (item.type === 'podcast') {
    return <PodcastCard item={item} onClick={onClick} />;
  }

  const Icon = item.type === 'youtube' ? Youtube : Twitter;
  const iconColor = item.type === 'youtube' ? 'text-red-600' : 'text-sky-500';
  const bgColor = item.type === 'youtube' ? 'bg-red-50' : 'bg-sky-50';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer relative group transition-all"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0', bgColor)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium tracking-wider mt-1">
            {item.author} • {item.dateText}{item.duration ? ` • ${item.duration}` : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold text-red-700 mb-1">总结</p>
          <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
            {item.tldr}
          </p>
        </div>
      </div>

      {/* Tags hidden */}

      <div className={cn(
        'absolute bottom-4 right-4 w-2 h-2 rounded-full',
        item.dateText === '今天' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
      )} />
    </motion.div>
  );
};

const DetailModal = ({ item, onClose }: { item: LearningItem; onClose: () => void }) => {
  const [notes, setNotes] = useState('');
  const whyItMattersList = normalizeStringList(item.whyItMatters);
  const insightGroups = item.insightGroups || [];
  const hasPodcastStructuredContent = item.type === 'podcast' && (
    item.takeaways.length > 0 ||
    Boolean(item.quote) ||
    insightGroups.length > 0 ||
    Boolean(item.summaryLong) ||
    (item.actionableAdvice?.length ?? 0) > 0 ||
    (item.references?.length ?? 0) > 0 ||
    (item.contrarianPoints?.length ?? 0) > 0 ||
    (item.openQuestions?.length ?? 0) > 0 ||
    whyItMattersList.length > 0
  );

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
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
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
              'w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0',
              item.type === 'podcast' ? 'bg-purple-50' : item.type === 'youtube' ? 'bg-red-50' : 'bg-sky-50'
            )}>
              {item.type === 'podcast' ? <Podcast className="w-10 h-10 text-purple-600" /> :
               item.type === 'youtube' ? <Youtube className="w-10 h-10 text-red-600" /> :
               <Twitter className="w-10 h-10 text-sky-500" />}
            </div>
            <div className="flex-1">
              <div className="flex gap-2 mb-3 flex-wrap">
                {item.tags.map(tag => <TagBadge key={tag}>{tag}</TagBadge>)}
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-3">
                {item.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {item.author}</span>
                {item.guest && <span className="flex items-center gap-1.5"><MessagesSquare className="w-4 h-4" /> {item.guest}</span>}
                {item.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {item.duration}</span>}
                <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {item.dateText}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
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

            {item.type === 'podcast' && (
              <>
                <section className="bg-gradient-to-br from-purple-50 via-white to-violet-50 rounded-3xl p-8 border border-purple-100 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                    <h3 className="text-2xl font-black text-purple-900 flex items-center gap-3">
                      <div className="w-2 h-8 bg-purple-600 rounded-full" />
                      播客详情卡片
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {item.tags.slice(0, 3).map(tag => <TagBadge key={tag}>{tag}</TagBadge>)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 rounded-2xl bg-white/90 border border-purple-100 p-5">
                      <h4 className="text-sm font-black text-purple-500 uppercase tracking-widest mb-2">总结</h4>
                      <p className="text-lg text-gray-800 font-bold leading-relaxed">{item.tldr}</p>
                    </div>

                    {item.quote && (
                      <div className="rounded-2xl bg-purple-100/70 border border-purple-200 p-5">
                        <h4 className="text-sm font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Quote className="w-4 h-4" /> 金句
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed italic">“{item.quote}”</p>
                      </div>
                    )}
                  </div>
                </section>

                {hasPodcastStructuredContent && (
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {item.takeaways.length > 0 && (
                      <SectionCard title="核心要点" icon={<ListChecks className="w-5 h-5 text-purple-600" />}>
                        <ul className="space-y-3">
                          {item.takeaways.map((point, i) => (
                            <li key={i} className="flex gap-3 items-start rounded-xl bg-purple-50/60 px-4 py-3 border border-purple-100">
                              <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </SectionCard>
                    )}

                    {whyItMattersList.length > 0 && (
                      <SectionCard title="为什么值得看" icon={<Sparkles className="w-5 h-5 text-amber-500" />}>
                        <ul className="space-y-3">
                          {whyItMattersList.map((point, idx) => (
                            <li key={idx} className="flex gap-3 items-start text-gray-700 leading-relaxed">
                              <span className="mt-2 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </SectionCard>
                    )}

                    {item.actionableAdvice && item.actionableAdvice.length > 0 && (
                      <SectionCard title="可执行建议" icon={<Target className="w-5 h-5 text-emerald-500" />}>
                        <ul className="space-y-3">
                          {item.actionableAdvice.map((point, idx) => (
                            <li key={idx} className="flex gap-3 items-start text-gray-700 leading-relaxed">
                              <span className="mt-2 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </SectionCard>
                    )}

                    {item.contrarianPoints && item.contrarianPoints.length > 0 && (
                      <SectionCard title="反直觉观点" icon={<Lightbulb className="w-5 h-5 text-fuchsia-500" />}>
                        <ul className="space-y-3">
                          {item.contrarianPoints.map((point, idx) => (
                            <li key={idx} className="flex gap-3 items-start text-gray-700 leading-relaxed">
                              <span className="mt-2 w-2 h-2 rounded-full bg-fuchsia-400 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </SectionCard>
                    )}

                    {item.openQuestions && item.openQuestions.length > 0 && (
                      <SectionCard title="开放问题" icon={<HelpCircle className="w-5 h-5 text-rose-500" />}>
                        <ul className="space-y-3">
                          {item.openQuestions.map((point, idx) => (
                            <li key={idx} className="flex gap-3 items-start text-gray-700 leading-relaxed">
                              <span className="mt-2 w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </SectionCard>
                    )}

                    {item.references && item.references.length > 0 && (
                      <SectionCard title="关键概念" icon={<Library className="w-5 h-5 text-sky-500" />}>
                        <div className="grid grid-cols-1 gap-4">
                          {item.references.map((ref, idx) => (
                            <div key={idx} className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                              <h4 className="font-bold text-gray-900 mb-2">{ref.term}</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{ref.desc}</p>
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    )}
                  </section>
                )}

                {insightGroups.length > 0 ? (
                  <InsightGroupsSection groups={insightGroups} />
                ) : item.summaryLong ? (
                  <SectionCard title="深度摘要" icon={<BookOpen className="w-5 h-5 text-indigo-500" />}>
                    <SummaryTimeline summary={item.summaryLong} />
                  </SectionCard>
                ) : null}
              </>
            )}

            {item.type !== 'youtube' && item.type !== 'podcast' && (
              <section className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                <h4 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" /> 摘要
                </h4>
                <p className="text-gray-700 leading-relaxed text-lg font-medium">
                  {item.tldr}
                </p>
              </section>
            )}

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
                <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-xl">
                  <h4 className="text-sm font-bold text-sky-300 mb-4 tracking-wider">中文转录</h4>
                  <p className="text-lg leading-relaxed font-serif whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                {item.quote && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="text-gray-900 font-bold mb-3">原文</h4>
                    <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                      {item.quote}
                    </p>
                  </div>
                )}
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

export default function App() {
  const [data, setData] = useState<LearningItem[]>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContentType | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loadedData = await loadLearningData();
        setData(loadedData);
      } catch (error) {
        console.error('Failed to load data, using mock data.', error);
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'podcast', 'youtube', 'twitter'] as const).map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize',
                  activeFilter === type
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
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
                  'px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                  selectedDate === 'all' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
                )}
              >
                全部时间
              </button>
              <button
                onClick={() => setSelectedDate('2026-03-30')}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                  selectedDate === '2026-03-30' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      <AnimatePresence>
        {selectedItem && (
          <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>

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
