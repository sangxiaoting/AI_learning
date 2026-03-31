import { LearningItem } from './types';

export const MOCK_DATA: LearningItem[] = [
  {
    id: '1',
    type: 'podcast',
    title: 'The Future of AGI & Agents',
    author: 'Lex Fridman Podcast #420',
    date: '2026-03-30',
    dateText: 'Today',
    duration: '1h 45min',
    tldr: 'AGI will arrive within 10 years, agents will automate most knowledge work. The podcast dives deep into the technical, ethical, and societal implications of artificial general intelligence and autonomous agents.',
    takeaways: [
      'Self-improving systems will accelerate AI progress exponentially',
      'Safety alignment is critical to prevent unintended consequences',
      'Real-world deployment requires robust testing and human oversight',
      'Agents will transform knowledge work by automating complex reasoning tasks',
      'Collaboration between humans and AI will be the key to maximizing benefits'
    ],
    quote: 'Intelligence is the ultimate power, and with great power comes great responsibility.',
    link: 'https://youtube.com',
    tags: ['AGI', 'Agents', 'Ethics', 'Self-improvement']
  },
  {
    id: '2',
    type: 'podcast',
    title: 'AI Product Management',
    author: 'The AI First Show',
    date: '2026-03-29',
    dateText: 'Mar 29',
    duration: '58min',
    tldr: 'AI products require user trust, clear value proposition, and rapid iteration cycles. Traditional PM methodologies need adaptation for AI-first products.',
    takeaways: [
      'PM skills for AI: technical literacy + user empathy + business acumen',
      'Evaluation metrics must balance performance and user experience',
      'UX design for AI requires transparency and explainability',
      'AI product roadmaps need flexibility for rapid technological changes',
      'Building trust is more important than raw performance for adoption'
    ],
    quote: 'Make AI invisible, make it useful - the best AI products feel like magic, not technology.',
    link: 'https://youtube.com',
    tags: ['Product', 'AI', 'UX', 'PM']
  },
  {
    id: '3',
    type: 'youtube',
    title: 'The State of AI Revolution',
    author: 'Andrej Karpathy',
    date: '2026-03-30',
    dateText: 'Today',
    duration: '45min',
    tldr: 'AI is undergoing a paradigm shift toward self-improvement and agentic behavior.',
    takeaways: [
      'Model scaling continues to show returns',
      'Reasoning capabilities are the next frontier',
      'Tool usage allows models to interact with the world',
      'Future research will focus on long-term planning'
    ],
    quote: 'Software 2.0 is the transition from code written by humans to code written by gradient descent.',
    link: 'https://youtube.com',
    tags: ['Revolution', 'AI'],
    detailedBreakdown: [
      {
        subtitle: 'The Shift to Agentic Behavior',
        points: [
          { label: '核心观点归纳', content: 'AI 正在从单纯的预测模型转变为能够自主规划和执行任务的智能体。' },
          { label: '关键数据/案例', content: '提及了 Devin 等自主编程智能体在处理复杂 GitHub Issue 时的表现。' },
          { label: 'AI PM 视角/启发', content: '产品设计的重点应从“对话框”转向“任务流”，关注模型如何调用工具。' }
        ]
      },
      {
        subtitle: 'Scaling Laws & Reasoning',
        points: [
          { label: '核心观点归纳', content: '虽然参数量仍在增加，但通过强化学习（RL）提升推理链（CoT）是当前的主要趋势。' },
          { label: '技术逻辑拆解', content: '详细拆解了模型在推理过程中如何通过自我博弈（Self-play）进行自我修正。' },
          { label: '局限与挑战', content: '提及了推理成本过高以及在长程任务中容易出现幻觉的问题。' }
        ]
      }
    ]
  },
  {
    id: '4',
    type: 'twitter',
    title: 'Key Insight by @sama',
    author: '@sama',
    date: '2026-03-30',
    dateText: 'Today',
    tldr: 'Systems that act independently are the next era.',
    takeaways: ['Models are just the beginning', 'Agency is the goal'],
    content: 'The next era of AI is not about models — it’s about systems that can act independently in the world.',
    link: 'https://twitter.com',
    tags: ['KeyInsight', 'AGI']
  }
];
