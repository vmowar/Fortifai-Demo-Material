import React from 'react';
import { Lock, LogOut, SlidersHorizontal } from 'lucide-react';
import {
  AuthenticatedSession,
  BriefingCmsConfig,
  DataRoomTab,
  INTERNAL_LOGINS_TAB,
  TabId,
} from '../config/briefingConfig';
import { FortifaiLogo } from './FortifaiLogo';

interface FloatingHeaderProps {
  headerConfig: BriefingCmsConfig['header'];
  tabs: DataRoomTab[];
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  user: AuthenticatedSession;
  onSignOut: () => void;
  onOpenCms: () => void;
  showLiveCmsButton: boolean;
  isFortifaiInternal: boolean;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  headerConfig,
  tabs,
  activeTab,
  onSelectTab,
  user,
  onSignOut,
  onOpenCms,
  showLiveCmsButton,
  isFortifaiInternal,
}) => {
  const visibleTabs: DataRoomTab[] = isFortifaiInternal
    ? [...tabs.filter((t) => t.id !== 'logins'), INTERNAL_LOGINS_TAB]
    : tabs.filter((t) => t.id !== 'logins');

  const showUserAttribution = Boolean(
    !user.hideHeaderIdentity && user.email && user.organization
  );

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF] border-b border-[#E5E7EB]">
      {/* Tier 1: Brand Lockup + Session Attribution & Primary Actions (height: 50px) */}
      <div className="mx-auto max-w-[1200px] h-[50px] px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Official Fortifai Logo + Portal Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => onSelectTab('walkthrough')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5A8A] rounded-md cursor-pointer shrink-0"
            title="Fortifai Executive Data Room"
          >
            <FortifaiLogo height={24} />
          </button>

          {headerConfig.portalPillLabel && (
            <span className="hidden sm:inline-flex items-center rounded-[5px] px-2 py-0.5 fortifai-pill whitespace-nowrap">
              {headerConfig.portalPillLabel}
            </span>
          )}
        </div>

        {/* Right: Authenticated User Identity + Optional Live CMS + Book a Live Demo + Sign Out */}
        <div className="flex items-center gap-2 shrink-0">
          {showUserAttribution && (
            <span
              title={`${user.email} · ${user.organization} (${user.formattedTimestamp})`}
              className="hidden lg:inline-block font-mono-tabular text-[10.5px] font-medium tracking-[0.02em] text-[#4B5B6E] max-w-[240px] xl:max-w-[300px] truncate mr-1"
            >
              {user.email} · {user.organization}
            </span>
          )}

          {showLiveCmsButton && (
            <button
              type="button"
              onClick={onOpenCms}
              className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#E8F0F8] hover:bg-[#DCE8F5] border border-[#6699CC]/35 px-2.5 py-1 font-mono-tabular text-[10.5px] font-medium text-[#2E5A8A] whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5A8A]"
              title="Open Live CMS Editor (Shift + E)"
            >
              <SlidersHorizontal className="w-3 h-3 shrink-0" />
              <span>LIVE CMS</span>
            </button>
          )}

          <a
            href={headerConfig.bookDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-[7px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5A8A] focus-visible:ring-offset-1"
          >
            <span>{headerConfig.bookDemoLabel}</span>
          </a>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1 rounded-[7px] bg-transparent hover:bg-[#F5F5F7] px-2 py-1 text-[12px] font-medium text-[#4B5B6E] hover:text-[#163B66] whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5A8A]"
            title="End confidential briefing session"
          >
            <LogOut className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">{headerConfig.signOutLabel}</span>
          </button>
        </div>
      </div>

      {/* Tier 2: Horizontal Sub-Nav Strip (height: 38px, border-top: 1px solid #F1F5F9) */}
      <div className="w-full border-t border-[#F1F5F9] bg-[#FFFFFF]">
        <nav
          aria-label="Briefing Sections"
          className="mx-auto max-w-[1200px] h-[38px] px-4 sm:px-6 flex items-center gap-4 lg:gap-5 overflow-x-auto fortifai-scroll"
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isInternalTab = tab.id === 'logins';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                title={tab.shortSubtitle}
                className={`relative h-full inline-flex items-center gap-1.5 border-b-2 text-[12px] whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none ${
                  isActive
                    ? 'border-[#163B66] text-[#163B66] font-medium'
                    : 'border-transparent text-[#4B5B6E] font-normal hover:text-[#163B66] hover:border-[#CBD5E1]'
                }`}
              >
                {isInternalTab && (
                  <Lock className="w-3 h-3 text-[#2E5A8A] shrink-0" />
                )}
                <span>{tab.label}</span>
                {isInternalTab && (
                  <span className="rounded-[4px] bg-[#E8F0F8] px-1.5 py-0.5 font-mono-tabular text-[9.5px] font-medium text-[#2E5A8A]">
                    INTERNAL
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
