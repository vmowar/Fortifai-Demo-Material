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
        <strong key={idx} className="font-semibold text-[#163B66]">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      return (
        <code
          key={idx}
          className="rounded-[4px] bg-[#EEF2F7] px-1 py-0.5 font-mono-tabular text-[11px] font-medium text-[#163B66]"
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
    <div className="space-y-2 text-[12.5px] sm:text-[13px] leading-[1.58] text-[#4B5B6E]">
      {blocks.map((block, bIdx) => {
        if (block.type === 'bullets') {
          return (
            <ul key={bIdx} className="space-y-1.5 pl-0.5">
              {block.items.map((bullet, iIdx) => (
                <li key={iIdx} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2E5A8A] shrink-0"
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
    <div className="mx-auto max-w-[1120px] px-4 sm:px-6 pt-4 pb-10 space-y-4">
      {/* Editorial Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-1 max-w-[740px]">
          <span className="inline-flex items-center gap-1.5 rounded-[5px] px-2 py-0.5 fortifai-pill uppercase">
            <HelpCircle className="w-3 h-3 text-[#2E5A8A] shrink-0" />
            <span>{config.pillLabel}</span>
          </span>
          <h1 className="text-[21px] sm:text-[22px] font-medium leading-[1.2] tracking-[-0.02em] text-[#163B66] text-balance">
            {config.headline}
          </h1>
          <p className="text-[13px] leading-[1.52] text-[#4B5B6E]">
            {config.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {showLiveCmsButton && (
            <button
              type="button"
              onClick={onOpenCmsFaq}
              className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#E8F0F8] hover:bg-[#DCE8F5] border border-[#6699CC]/35 px-2.5 py-1.5 font-mono-tabular text-[10.5px] font-medium text-[#163B66] whitespace-nowrap transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3 text-[#2E5A8A]" />
              <span>Add / Edit FAQ in Live CMS</span>
            </button>
          )}

          <a
            href={bookDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors"
          >
            <span>Schedule Committee Briefing</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Search + Expand/Collapse Controls + 7 Category Filter Pills */}
      <section
        aria-label="Search and Filter Buyer Committee FAQ"
        className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-3.5 sm:p-4 fortifai-card-shadow space-y-2.5"
      >
        {/* Top Row: Live Keyword Search + Count + Expand All / Collapse All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-[560px]">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword, e.g., SAP, BOOT, privilege, customization..."
              aria-label="Search questions by keyword"
              className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] pl-8 pr-8 text-[12.5px] text-[#0D1520] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#163B66] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            <span className="font-mono-tabular text-[10.5px] font-medium text-[#64748B]">
              {filteredIndexedItems.length} OF {config.items.length} QUESTIONS
            </span>
            <button
              type="button"
              onClick={handleToggleExpandAll}
              disabled={filteredIndexedItems.length === 0}
              className="rounded-[7px] bg-[#F8FAFC] hover:bg-[#E8F0F8] border border-[#E5E7EB] px-2.5 py-1 font-mono-tabular text-[11px] font-medium text-[#163B66] whitespace-nowrap transition-colors cursor-pointer disabled:opacity-45"
            >
              {allFilteredOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Bottom Row: 7 Category Filter Pills */}
        <div
          role="tablist"
          aria-label="FAQ Category Filter"
          className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[#F1F5F9]"
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
                className={`rounded-[7px] px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                    : 'bg-[#F8FAFC] text-[#4B5B6E] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grouped Accordion Q&A Sections */}
      <div className="space-y-5">
        {groupedSections.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-6 text-center space-y-2 fortifai-card-shadow">
            <p className="text-[13px] text-[#4B5B6E]">
              No buyer diligence questions match your search or category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Questions');
                setSearchQuery('');
              }}
              className="rounded-[7px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-colors"
            >
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          groupedSections.map((group) => (
            <section
              key={group.category}
              aria-label={group.category}
              className="space-y-2"
            >
              {/* Category Group Header */}
              <div className="flex items-center justify-between gap-2.5 px-0.5">
                <h2 className="text-[13.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#163B66]">
                  {group.category}
                </h2>
                <div className="flex-1 h-[1px] bg-[#E5E7EB]" />
                <span className="font-mono-tabular text-[10.5px] font-medium text-[#64748B] whitespace-nowrap">
                  {group.entries.length}{' '}
                  {group.entries.length === 1 ? 'Q&A' : 'Q&As'}
                </span>
              </div>

              {/* Category Accordion Cards — Clean Row Without Repeated Category Eyebrow */}
              <div className="space-y-1.5">
                {group.entries.map(({ item, canonicalNumber }) => {
                  const isOpen = Boolean(openIds[item.id]);
                  return (
                    <article
                      key={item.id}
                      className={`rounded-[10px] bg-[#FFFFFF] border transition-colors fortifai-card-shadow overflow-hidden ${
                        isOpen ? 'border-[#2E5A8A]' : 'border-[#E5E7EB]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        aria-expanded={isOpen}
                        className="w-full px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`h-6 w-6 rounded-[6px] font-mono-tabular text-[10.5px] font-medium flex items-center justify-center shrink-0 transition-colors ${
                              isOpen
                                ? 'bg-[#163B66] text-[#FFFFFF]'
                                : 'bg-[#E8F0F8] text-[#2E5A8A]'
                            }`}
                          >
                            {canonicalNumber}
                          </span>
                          <h3 className="text-[13.5px] sm:text-[14px] font-medium leading-[1.35] text-[#163B66]">
                            {item.question}
                          </h3>
                        </div>

                        <ChevronDown
                          className={`w-3.5 h-3.5 text-[#64748B] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#2E5A8A]' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-3.5 pt-2 sm:pl-[52px] border-t border-[#F1F5F9]">
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
