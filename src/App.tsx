/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { AccessGate, formatUtcTimestamp } from './components/AccessGate';
import { ActiveAgentSuiteTab } from './components/ActiveAgentSuiteTab';
import { BusinessCaseRoiTab } from './components/BusinessCaseRoiTab';
import { ExecutiveFaqTab } from './components/ExecutiveFaqTab';
import { ExecutiveWalkthroughTab } from './components/ExecutiveWalkthroughTab';
import { FloatingHeader } from './components/FloatingHeader';
import type { DiskSyncStatus } from './components/LiveCmsPanel';
import { SaraArchitectureStudioTab } from './components/SaraArchitectureStudioTab';
import { SecurityWatermark } from './components/SecurityWatermark';
import { UserLoginsAdminTab } from './components/UserLoginsAdminTab';
import {
  AuthenticatedSession,
  BriefingCmsConfig,
  SESSION_STORAGE_KEY,
  TabId,
  clearStoredCmsConfig,
  cloneDefaultCmsConfig,
  fetchLatestCmsFromDisk,
  flushPendingCmsBeacon,
  isLiveCmsEnabled,
  loadInitialCmsState,
  saveCmsConfigInstant,
  saveCmsConfigLocal,
} from './config/briefingConfig';
import { isFortifaiEmail, logPortalEvent } from './lib/supabase';

// Lazily loaded ONLY when __AISTUDIO_CMS_ENABLED__ is true (inside Google AI Studio).
// When the ZIP is downloaded and built for Git (Vercel / Netlify / Cloudflare / overview.fortifai.io),
// Rollup dead-code eliminates this chunk completely.
const LiveCmsPanelLazy = __AISTUDIO_CMS_ENABLED__
  ? lazy(() =>
      import('./components/LiveCmsPanel').then((m) => ({
        default: m.LiveCmsPanel,
      }))
    )
  : null;

function createDirectInternalSession(): AuthenticatedSession {
  const now = new Date();
  return {
    name: 'Fortifai Team',
    email: 'team@fortifai.io',
    organization: 'Fortifai',
    accessCode: 'FORTIFAI_INTERNAL',
    timestamp: now.toISOString(),
    formattedTimestamp: formatUtcTimestamp(now),
    hideHeaderIdentity: true,
  };
}

function hasInternalBypassParam(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('internal') === 'true';
  } catch {
    return false;
  }
}

function loadInitialSession(): AuthenticatedSession | null {
  // Auto-unlock immediately on load if ?internal=true is present in window.location.search
  if (hasInternalBypassParam()) {
    const directSession = createDirectInternalSession();
    try {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(directSession)
      );
    } catch {
      // Ignore storage restrictions
    }
    return directSession;
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<AuthenticatedSession>;
    if (
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.organization === 'string' &&
      typeof parsed.accessCode === 'string' &&
      typeof parsed.timestamp === 'string' &&
      typeof parsed.formattedTimestamp === 'string'
    ) {
      // Clean up any legacy synthetic preview session so it never shows in the header
      if (parsed.name === 'Fortifai Editorial Admin') {
        const cleaned: AuthenticatedSession = {
          ...(parsed as AuthenticatedSession),
          email: 'team@fortifai.io',
          organization: 'Fortifai',
          hideHeaderIdentity: true,
        };
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify(cleaned)
        );
        return cleaned;
      }
      return parsed as AuthenticatedSession;
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const cmsAllowed = isLiveCmsEnabled();

  const [initialCms] = useState(() => loadInitialCmsState());
  const [cmsConfig, setCmsConfig] = useState<BriefingCmsConfig>(
    () => initialCms.config
  );
  const [hasCustomEdits, setHasCustomEdits] = useState<boolean>(
    () => initialCms.hasCustomEdits
  );
  const [isCmsDirty, setIsCmsDirty] = useState<boolean>(false);
  const [savedAtLabel, setSavedAtLabel] = useState<string | null>(
    () => initialCms.savedAtLabel
  );
  const [justSavedBanner, setJustSavedBanner] = useState<boolean>(false);
  const [diskSyncStatus, setDiskSyncStatus] = useState<DiskSyncStatus>(
    initialCms.hasCustomEdits ? 'saved' : 'idle'
  );
  const [isCmsOpen, setIsCmsOpen] = useState<boolean>(false);
  const [session, setSession] = useState<AuthenticatedSession | null>(() =>
    loadInitialSession()
  );
  const [forceGatePreview, setForceGatePreview] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabId>('walkthrough');

  const latestConfigRef = useRef<BriefingCmsConfig>(initialCms.config);
  const cmsRevisionRef = useRef<number>(initialCms.revision);
  const isDirtyRef = useRef<boolean>(false);
  const syncTimerRef = useRef<number | null>(null);
  const savedBannerTimerRef = useRef<number | null>(null);

  // Hydrate or flush persisted Live CMS state on mount (bypasses Vite DISABLE_HMR cache)
  useEffect(() => {
    if (!cmsAllowed) {
      return;
    }

    if (initialCms.needsInitialDiskSync) {
      setDiskSyncStatus('saving');
      void saveCmsConfigInstant(
        latestConfigRef.current,
        cmsRevisionRef.current
      ).then((res) => {
        cmsRevisionRef.current = res.revision;
        setSavedAtLabel(res.savedAtLabel);
        setDiskSyncStatus(res.diskSynced ? 'saved' : 'local-only');
      });
      return;
    }

    void fetchLatestCmsFromDisk().then((diskState) => {
      if (
        !isDirtyRef.current &&
        diskState.ok &&
        diskState.config &&
        diskState.revision > cmsRevisionRef.current
      ) {
        cmsRevisionRef.current = diskState.revision;
        latestConfigRef.current = diskState.config;
        setCmsConfig(diskState.config);
        setHasCustomEdits(true);
        setDiskSyncStatus('saved');
        saveCmsConfigLocal(diskState.config, {
          revision: diskState.revision,
          dirty: false,
          savedAtLabel: null,
        });
      }
    });
  }, [cmsAllowed, initialCms]);

  // Flush any pending unsaved Live CMS edits via sendBeacon + localStorage on page unload
  useEffect(() => {
    if (!cmsAllowed) {
      return;
    }
    const handlePageUnload = () => {
      if (isDirtyRef.current) {
        flushPendingCmsBeacon(latestConfigRef.current, cmsRevisionRef.current);
      }
    };
    window.addEventListener('pagehide', handlePageUnload);
    window.addEventListener('beforeunload', handlePageUnload);
    return () => {
      window.removeEventListener('pagehide', handlePageUnload);
      window.removeEventListener('beforeunload', handlePageUnload);
    };
  }, [cmsAllowed]);

  // Content protection: Configurable right-click context menu guard
  useEffect(() => {
    if (!cmsConfig.security.disableRightClick) {
      return;
    }
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [cmsConfig.security.disableRightClick]);

  // Keyboard shortcut (AI Studio Only): Shift + E toggles Live CMS Studio
  useEffect(() => {
    if (!cmsAllowed) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isEditable) return;

      if (event.shiftKey && (event.key === 'E' || event.key === 'e')) {
        event.preventDefault();
        setIsCmsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cmsAllowed]);

  // Explicit instant save handler triggered by "Save Changes" button or Cmd/Ctrl + S
  const handleSaveCmsNow = useCallback(async () => {
    if (!cmsAllowed) return;

    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    setDiskSyncStatus('saving');
    const snapshot = latestConfigRef.current;
    const result = await saveCmsConfigInstant(snapshot, cmsRevisionRef.current);

    cmsRevisionRef.current = result.revision;
    if (latestConfigRef.current === snapshot) {
      isDirtyRef.current = false;
      setIsCmsDirty(false);
    }
    setHasCustomEdits(true);
    setSavedAtLabel(result.savedAtLabel);
    setDiskSyncStatus(result.diskSynced ? 'saved' : 'local-only');
    setJustSavedBanner(true);

    if (savedBannerTimerRef.current !== null) {
      window.clearTimeout(savedBannerTimerRef.current);
    }
    savedBannerTimerRef.current = window.setTimeout(() => {
      setJustSavedBanner(false);
    }, 2600);
  }, [cmsAllowed]);

  const handleCmsChange = (updated: BriefingCmsConfig) => {
    if (!cmsAllowed) return;
    latestConfigRef.current = updated;
    setCmsConfig(updated);
    setHasCustomEdits(true);
    isDirtyRef.current = true;
    setIsCmsDirty(true);
    setJustSavedBanner(false);

    // Immediate synchronous browser persistence (0ms) so zero keystrokes are ever lost
    saveCmsConfigLocal(updated, {
      revision: cmsRevisionRef.current,
      dirty: true,
      savedAtLabel,
    });

    // Background disk auto-sync fallback in case user edits without clicking Save Changes
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = window.setTimeout(() => {
      const snapshot = latestConfigRef.current;
      void saveCmsConfigInstant(snapshot, cmsRevisionRef.current).then(
        (res) => {
          cmsRevisionRef.current = res.revision;
          if (latestConfigRef.current === snapshot) {
            isDirtyRef.current = false;
            setIsCmsDirty(false);
          }
          setSavedAtLabel(res.savedAtLabel);
          setDiskSyncStatus(res.diskSynced ? 'saved' : 'local-only');
        }
      );
    }, 650);
  };

  const handleResetCmsDefaults = () => {
    if (!cmsAllowed) return;
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    const defaults = cloneDefaultCmsConfig();
    latestConfigRef.current = defaults;
    cmsRevisionRef.current = 0;
    isDirtyRef.current = false;
    setCmsConfig(defaults);
    setHasCustomEdits(false);
    setIsCmsDirty(false);
    setSavedAtLabel(null);
    setJustSavedBanner(false);
    setDiskSyncStatus('idle');
    void clearStoredCmsConfig();
  };

  const handleAuthenticated = (newSession: AuthenticatedSession) => {
    try {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(newSession)
      );
    } catch {
      // Proceed in-memory if sessionStorage is restricted
    }
    setSession(newSession);
    setForceGatePreview(false);
    setActiveTab('walkthrough');

    // Silently log external corporate visitor GATE_LOGIN to Supabase (skips @fortifai.io automatically)
    void logPortalEvent(newSession, 'GATE_LOGIN');
  };

  const handleSelectTab = (nextTab: TabId) => {
    if (nextTab === 'logins' && (!session || !isFortifaiEmail(session.email))) {
      return;
    }

    const isChangingTab = nextTab !== activeTab;
    setActiveTab(nextTab);

    if (isChangingTab && session && nextTab !== 'logins') {
      const tabMeta = cmsConfig.tabs.find((t) => t.id === nextTab);
      const tabLabel = tabMeta?.label ?? nextTab;
      void logPortalEvent(session, 'TAB_VIEW', tabLabel);
    }
  };

  const handleSignOut = () => {
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setSession(null);
    setForceGatePreview(false);
    setActiveTab('walkthrough');
  };

  const handleSwitchPreviewMode = (
    mode: 'gate' | 'dataroom',
    targetTab?: TabId
  ) => {
    if (mode === 'gate') {
      setForceGatePreview(true);
      return;
    }

    setForceGatePreview(false);
    if (!session) {
      handleAuthenticated(createDirectInternalSession());
    }
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  const showDataRoom = Boolean(session) && !forceGatePreview;
  const isInternalMember = Boolean(session && isFortifaiEmail(session.email));

  const agentsTabConfig =
    cmsConfig.tabs.find((tab) => tab.id === 'agents') ?? cmsConfig.tabs[2];

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#4B5B6E]">
      {!showDataRoom || !session ? (
        <AccessGate
          gateConfig={cmsConfig.gate}
          onAuthenticated={handleAuthenticated}
        />
      ) : (
        <div className="relative min-h-screen flex flex-col">
          {/* Dynamic Repeating Diagonal SVG Security Watermark (opacity: 0.035, color: #0D1520) */}
          {cmsConfig.security.enableWatermark && (
            <SecurityWatermark
              user={session}
              suffix={cmsConfig.security.watermarkSuffix}
            />
          )}

          {/* Clean Full-Width 2-Tier Sticky Header */}
          <FloatingHeader
            headerConfig={cmsConfig.header}
            tabs={cmsConfig.tabs}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            user={session}
            onSignOut={handleSignOut}
            onOpenCms={() => setIsCmsOpen(true)}
            showLiveCmsButton={cmsAllowed}
            isFortifaiInternal={isInternalMember}
          />

          {/* Main Tab Content Viewport */}
          <main className="flex-1 w-full">
            {activeTab === 'walkthrough' && (
              <ExecutiveWalkthroughTab
                config={cmsConfig.walkthrough}
                bookDemoUrl={cmsConfig.header.bookDemoUrl}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'architecture' && (
              <SaraArchitectureStudioTab
                config={cmsConfig.architecture}
                bookDemoUrl={cmsConfig.header.bookDemoUrl}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'agents' && (
              <ActiveAgentSuiteTab tab={agentsTabConfig} />
            )}

            {activeTab === 'roi' && (
              <BusinessCaseRoiTab
                config={cmsConfig.roi}
                user={session}
                bookDemoUrl={cmsConfig.header.bookDemoUrl}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'faq' && (
              <ExecutiveFaqTab
                config={cmsConfig.faq}
                bookDemoUrl={cmsConfig.header.bookDemoUrl}
                showLiveCmsButton={cmsAllowed}
                onOpenCmsFaq={() => {
                  setActiveTab('faq');
                  setIsCmsOpen(true);
                }}
              />
            )}

            {activeTab === 'logins' && isInternalMember && (
              <UserLoginsAdminTab portalSessionEmail={session.email} />
            )}
          </main>
        </div>
      )}

      {/* Live CMS Studio — Enabled ONLY in Google AI Studio; stripped automatically when built from downloaded ZIP / Git */}
      {cmsAllowed && LiveCmsPanelLazy && (
        <Suspense fallback={null}>
          <LiveCmsPanelLazy
            config={cmsConfig}
            isOpen={isCmsOpen}
            onToggleOpen={setIsCmsOpen}
            onChange={handleCmsChange}
            onSaveNow={handleSaveCmsNow}
            onResetDefaults={handleResetCmsDefaults}
            hasCustomEdits={hasCustomEdits}
            isDirty={isCmsDirty}
            savedAtLabel={savedAtLabel}
            justSavedBanner={justSavedBanner}
            diskSyncStatus={diskSyncStatus}
            isAuthenticated={showDataRoom}
            activeTab={activeTab}
            onSwitchPreviewMode={handleSwitchPreviewMode}
          />
        </Suspense>
      )}
    </div>
  );
}
