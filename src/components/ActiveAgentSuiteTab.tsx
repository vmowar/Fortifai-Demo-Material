import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { DataRoomTab } from '../config/briefingConfig';
import {
  AGENT_SUITE_FILTERS,
  AgentSuiteCategory,
  CANONICAL_AGENTS,
} from '../data/canonicalAgents';

interface ActiveAgentSuiteTabProps {
  tab: DataRoomTab;
}

/**
 * Tab 03 (03 · Active Agent Suite) — Native Daylight Editorial 17-Agent Catalogue
 * - #F6F7F9 canvas, crisp #FFFFFF cards (1px solid #E5E7EB), suite eyebrow pill,
 *   01–17 index badge, live search input, and suite filter pills with zero hardcoded counts.
 */
export const ActiveAgentSuiteTab: React.FC<ActiveAgentSuiteTabProps> = ({
  tab,
}) => {
  const [selectedSuite, setSelectedSuite] = useState<AgentSuiteCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const pageEyebrow =
    tab.utilityEyebrow ?? 'FORTIFAI SARA · SPECIALIZED AGENT CATALOGUE';
  const pageTitle = tab.utilityTitle || 'Active Domain Agent Suite';
  const pageSubtitle =
    tab.utilitySubtitle ??
    'Specialized domain agents executing natively inside your private cloud on Fortifai SARA—combining deterministic verification, Fortifai D7 external corroboration, and plain-English audit dossiers.';

  const filteredAgents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return CANONICAL_AGENTS.filter((agent) => {
      const matchesSuite =
        selectedSuite === 'ALL' || agent.suite === selectedSuite;
      if (!matchesSuite) return false;
      if (!normalizedQuery) return true;

      const searchableText = [
        agent.indexBadge,
        agent.suiteLabel,
        agent.title,
        agent.description,
        agent.signals,
        agent.output,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [selectedSuite, searchQuery]);

  return (
    <div className="min-h-[calc(100vh-106px)] w-full bg-[#F5F5F7]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-8 pb-16 space-y-8">
        {/* Top Editorial Header & Filter Sheet */}
        <section
          aria-labelledby="agent-suite-heading"
          className="rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow p-7 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {pageEyebrow && (
              <span className="inline-flex items-center rounded-[6px] px-2.5 py-1 fortifai-pill">
                {pageEyebrow}
              </span>
            )}
          </div>

          <h1
            id="agent-suite-heading"
            className="mt-3 text-[clamp(26px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.02em] text-[#163B66]"
          >
            {pageTitle}
          </h1>

          {pageSubtitle && (
            <p className="mt-2 max-w-[840px] text-[15px] font-normal leading-[1.6] text-[#475569]">
              {pageSubtitle}
            </p>
          )}

          {/* Filter Pills + Search Input Bar */}
          <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Filter agents by domain suite"
              className="flex flex-wrap items-center gap-2"
            >
              {AGENT_SUITE_FILTERS.map((suiteOption) => {
                const isActive = selectedSuite === suiteOption.id;
                return (
                  <button
                    key={suiteOption.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedSuite(suiteOption.id)}
                    className={`rounded-[8px] border px-3.5 py-1.5 text-[14px] whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#163B66] border-[#163B66] text-[#FFFFFF] font-semibold'
                        : 'bg-[#FFFFFF] hover:bg-[#F5F5F7] border-[#E5E7EB] hover:border-[#6699CC] text-[#475569] hover:text-[#163B66] font-medium'
                    }`}
                  >
                    {suiteOption.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-[320px] shrink-0">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by risk, workflow, or signal..."
                aria-label="Filter by risk, workflow, or signal"
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
          </div>
        </section>

        {/* Unified 3-Column #FFFFFF Editorial Hairline Agent Grid */}
        {filteredAgents.length === 0 ? (
          <div className="rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow p-10 text-center space-y-3">
            <h3 className="text-[17.5px] font-semibold text-[#0F172A]">
              No matching domain agents found
            </h3>
            <p className="text-[14.5px] text-[#475569]">
              Clear your search filter or switch back to All Suites.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSuite('ALL');
                setSearchQuery('');
              }}
              className="mt-1 inline-flex items-center rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-4 py-2 text-[14px] font-medium transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <section
            aria-label="Domain Agent Catalogue"
            className="rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredAgents.map((agent) => (
              <article
                key={agent.indexBadge}
                className="p-7 sm:p-8 flex flex-col justify-between gap-6 border-b border-[#E5E7EB] md:odd:border-r lg:odd:border-r-0 lg:[&:not(:nth-child(3n))]:border-r transition-colors hover:bg-[#F8FAFC]/60"
              >
                <div>
                  {/* Suite Eyebrow + Index Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] text-[#64748B] uppercase">
                      {agent.suiteLabel}
                    </span>
                    <span className="inline-flex items-center rounded-[5px] bg-[#F5F5F7] border border-[#E5E7EB] px-2 py-0.5 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] text-[#163B66]">
                      {agent.indexBadge}
                    </span>
                  </div>

                  <h3 className="mt-3 text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#0F172A]">
                    {agent.title}
                  </h3>

                  <p className="mt-2.5 text-[14.5px] font-normal leading-[1.6] text-[#334155]">
                    {agent.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] space-y-2 text-[14px] leading-[1.55] text-[#475569]">
                  <div>
                    <span className="font-semibold text-[#0F172A]">
                      Signals:
                    </span>{' '}
                    {agent.signals}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A]">
                      Output:
                    </span>{' '}
                    {agent.output}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
