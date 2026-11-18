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

  const displayOrganization =
    isFortifaiInternal ||
    user.email.trim().toLowerCase().endsWith('@fortifai.io')
      ? 'Fortifai'
      : user.organization;

  const showUserAttribution = Boolean(
    !user.hideHeaderIdentity && user.email && displayOrganization
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#E5E7EB]">
      {/* Tier 1: Brand Lockup + Session Attribution & Primary Actions */}
      <div className="mx-auto max-w-[1240px] h-[60px] px-5 sm:px-8 flex items-center justify-between gap-4">
        {/* Left: Official Fortifai Logo + Portal Pill */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onSelectTab('walkthrough')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163B66] rounded-md cursor-pointer shrink-0"
            title="Fortifai Executive Data Room"
          >
            <FortifaiLogo height={26} />
          </button>

          {headerConfig.portalPillLabel && (
            <span className="hidden sm:inline-flex items-center rounded-[6px] px-2.5 py-1 fortifai-pill whitespace-nowrap">
              {headerConfig.portalPillLabel}
            </span>
          )}
        </div>

        {/* Right: Authenticated User Identity + Optional Live CMS + Book a Live Demo + Sign Out */}
        <div className="flex items-center gap-2.5 shrink-0">
          {showUserAttribution && (
            <span
              title={`${user.email} · ${displayOrganization} (${user.formattedTimestamp})`}
              className="hidden lg:inline-block font-mono-tabular text-[12px] font-medium tracking-[0.03em] text-[#475569] max-w-[280px] xl:max-w-[340px] truncate mr-1"
            >
              {user.email} · {displayOrganization}
            </span>
          )}

          {showLiveCmsButton && (
            <button
              type="button"
              onClick={onOpenCms}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#F5F5F7] hover:bg-[#E8F0F8] border border-[#E5E7EB] hover:border-[#6699CC]/60 px-3 py-1.5 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] uppercase text-[#163B66] whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163B66]"
              title="Open Live CMS Editor (Shift + E)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#163B66] shrink-0" />
              <span>LIVE CMS</span>
            </button>
          )}

          <a
            href={headerConfig.bookDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-4 py-2 text-[14px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163B66] focus-visible:ring-offset-1"
          >
            <span>{headerConfig.bookDemoLabel}</span>
          </a>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-transparent hover:bg-[#F5F5F7] px-2.5 py-2 text-[14px] font-medium text-[#475569] hover:text-[#163B66] whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#163B66]"
            title="End confidential briefing session"
          >
            <LogOut className="w-4 h-4 text-[#64748B]" />
            <span className="hidden sm:inline">{headerConfig.signOutLabel}</span>
          </button>
        </div>
      </div>

      {/* Tier 2: Horizontal Sub-Nav Strip (height: 46px, border-top: 1px solid #E5E7EB) */}
      <div className="w-full border-t border-[#E5E7EB] bg-[#FFFFFF]">
        <nav
          aria-label="Briefing Sections"
          className="mx-auto max-w-[1240px] h-[46px] px-5 sm:px-8 flex items-center gap-6 lg:gap-7 overflow-x-auto fortifai-scroll"
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
                className={`relative h-full inline-flex items-center gap-2 border-b-2 text-[14px] whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none ${
                  isActive
                    ? 'border-[#163B66] text-[#163B66] font-semibold'
                    : 'border-transparent text-[#475569] font-medium hover:text-[#163B66] hover:border-[#CBD5E1]'
                }`}
              >
                {isInternalTab && (
                  <Lock className="w-3.5 h-3.5 text-[#163B66] shrink-0" />
                )}
                <span>{tab.label}</span>
                {isInternalTab && (
                  <span className="rounded-[5px] bg-[#F5F5F7] border border-[#E5E7EB] px-2 py-0.5 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] uppercase text-[#163B66]">
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
