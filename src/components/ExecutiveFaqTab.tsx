import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  HelpCircle,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  ExecutiveFaqConfig,
  ExecutiveFaqItem,
  FAQ_CATEGORIES,
  FaqCategory,
} from '../config/briefingConfig';

type FaqFilter = 'All Questions' | FaqCategory;

const FAQ_FILTER_PILLS: readonly FaqFilter[] = [
  'All Questions',
  ...FAQ_CATEGORIES,
];

interface IndexedFaqItem {
  item: ExecutiveFaqItem;
  canonicalNumber: string;
}

/**
 * Safely renders inline **semibold** (weight 600 — never 700 bold) and `monospace` tokens
 * without dangerouslySetInnerHTML.
 */
function renderFormattedInline(text: string): React.ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const segments = text.split(tokenRegex);

  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#0F172A]">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      return (
        <code
          key={idx}
          className="rounded-[5px] bg-[#F5F5F7] border border-[#E5E7EB] px-1.5 py-0.5 font-mono-tabular text-[13px] font-medium text-[#163B66]"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{seg}</React.Fragment>;
  });
}

/**
 * Renders multi-line FAQ answers supporting paragraphs and `- ` bullet lists.
 */
function renderFormattedAnswer(answer: string): React.ReactNode {
  const lines = answer
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const blocks: (
    | { type: 'paragraph'; content: string }
    | { type: 'bullets'; items: string[] }
  )[] = [];

  for (const line of lines) {
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const bulletText = line.slice(2).trim();
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'bullets') {
        last.items.push(bulletText);
      } else {
        blocks.push({ type: 'bullets', items: [bulletText] });
      }
    } else {
      blocks.push({ type: 'paragraph', content: line });
    }
  }

  return (
    <div className="space-y-3 text-[14.5px] leading-[1.65] text-[#334155]">
      {blocks.map((block, bIdx) => {
        if (block.type === 'bullets') {
          return (
            <ul key={bIdx} className="space-y-2 pl-1">
              {block.items.map((bullet, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 rounded-full bg-[#163B66] shrink-0"
                  />
                  <span>{renderFormattedInline(bullet)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={bIdx}>{renderFormattedInline(block.content)}</p>;
      })}
    </div>
  );
}

interface ExecutiveFaqTabProps {
  config: ExecutiveFaqConfig;
  bookDemoUrl: string;
  showLiveCmsButton: boolean;
  onOpenCmsFaq: () => void;
}

export const ExecutiveFaqTab: React.FC<ExecutiveFaqTabProps> = ({
  config,
  bookDemoUrl,
  showLiveCmsButton,
  onOpenCmsFaq,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<FaqFilter>('All Questions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    const firstId = config.items[0]?.id;
    return firstId ? { [firstId]: true } : {};
  });

  // Preserve canonical 01..19+ numbering regardless of active filter
  const indexedItems: IndexedFaqItem[] = useMemo(
    () =>
      config.items.map((item, idx) => ({
        item,
        canonicalNumber: String(idx + 1).padStart(2, '0'),
      })),
    [config.items]
  );

  const filteredIndexedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return indexedItems.filter(({ item }) => {
      if (
        selectedCategory !== 'All Questions' &&
        item.category !== selectedCategory
      ) {
        return false;
      }
      if (!q) return true;
      const haystack =
        `${item.category} ${item.question} ${item.answer}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [indexedItems, selectedCategory, searchQuery]);

  // Group filtered items in canonical category order
  const groupedSections = useMemo(() => {
    return FAQ_CATEGORIES.map((category) => ({
      category,
      entries: filteredIndexedItems.filter(
        (entry) => entry.item.category === category
      ),
    })).filter((group) => group.entries.length > 0);
  }, [filteredIndexedItems]);

  const allFilteredOpen =
    filteredIndexedItems.length > 0 &&
    filteredIndexedItems.every(({ item }) => Boolean(openIds[item.id]));

  const handleToggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleExpandAll = () => {
    if (allFilteredOpen) {
      setOpenIds({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const { item } of filteredIndexedItems) {
      next[item.id] = true;
    }
    setOpenIds(next);
  };

  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-8 pb-16 space-y-8">
      {/* Editorial Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-[780px]">
          <span className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 fortifai-pill">
            <HelpCircle className="w-3.5 h-3.5 text-[#163B66] shrink-0" />
            <span>{config.pillLabel}</span>
          </span>
          <h1 className="text-[clamp(26px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.02em] text-[#163B66] text-balance">
            {config.headline}
          </h1>
          <p className="text-[15px] leading-[1.6] text-[#475569]">
            {config.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {showLiveCmsButton && (
            <button
              type="button"
              onClick={onOpenCmsFaq}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F5F5F7] border border-[#E5E7EB] px-3.5 py-2 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] uppercase text-[#163B66] whitespace-nowrap transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#163B66]" />
              <span>Add / Edit FAQ in Live CMS</span>
            </button>
          )}

          <a
            href={bookDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-4 py-2 text-[14px] font-medium whitespace-nowrap transition-colors"
          >
            <span>Schedule Committee Briefing</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Search + Expand/Collapse Controls + 7 Category Filter Pills */}
      <section
        aria-label="Search and Filter Buyer Committee FAQ"
        className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-6 sm:p-7 fortifai-card-shadow space-y-5"
      >
        {/* Top Row: Live Keyword Search + Count + Expand All / Collapse All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-[600px]">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword, e.g., SAP, BOOT, privilege, customization..."
              aria-label="Search questions by keyword"
              className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB] bg-[#FFFFFF] pl-10 pr-9 text-[14.5px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#163B66] focus:ring-2 focus:ring-[#163B66]/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#163B66] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="font-mono-tabular text-[12px] font-medium tracking-[0.05em] uppercase text-[#64748B]">
              {filteredIndexedItems.length} OF {config.items.length} QUESTIONS
            </span>
            <button
              type="button"
              onClick={handleToggleExpandAll}
              disabled={filteredIndexedItems.length === 0}
              className="rounded-[8px] bg-[#F5F5F7] hover:bg-[#E8F0F8] border border-[#E5E7EB] px-3.5 py-1.5 font-mono-tabular text-[12px] font-medium tracking-[0.04em] uppercase text-[#163B66] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-45"
            >
              {allFilteredOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Bottom Row: 7 Category Filter Pills */}
        <div
          role="tablist"
          aria-label="FAQ Category Filter"
          className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#E5E7EB]"
        >
          {FAQ_FILTER_PILLS.map((pill) => {
            const isActive = selectedCategory === pill;
            return (
              <button
                key={pill}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(pill)}
                className={`rounded-[8px] px-3.5 py-1.5 text-[14px] whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66] font-semibold'
                    : 'bg-[#FFFFFF] text-[#475569] border-[#E5E7EB] hover:bg-[#F5F5F7] hover:border-[#6699CC] hover:text-[#163B66] font-medium'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grouped Accordion Q&A Sections — Unified #FFFFFF Hairline Sheets per Category */}
      <div className="space-y-8">
        {groupedSections.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-10 text-center space-y-3 fortifai-card-shadow">
            <p className="text-[15px] text-[#475569]">
              No buyer diligence questions match your search or category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Questions');
                setSearchQuery('');
              }}
              className="rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-4 py-2 text-[14px] font-medium cursor-pointer transition-colors"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          groupedSections.map((group) => (
            <section
              key={group.category}
              aria-label={group.category}
              className="space-y-3"
            >
              {/* Category Group Header */}
              <div className="flex items-center justify-between gap-4 px-1">
                <h3 className="text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#163B66]">
                  {group.category}
                </h3>
                <div className="flex-1 h-[1px] bg-[#E5E7EB]" />
                <span className="font-mono-tabular text-[12px] font-medium tracking-[0.05em] uppercase text-[#64748B] whitespace-nowrap">
                  {group.entries.length}{' '}
                  {group.entries.length === 1 ? 'Q&A' : 'Q&As'}
                </span>
              </div>

              {/* Unified #FFFFFF Hairline Accordion Sheet (Zero Repeated Category Eyebrows) */}
              <div className="rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow divide-y divide-[#E5E7EB] overflow-hidden">
                {group.entries.map(({ item, canonicalNumber }) => {
                  const isOpen = Boolean(openIds[item.id]);
                  return (
                    <article
                      key={item.id}
                      className={
                        isOpen ? 'bg-[#F8FAFC]/45' : 'bg-[#FFFFFF] hover:bg-[#F8FAFC]/50 transition-colors'
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        aria-expanded={isOpen}
                        className="w-full px-6 sm:px-7 py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span
                            className={`rounded-[6px] px-2 py-0.5 font-mono-tabular text-[12px] font-medium tracking-[0.05em] shrink-0 transition-colors ${
                              isOpen
                                ? 'bg-[#163B66] text-[#FFFFFF]'
                                : 'bg-[#F5F5F7] border border-[#E5E7EB] text-[#64748B]'
                            }`}
                          >
                            {canonicalNumber}
                          </span>
                          <h3
                            className={`text-[17.5px] font-semibold leading-[1.35] tracking-[-0.01em] ${
                              isOpen ? 'text-[#163B66]' : 'text-[#0F172A]'
                            }`}
                          >
                            {item.question}
                          </h3>
                        </div>

                        <ChevronDown
                          className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#163B66]' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-6 sm:px-7 pb-6 pt-3 sm:pl-[68px] border-t border-[#E5E7EB]/75">
                          {renderFormattedAnswer(item.answer)}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};
