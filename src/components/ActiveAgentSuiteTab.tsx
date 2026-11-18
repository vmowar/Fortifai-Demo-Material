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
    <div className="min-h-[calc(100vh-88px)] w-full bg-[#F6F7F9]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-4 pb-10 space-y-4">
        {/* Top Editorial Header & Filter Card */}
        <section
          aria-labelledby="agent-suite-heading"
          className="rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {pageEyebrow && (
              <span className="inline-flex items-center rounded-[5px] px-2 py-0.5 fortifai-pill uppercase">
                {pageEyebrow}
              </span>
            )}
          </div>

          <h1
            id="agent-suite-heading"
            className="mt-2 text-[21px] sm:text-[22px] font-medium leading-[1.2] tracking-[-0.02em] text-[#163B66]"
          >
            {pageTitle}
          </h1>

          {pageSubtitle && (
            <p className="mt-1 max-w-[800px] text-[13px] font-normal leading-[1.52] text-[#4B5B6E]">
              {pageSubtitle}
            </p>
          )}

          {/* Filter Pills + Search Input Bar */}
          <div className="mt-3.5 pt-3 border-t border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div
              role="tablist"
              aria-label="Filter agents by domain suite"
              className="flex flex-wrap items-center gap-1.5"
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
                    className={`rounded-[7px] border px-2.5 py-1 text-[11.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#163B66] border-[#163B66] text-[#FFFFFF]'
                        : 'bg-[#F8FAFC] hover:bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#6699CC] text-[#4B5B6E] hover:text-[#163B66]'
                    }`}
                  >
                    {suiteOption.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-[270px] shrink-0">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by risk, workflow, or signal..."
                aria-label="Filter by risk, workflow, or signal"
                className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] pl-8 pr-8 text-[12.5px] text-[#0D1520] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#163B66] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Responsive 3-Column Agent Card Grid */}
        {filteredAgents.length === 0 ? (
          <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow p-8 text-center space-y-2">
            <p className="text-[14px] font-medium text-[#163B66]">
              No matching domain agents found
            </p>
            <p className="text-[12.5px] text-[#64748B]">
              Clear your search filter or switch back to All Suites.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSuite('ALL');
                setSearchQuery('');
              }}
              className="mt-1 inline-flex items-center rounded-[7px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <section
            aria-label="Domain Agent Catalogue"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
          >
            {filteredAgents.map((agent) => (
              <article
                key={agent.indexBadge}
                className="rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow p-4 flex flex-col justify-between transition-colors hover:border-[#6699CC]/70"
              >
                <div>
                  {/* Suite Eyebrow Pill + 01–17 Index Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-[5px] bg-[#E8F0F8] px-2 py-0.5 font-mono-tabular text-[9.5px] font-medium tracking-[0.04em] text-[#2E5A8A] uppercase">
                      {agent.suiteLabel}
                    </span>
                    <span className="inline-flex items-center rounded-[5px] bg-[#F8FAFC] border border-[#E5E7EB] px-1.5 py-0.5 font-mono-tabular text-[10px] font-medium text-[#2E5A8A]">
                      {agent.indexBadge}
                    </span>
                  </div>

                  <h2 className="mt-2.5 text-[14px] font-semibold leading-[1.3] text-[#163B66]">
                    {agent.title}
                  </h2>

                  <p className="mt-1.5 text-[12.5px] font-normal leading-[1.52] text-[#4B5B6E]">
                    {agent.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] space-y-1 text-[11.5px] leading-[1.45] text-[#64748B]">
                  <div>
                    <span className="font-medium text-[#163B66]">Signals:</span>{' '}
                    {agent.signals}
                  </div>
                  <div>
                    <span className="font-medium text-[#163B66]">Output:</span>{' '}
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
