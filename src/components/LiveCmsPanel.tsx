import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import {
  BriefingCmsConfig,
  ExecutiveFaqItem,
  FAQ_CATEGORIES,
  FaqCategory,
  TabId,
  formatCmsConfigAsTypeScript,
} from '../config/briefingConfig';

type CmsSection =
  | 'walkthrough'
  | 'architecture'
  | 'agents'
  | 'roi'
  | 'faq'
  | 'gate'
  | 'header';

export type DiskSyncStatus = 'idle' | 'saving' | 'saved' | 'local-only';

interface LiveCmsPanelProps {
  config: BriefingCmsConfig;
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
  onChange: (updated: BriefingCmsConfig) => void;
  onSaveNow: () => Promise<void> | void;
  onResetDefaults: () => void;
  hasCustomEdits: boolean;
  isDirty: boolean;
  savedAtLabel: string | null;
  justSavedBanner: boolean;
  diskSyncStatus: DiskSyncStatus;
  isAuthenticated: boolean;
  activeTab: TabId;
  onSwitchPreviewMode: (mode: 'gate' | 'dataroom', targetTab?: TabId) => void;
}

export const LiveCmsPanel: React.FC<LiveCmsPanelProps> = ({
  config,
  isOpen,
  onToggleOpen,
  onChange,
  onSaveNow,
  onResetDefaults,
  hasCustomEdits,
  isDirty,
  savedAtLabel,
  justSavedBanner,
  diskSyncStatus,
  isAuthenticated,
  activeTab,
  onSwitchPreviewMode,
}) => {
  const [activeSection, setActiveSection] = useState<CmsSection>('walkthrough');
  const [copiedCode, setCopiedCode] = useState(false);

  // Local text drafts for newline/comma-delimited fields so typing spaces/newlines never jumps
  const [layer2Draft, setLayer2Draft] = useState<string>(() =>
    config.architecture.layer2Capabilities.join('\n')
  );
  const [accessCodesDraft, setAccessCodesDraft] = useState<string>(() =>
    config.gate.validAccessCodes.join(', ')
  );

  useEffect(() => {
    setLayer2Draft(config.architecture.layer2Capabilities.join('\n'));
  }, [config.architecture.layer2Capabilities]);

  useEffect(() => {
    setAccessCodesDraft(config.gate.validAccessCodes.join(', '));
  }, [config.gate.validAccessCodes]);

  // Cmd/Ctrl + S instant save shortcut whenever Live CMS drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const handleSaveKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void onSaveNow();
      }
    };
    window.addEventListener('keydown', handleSaveKeyDown);
    return () => {
      window.removeEventListener('keydown', handleSaveKeyDown);
    };
  }, [isOpen, onSaveNow]);

  // New FAQ composer state inside Live CMS
  const [newFaqCategory, setNewFaqCategory] = useState<FaqCategory>(
    'Reliability & SME Pedigree'
  );
  const [newFaqQuestion, setNewFaqQuestion] = useState<string>('');
  const [newFaqAnswer, setNewFaqAnswer] = useState<string>('');
  const [faqAddedNotice, setFaqAddedNotice] = useState<boolean>(false);

  // Align active editor section with the visible screen whenever the drawer opens
  useEffect(() => {
    if (!isOpen) return;
    if (!isAuthenticated) {
      setActiveSection('gate');
    } else if (activeTab === 'architecture') {
      setActiveSection('architecture');
    } else if (activeTab === 'agents') {
      setActiveSection('agents');
    } else if (activeTab === 'roi') {
      setActiveSection('roi');
    } else if (activeTab === 'faq') {
      setActiveSection('faq');
    } else {
      setActiveSection('walkthrough');
    }
  }, [isOpen, isAuthenticated, activeTab]);

  const handleSelectSection = (sec: CmsSection) => {
    setActiveSection(sec);
    if (sec === 'gate') {
      onSwitchPreviewMode('gate');
    } else if (sec === 'walkthrough') {
      onSwitchPreviewMode('dataroom', 'walkthrough');
    } else if (sec === 'architecture') {
      onSwitchPreviewMode('dataroom', 'architecture');
    } else if (sec === 'agents') {
      onSwitchPreviewMode('dataroom', 'agents');
    } else if (sec === 'roi') {
      onSwitchPreviewMode('dataroom', 'roi');
    } else if (sec === 'faq') {
      onSwitchPreviewMode('dataroom', 'faq');
    } else if (sec === 'header' && !isAuthenticated) {
      onSwitchPreviewMode('dataroom', 'walkthrough');
    }
  };

  const handleCopyTsConfig = async () => {
    try {
      await navigator.clipboard.writeText(formatCmsConfigAsTypeScript(config));
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2200);
    } catch {
      // Clipboard blocked in restricted sandbox
    }
  };

  const updateWalkthrough = (
    patch: Partial<BriefingCmsConfig['walkthrough']>
  ) => {
    onChange({
      ...config,
      walkthrough: {
        ...config.walkthrough,
        ...patch,
      },
    });
  };

  const updateArchitecture = (
    patch: Partial<BriefingCmsConfig['architecture']>
  ) => {
    onChange({
      ...config,
      architecture: {
        ...config.architecture,
        ...patch,
      },
    });
  };

  const updateRoi = (patch: Partial<BriefingCmsConfig['roi']>) => {
    onChange({
      ...config,
      roi: {
        ...config.roi,
        ...patch,
      },
    });
  };

  const updateFaq = (patch: Partial<BriefingCmsConfig['faq']>) => {
    onChange({
      ...config,
      faq: {
        ...config.faq,
        ...patch,
      },
    });
  };

  const updateGate = (patch: Partial<BriefingCmsConfig['gate']>) => {
    onChange({
      ...config,
      gate: {
        ...config.gate,
        ...patch,
      },
    });
  };

  const updateHeader = (patch: Partial<BriefingCmsConfig['header']>) => {
    onChange({
      ...config,
      header: {
        ...config.header,
        ...patch,
      },
    });
  };

  const updateSecurity = (patch: Partial<BriefingCmsConfig['security']>) => {
    onChange({
      ...config,
      security: {
        ...config.security,
        ...patch,
      },
    });
  };

  const updateTabItem = (
    tabId: TabId,
    patch: {
      label?: string;
      utilityEyebrow?: string;
      utilityTitle?: string;
      utilitySubtitle?: string;
      embedSrc?: string;
    }
  ) => {
    onChange({
      ...config,
      tabs: config.tabs.map((t) => (t.id === tabId ? { ...t, ...patch } : t)),
    });
  };

  const handleCloseDrawer = () => {
    if (isDirty) {
      void onSaveNow();
    }
    onToggleOpen(false);
  };

  const handleAddFaqItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQ = newFaqQuestion.trim();
    const trimmedA = newFaqAnswer.trim();
    if (!trimmedQ || !trimmedA) {
      return;
    }

    const createdItem: ExecutiveFaqItem = {
      id: `faq-custom-${Date.now()}`,
      category: newFaqCategory,
      question: trimmedQ,
      answer: trimmedA,
    };

    updateFaq({
      items: [...config.faq.items, createdItem],
    });
    void onSaveNow();

    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setFaqAddedNotice(true);
    window.setTimeout(() => setFaqAddedNotice(false), 2500);
  };

  const handleUpdateFaqItem = (
    id: string,
    patch: Partial<ExecutiveFaqItem>
  ) => {
    updateFaq({
      items: config.faq.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  };

  const handleMoveFaqItem = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= config.faq.items.length) return;
    const next = [...config.faq.items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    updateFaq({ items: next });
  };

  const handleDeleteFaqItem = (id: string) => {
    if (config.faq.items.length <= 1) return;
    updateFaq({
      items: config.faq.items.filter((item) => item.id !== id),
    });
  };

  const walkthroughTab =
    config.tabs.find((t) => t.id === 'walkthrough') ?? config.tabs[0];
  const architectureTab =
    config.tabs.find((t) => t.id === 'architecture') ?? config.tabs[1];
  const agentsTab =
    config.tabs.find((t) => t.id === 'agents') ?? config.tabs[2];
  const roiTab = config.tabs.find((t) => t.id === 'roi') ?? config.tabs[3];
  const faqTab = config.tabs.find((t) => t.id === 'faq') ?? config.tabs[4];

  return (
    <>
      {/* Floating Trigger Pill on Gate Screen (AI Studio Only) */}
      {!isOpen && !isAuthenticated && (
        <button
          type="button"
          onClick={() => onToggleOpen(true)}
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#E8F0F8] border border-[#E5E7EB] px-3.5 py-2 fortifai-card-shadow font-mono-tabular text-[11px] font-medium text-[#163B66] cursor-pointer transition-colors"
          title="Open Live CMS Studio (Shift + E)"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#2E5A8A]" />
          <span>LIVE CMS</span>
          {hasCustomEdits && (
            <span className="h-2 w-2 rounded-full bg-[#6699CC]" />
          )}
        </button>
      )}

      {/* Slide-Over Live CMS Studio Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
          <div
            aria-hidden="true"
            onClick={handleCloseDrawer}
            className="fixed inset-0 bg-[#0D1520]/15 backdrop-blur-[1px] pointer-events-auto"
          />

          <aside
            aria-label="Fortifai Live CMS Studio"
            className="relative z-10 w-full max-w-[460px] h-full bg-[#FFFFFF] border-l border-[#E5E7EB] shadow-[-12px_0_40px_rgba(13,21,32,0.08)] flex flex-col pointer-events-auto"
          >
            {/* Drawer Header with Instant Save Button */}
            <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between gap-2.5 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="rounded-[5px] px-2 py-0.5 fortifai-pill uppercase">
                    AI STUDIO LIVE CMS
                  </span>
                  <span className="font-mono-tabular text-[10px] text-[#64748B]">
                    Auto-removed on Git build
                  </span>
                </div>
                <h2 className="mt-1 text-[15px] font-medium text-[#163B66] truncate">
                  overview.fortifai.io Content Editor
                </h2>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => void onSaveNow()}
                  disabled={diskSyncStatus === 'saving'}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-70 ${
                    justSavedBanner
                      ? 'bg-[#15803D] text-[#FFFFFF]'
                      : 'bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF]'
                  }`}
                  title="Save changes instantly (Cmd/Ctrl + S)"
                >
                  {diskSyncStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : justSavedBanner ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                      {isDirty && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#93C5FD]" />
                      )}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="h-8 w-8 rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center justify-center text-[#4B5B6E] hover:text-[#163B66] cursor-pointer shrink-0"
                  title="Close Live CMS"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Instant Save Status Strip */}
            <div
              className={`px-5 py-2 border-b text-[11.5px] flex items-center justify-between gap-2 shrink-0 transition-colors ${
                justSavedBanner
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#166534]'
                  : isDirty
                    ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#163B66]'
                    : 'bg-[#F8FAFC] border-[#E5E7EB] text-[#4B5B6E]'
              }`}
            >
              {diskSyncStatus === 'saving' ? (
                <span className="inline-flex items-center gap-1.5 font-mono-tabular text-[11px] text-[#2E5A8A]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving changes to workspace &amp; browser…</span>
                </span>
              ) : justSavedBanner ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-[#166534]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#16A34A]" />
                  <span>
                    Changes saved instantly
                    {savedAtLabel ? ` at ${savedAtLabel}` : ''} · Persisted to
                    ZIP
                  </span>
                </span>
              ) : isDirty ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-[#163B66]">
                  <span className="h-2 w-2 rounded-full bg-[#2E5A8A] shrink-0" />
                  <span>Unsaved edits — click Save Changes (⌘S)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-mono-tabular text-[10.5px] text-[#4B5B6E]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#2E5A8A]" />
                  <span>
                    {savedAtLabel
                      ? `All changes saved · ${savedAtLabel}`
                      : 'All changes synced with workspace files'}
                  </span>
                </span>
              )}
            </div>

            {/* Instant Preview Screen Switcher */}
            <div className="px-5 py-2.5 bg-[#F8FAFC] border-b border-[#E5E7EB] shrink-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono-tabular text-[10.5px] font-medium text-[#64748B] uppercase">
                  <Eye className="w-3 h-3 text-[#2E5A8A]" />
                  <span>LIVE PREVIEW SCREEN</span>
                </div>
                <span className="font-mono-tabular text-[10px] text-[#64748B]">
                  ⌘S / Ctrl+S to Save
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectSection('gate')}
                  className={`rounded-[6px] px-1.5 py-1.5 text-[11px] font-medium border cursor-pointer transition-colors whitespace-nowrap ${
                    !isAuthenticated
                      ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                      : 'bg-[#FFFFFF] text-[#4B5B6E] border-[#E5E7EB] hover:text-[#163B66]'
                  }`}
                >
                  Gate
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSection('walkthrough')}
                  className={`rounded-[6px] px-1.5 py-1.5 text-[11px] font-medium border cursor-pointer transition-colors whitespace-nowrap ${
                    isAuthenticated && activeTab === 'walkthrough'
                      ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                      : 'bg-[#FFFFFF] text-[#4B5B6E] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
                  }`}
                >
                  01·Video
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSection('architecture')}
                  className={`rounded-[6px] px-1.5 py-1.5 text-[11px] font-medium border cursor-pointer transition-colors whitespace-nowrap ${
                    isAuthenticated && activeTab === 'architecture'
                      ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                      : 'bg-[#FFFFFF] text-[#4B5B6E] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
                  }`}
                >
                  02·Sec
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSection('agents')}
                  className={`rounded-[6px] px-1.5 py-1.5 text-[11px] font-medium border cursor-pointer transition-colors whitespace-nowrap ${
                    isAuthenticated && activeTab === 'agents'
                      ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                      : 'bg-[#FFFFFF] text-[#4B5B6E] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
                  }`}
                >
                  03·Suite
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSection('roi')}
                  className={`rounded-[6px] px-1.5 py-1.5 text-[11px] font-medium border cursor-pointer transition-colors whitespace-nowrap ${
                    isAuthenticated && activeTab === 'roi'
                      ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                      : 'bg-[#FFFFFF] text-[#4B5B6E] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
                  }`}
                >
                  04·ROI
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSection('faq')}
                  className={`rounded-[6px] px-1.5 py-1.5 text-[11px] font-medium border cursor-pointer transition-colors whitespace-nowrap ${
                    isAuthenticated && activeTab === 'faq'
                      ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                      : 'bg-[#FFFFFF] text-[#4B5B6E] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
                  }`}
                >
                  05·FAQ
                </button>
              </div>
            </div>

            {/* Section Selector Pills */}
            <div className="px-5 py-2.5 border-b border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto fortifai-scroll shrink-0">
              {(
                [
                  { id: 'walkthrough', label: '01 · Walkthrough' },
                  { id: 'architecture', label: '02 · Architecture' },
                  { id: 'agents', label: '03 · Agents' },
                  { id: 'roi', label: '04 · Business Case' },
                  { id: 'faq', label: '05 · Executive FAQ' },
                  { id: 'gate', label: 'Gate & Codes' },
                  { id: 'header', label: 'Header & Security' },
                ] as const
              ).map((sec) => {
                const active = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleSelectSection(sec.id)}
                    className={`px-2.5 py-1 rounded-[7px] text-[12px] font-medium whitespace-nowrap border cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#E8F0F8] text-[#163B66] border-[#6699CC]/50'
                        : 'bg-transparent text-[#4B5B6E] border-transparent hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Editor Body */}
            <div className="flex-1 overflow-y-auto fortifai-scroll p-5 space-y-4">
              {activeSection === 'walkthrough' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Tab 01 Navigation Label
                    </label>
                    <input
                      type="text"
                      value={walkthroughTab?.label ?? ''}
                      onChange={(e) =>
                        updateTabItem('walkthrough', { label: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Video Source URL (Embed or Direct `.mp4`)
                    </label>
                    <input
                      type="url"
                      value={config.walkthrough.trupeerEmbedUrl}
                      onChange={(e) =>
                        updateWalkthrough({ trupeerEmbedUrl: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 font-mono-tabular text-[12px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                    <p className="mt-1 text-[11.5px] leading-[1.45] text-[#64748B]">
                      Tip: Paste a direct{' '}
                      <span className="font-mono-tabular">.mp4</span> file URL
                      to switch automatically to the native zero-stamp player.
                    </p>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-2">
                    <input
                      type="checkbox"
                      checked={config.walkthrough.maskCornerStamp}
                      onChange={(e) =>
                        updateWalkthrough({ maskCornerStamp: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#163B66]"
                    />
                    <span className="text-[12px] text-[#163B66] font-medium">
                      Mask third-party corner stamp with Fortifai shield
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                        Duration Pill
                      </label>
                      <input
                        type="text"
                        value={config.walkthrough.durationBadge}
                        onChange={(e) =>
                          updateWalkthrough({ durationBadge: e.target.value })
                        }
                        className="w-full h-[34px] rounded-[8px] border border-[#D1D5DB] px-2.5 font-mono-tabular text-[11.5px] text-[#0D1520]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                        Play CTA Button
                      </label>
                      <input
                        type="text"
                        value={config.walkthrough.coverPlayLabel}
                        onChange={(e) =>
                          updateWalkthrough({ coverPlayLabel: e.target.value })
                        }
                        className="w-full h-[34px] rounded-[8px] border border-[#D1D5DB] px-2.5 text-[12.5px] text-[#0D1520]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Cover Stage Headline
                    </label>
                    <input
                      type="text"
                      value={config.walkthrough.coverHeadline}
                      onChange={(e) =>
                        updateWalkthrough({ coverHeadline: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Page H1 Headline
                    </label>
                    <input
                      type="text"
                      value={config.walkthrough.headline}
                      onChange={(e) =>
                        updateWalkthrough({ headline: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      1-Line Subtitle
                    </label>
                    <textarea
                      rows={2}
                      value={config.walkthrough.subtitle}
                      onChange={(e) =>
                        updateWalkthrough({ subtitle: e.target.value })
                      }
                      className="w-full rounded-[8px] border border-[#D1D5DB] p-2.5 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                    <span className="block font-mono-tabular text-[11px] font-medium text-[#2E5A8A] uppercase">
                      4 WALKTHROUGH CHAPTERS
                    </span>
                    {config.walkthrough.chapters.map((ch, idx) => (
                      <div
                        key={idx}
                        className="rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono-tabular text-[11px] font-medium text-[#2E5A8A]">
                            {ch.code}
                          </span>
                          <input
                            type="text"
                            value={ch.title}
                            onChange={(e) => {
                              const next = config.walkthrough.chapters.map(
                                (item, cIdx) =>
                                  cIdx === idx
                                    ? { ...item, title: e.target.value }
                                    : item
                              );
                              updateWalkthrough({ chapters: next });
                            }}
                            className="flex-1 h-[30px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2 text-[12.5px] text-[#163B66]"
                          />
                        </div>
                        <input
                          type="text"
                          value={ch.detail}
                          onChange={(e) => {
                            const next = config.walkthrough.chapters.map(
                              (item, cIdx) =>
                                cIdx === idx
                                  ? { ...item, detail: e.target.value }
                                  : item
                            );
                            updateWalkthrough({ chapters: next });
                          }}
                          className="w-full h-[30px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2 text-[12px] text-[#4B5B6E]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#E5E7EB] space-y-2.5">
                    <span className="block font-mono-tabular text-[11px] font-medium text-[#2E5A8A] uppercase">
                      3 COMPACT METRIC CARDS
                    </span>
                    {config.walkthrough.metrics.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] p-2.5 space-y-1.5"
                      >
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={item.metric}
                            onChange={(e) => {
                              const next = config.walkthrough.metrics.map(
                                (m, mIdx) =>
                                  mIdx === idx
                                    ? { ...m, metric: e.target.value }
                                    : m
                              );
                              updateWalkthrough({ metrics: next });
                            }}
                            className="col-span-1 h-[32px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2 font-mono-tabular text-[12.5px] text-[#163B66]"
                          />
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const next = config.walkthrough.metrics.map(
                                (m, mIdx) =>
                                  mIdx === idx
                                    ? { ...m, label: e.target.value }
                                    : m
                              );
                              updateWalkthrough({ metrics: next });
                            }}
                            className="col-span-2 h-[32px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12.5px] text-[#0D1520]"
                          />
                        </div>
                        <input
                          type="text"
                          value={item.sublabel ?? ''}
                          placeholder="Metric sublabel"
                          onChange={(e) => {
                            const next = config.walkthrough.metrics.map(
                              (m, mIdx) =>
                                mIdx === idx
                                  ? { ...m, sublabel: e.target.value }
                                  : m
                            );
                            updateWalkthrough({ metrics: next });
                          }}
                          className="w-full h-[30px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12px] text-[#4B5B6E]"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Bottom Continuation Prompt
                    </label>
                    <input
                      type="text"
                      value={config.walkthrough.nextStepPrompt}
                      onChange={(e) =>
                        updateWalkthrough({ nextStepPrompt: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520]"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'architecture' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Tab 02 Navigation Label
                    </label>
                    <input
                      type="text"
                      value={architectureTab?.label ?? ''}
                      onChange={(e) =>
                        updateTabItem('architecture', { label: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Eyebrow Pill
                    </label>
                    <input
                      type="text"
                      value={config.architecture.pillLabel}
                      onChange={(e) =>
                        updateArchitecture({ pillLabel: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Studio Headline
                    </label>
                    <input
                      type="text"
                      value={config.architecture.headline}
                      onChange={(e) =>
                        updateArchitecture({ headline: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Studio Sub-copy
                    </label>
                    <textarea
                      rows={2}
                      value={config.architecture.subcopy}
                      onChange={(e) =>
                        updateArchitecture({ subcopy: e.target.value })
                      }
                      className="w-full rounded-[8px] border border-[#D1D5DB] p-2.5 text-[13px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  {(
                    [
                      {
                        num: '04',
                        badgeKey: 'layer4Badge',
                        titleKey: 'layer4Title',
                        summaryKey: 'layer4Summary',
                      },
                      {
                        num: '03',
                        badgeKey: 'layer3Badge',
                        titleKey: 'layer3Title',
                        summaryKey: 'layer3Summary',
                      },
                      {
                        num: '02',
                        badgeKey: 'layer2Badge',
                        titleKey: 'layer2Title',
                        summaryKey: 'layer2Summary',
                      },
                      {
                        num: '01',
                        badgeKey: 'layer1Badge',
                        titleKey: 'layer1Title',
                        summaryKey: 'layer1Summary',
                      },
                    ] as const
                  ).map((layerMeta) => (
                    <div
                      key={layerMeta.num}
                      className="rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] p-3 space-y-2"
                    >
                      <span className="font-mono-tabular text-[11px] font-medium text-[#2E5A8A] uppercase">
                        LAYER {layerMeta.num}
                      </span>
                      <input
                        type="text"
                        value={config.architecture[layerMeta.badgeKey]}
                        onChange={(e) =>
                          updateArchitecture({
                            [layerMeta.badgeKey]: e.target.value,
                          })
                        }
                        placeholder="Floating left pill"
                        className="w-full h-[32px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 font-mono-tabular text-[11.5px] text-[#163B66]"
                      />
                      <input
                        type="text"
                        value={config.architecture[layerMeta.titleKey]}
                        onChange={(e) =>
                          updateArchitecture({
                            [layerMeta.titleKey]: e.target.value,
                          })
                        }
                        placeholder="Accordion title"
                        className="w-full h-[32px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12.5px] text-[#0D1520]"
                      />
                      <textarea
                        rows={2}
                        value={config.architecture[layerMeta.summaryKey]}
                        onChange={(e) =>
                          updateArchitecture({
                            [layerMeta.summaryKey]: e.target.value,
                          })
                        }
                        className="w-full rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] p-2 text-[12px] text-[#4B5B6E]"
                      />
                      {layerMeta.num === '02' && (
                        <div className="pt-1">
                          <label className="block text-[11px] font-medium text-[#163B66] mb-1">
                            Engine Layers (one per line)
                          </label>
                          <textarea
                            rows={6}
                            value={layer2Draft}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setLayer2Draft(raw);
                              const items = raw
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean);
                              if (items.length > 0) {
                                updateArchitecture({
                                  layer2Capabilities: items,
                                });
                              }
                            }}
                            className="w-full rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] p-2 text-[12px] text-[#0D1520]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'agents' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Tab 03 Navigation Label
                    </label>
                    <input
                      type="text"
                      value={agentsTab?.label ?? ''}
                      onChange={(e) =>
                        updateTabItem('agents', { label: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Eyebrow Pill
                    </label>
                    <input
                      type="text"
                      value={
                        agentsTab?.utilityEyebrow ??
                        'FORTIFAI SARA · SPECIALIZED AGENT CATALOGUE'
                      }
                      onChange={(e) =>
                        updateTabItem('agents', {
                          utilityEyebrow: e.target.value,
                        })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 font-mono-tabular text-[11.5px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Page H1 Headline
                    </label>
                    <input
                      type="text"
                      value={
                        agentsTab?.utilityTitle ?? 'Active Domain Agent Suite'
                      }
                      onChange={(e) =>
                        updateTabItem('agents', {
                          utilityTitle: e.target.value,
                        })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Page Subtitle
                    </label>
                    <textarea
                      rows={3}
                      value={
                        agentsTab?.utilitySubtitle ??
                        'Specialized domain agents executing natively inside your private cloud on Fortifai SARA—combining deterministic verification, Fortifai D7 external corroboration, and plain-English audit dossiers.'
                      }
                      onChange={(e) =>
                        updateTabItem('agents', {
                          utilitySubtitle: e.target.value,
                        })
                      }
                      className="w-full rounded-[8px] border border-[#D1D5DB] p-2.5 text-[12.5px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div className="rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] p-3 space-y-1">
                    <span className="block font-mono-tabular text-[10.5px] font-medium text-[#2E5A8A] uppercase">
                      SYNCHRONIZED 17-AGENT CATALOGUE
                    </span>
                    <p className="text-[12px] leading-[1.5] text-[#4B5B6E]">
                      Renders the canonical 17 Fortifai domain agents natively in
                      Tab 03 and keeps standalone{' '}
                      <span className="font-mono-tabular">
                        /agent-suite.html
                      </span>{' '}
                      synchronized for external embeds.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'roi' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Tab 04 Navigation Label
                    </label>
                    <input
                      type="text"
                      value={roiTab?.label ?? ''}
                      onChange={(e) =>
                        updateTabItem('roi', { label: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      ROI Eyebrow Pill
                    </label>
                    <input
                      type="text"
                      value={config.roi.pillLabel}
                      onChange={(e) =>
                        updateRoi({ pillLabel: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 font-mono-tabular text-[12px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      ROI Headline
                    </label>
                    <input
                      type="text"
                      value={config.roi.headline}
                      onChange={(e) => updateRoi({ headline: e.target.value })}
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      ROI Subtitle
                    </label>
                    <textarea
                      rows={2}
                      value={config.roi.subtitle}
                      onChange={(e) => updateRoi({ subtitle: e.target.value })}
                      className="w-full rounded-[8px] border border-[#D1D5DB] p-2.5 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                    <span className="block font-mono-tabular text-[11px] font-medium text-[#2E5A8A] uppercase">
                      4 LIVE-DEPLOYMENT EVIDENCE CARDS (USD $)
                    </span>
                    {config.roi.evidenceCards.map((card, idx) => (
                      <div
                        key={idx}
                        className="rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] p-2.5 space-y-1.5"
                      >
                        <input
                          type="text"
                          value={card.metric}
                          onChange={(e) => {
                            const next = config.roi.evidenceCards.map(
                              (c, cIdx) =>
                                cIdx === idx
                                  ? { ...c, metric: e.target.value }
                                  : c
                            );
                            updateRoi({ evidenceCards: next });
                          }}
                          className="w-full h-[32px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 font-mono-tabular text-[12.5px] font-medium text-[#163B66]"
                        />
                        <input
                          type="text"
                          value={card.label}
                          onChange={(e) => {
                            const next = config.roi.evidenceCards.map(
                              (c, cIdx) =>
                                cIdx === idx
                                  ? { ...c, label: e.target.value }
                                  : c
                            );
                            updateRoi({ evidenceCards: next });
                          }}
                          className="w-full h-[32px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12px] text-[#4B5B6E]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'faq' && (
                <div className="space-y-4">
                  {/* Add New Question & Answer Card */}
                  <form
                    onSubmit={handleAddFaqItem}
                    className="rounded-[12px] bg-[#F4F8FC] border border-[#6699CC]/45 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-tabular text-[11px] font-medium text-[#163B66] uppercase">
                        + ADD NEW FAQ QUESTION &amp; ANSWER
                      </span>
                      {faqAddedNotice && (
                        <span className="inline-flex items-center gap-1 font-mono-tabular text-[10.5px] font-medium text-[#16A34A]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Added to FAQ</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="cms-new-faq-cat"
                        className="block text-[11.5px] font-medium text-[#163B66] mb-1"
                      >
                        Category
                      </label>
                      <select
                        id="cms-new-faq-cat"
                        value={newFaqCategory}
                        onChange={(e) =>
                          setNewFaqCategory(e.target.value as FaqCategory)
                        }
                        className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12.5px] text-[#163B66] focus:outline-none focus:border-[#2E5A8A]"
                      >
                        {FAQ_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="cms-new-faq-q"
                        className="block text-[11.5px] font-medium text-[#163B66] mb-1"
                      >
                        Question
                      </label>
                      <input
                        id="cms-new-faq-q"
                        type="text"
                        required
                        placeholder="Enter buyer diligence question…"
                        value={newFaqQuestion}
                        onChange={(e) => setNewFaqQuestion(e.target.value)}
                        className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12.5px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="cms-new-faq-a"
                        className="block text-[11.5px] font-medium text-[#163B66] mb-1"
                      >
                        Answer
                      </label>
                      <textarea
                        id="cms-new-faq-a"
                        rows={3}
                        required
                        placeholder="Enter concise executive answer…"
                        value={newFaqAnswer}
                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                        className="w-full rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] p-2.5 text-[12.5px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3 py-2 text-[12.5px] font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question &amp; Answer to FAQ</span>
                    </button>
                  </form>

                  {/* FAQ Header Metadata */}
                  <div className="space-y-2.5 pt-1 border-t border-[#E5E7EB]">
                    <div>
                      <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                        Tab 05 Navigation Label
                      </label>
                      <input
                        type="text"
                        value={faqTab?.label ?? ''}
                        onChange={(e) =>
                          updateTabItem('faq', { label: e.target.value })
                        }
                        className="w-full h-[34px] rounded-[8px] border border-[#D1D5DB] px-3 text-[12.5px] text-[#0D1520]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                          FAQ Headline
                        </label>
                        <input
                          type="text"
                          value={config.faq.headline}
                          onChange={(e) =>
                            updateFaq({ headline: e.target.value })
                          }
                          className="w-full h-[34px] rounded-[8px] border border-[#D1D5DB] px-2.5 text-[12.5px] text-[#0D1520]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                          Eyebrow Label
                        </label>
                        <input
                          type="text"
                          value={config.faq.pillLabel}
                          onChange={(e) =>
                            updateFaq({ pillLabel: e.target.value })
                          }
                          className="w-full h-[34px] rounded-[8px] border border-[#D1D5DB] px-2.5 font-mono-tabular text-[11px] text-[#0D1520]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                        FAQ Subtitle
                      </label>
                      <input
                        type="text"
                        value={config.faq.subtitle}
                        onChange={(e) =>
                          updateFaq({ subtitle: e.target.value })
                        }
                        className="w-full h-[34px] rounded-[8px] border border-[#D1D5DB] px-3 text-[12.5px] text-[#0D1520]"
                      />
                    </div>
                  </div>

                  {/* Existing FAQ Items List */}
                  <div className="pt-2 border-t border-[#E5E7EB] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular text-[11px] font-medium text-[#2E5A8A] uppercase">
                        PUBLISHED FAQ ITEMS ({config.faq.items.length})
                      </span>
                    </div>

                    {config.faq.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-mono-tabular text-[11px] font-medium text-[#2E5A8A] shrink-0">
                              Q{String(idx + 1).padStart(2, '0')}
                            </span>
                            <select
                              aria-label={`FAQ ${idx + 1} category`}
                              value={item.category}
                              onChange={(e) =>
                                handleUpdateFaqItem(item.id, {
                                  category: e.target.value as FaqCategory,
                                })
                              }
                              className="h-[28px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2 text-[11.5px] text-[#163B66]"
                            >
                              {FAQ_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveFaqItem(idx, -1)}
                              className="h-6 w-6 rounded-[5px] border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F1F5F9] flex items-center justify-center text-[#4B5B6E] disabled:opacity-35 cursor-pointer"
                              title="Move up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === config.faq.items.length - 1}
                              onClick={() => handleMoveFaqItem(idx, 1)}
                              className="h-6 w-6 rounded-[5px] border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F1F5F9] flex items-center justify-center text-[#4B5B6E] disabled:opacity-35 cursor-pointer"
                              title="Move down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={config.faq.items.length <= 1}
                              onClick={() => handleDeleteFaqItem(item.id)}
                              className="h-6 w-6 rounded-[5px] border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FDECEC] flex items-center justify-center text-[#64748B] hover:text-[#8B1A1A] disabled:opacity-35 cursor-pointer"
                              title="Remove FAQ item"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) =>
                            handleUpdateFaqItem(item.id, {
                              question: e.target.value,
                            })
                          }
                          className="w-full h-[32px] rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12.5px] font-medium text-[#163B66]"
                        />

                        <textarea
                          rows={3}
                          value={item.answer}
                          onChange={(e) =>
                            handleUpdateFaqItem(item.id, {
                              answer: e.target.value,
                            })
                          }
                          className="w-full rounded-[6px] border border-[#D1D5DB] bg-[#FFFFFF] p-2 text-[12px] leading-[1.45] text-[#4B5B6E]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'gate' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                        Top-Right Badge
                      </label>
                      <input
                        type="text"
                        value={config.gate.badgeLabel}
                        onChange={(e) =>
                          updateGate({ badgeLabel: e.target.value })
                        }
                        className="w-full h-[34px] rounded-[8px] border border-[#D1D5DB] px-2.5 font-mono-tabular text-[11.5px] text-[#0D1520]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                        Submit CTA Label
                      </label>
                      <input
                        type="text"
                        value={config.gate.submitButtonLabel}
                        onChange={(e) =>
                          updateGate({ submitButtonLabel: e.target.value })
                        }
                        className="w-full h-[34px] rounded-[8px] border border-[#D1D5DB] px-2.5 text-[12px] text-[#0D1520]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Gate Eyebrow
                    </label>
                    <input
                      type="text"
                      value={config.gate.eyebrow}
                      onChange={(e) => updateGate({ eyebrow: e.target.value })}
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 font-mono-tabular text-[12px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Gate Headline
                    </label>
                    <input
                      type="text"
                      value={config.gate.headline}
                      onChange={(e) => updateGate({ headline: e.target.value })}
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Gate Sub-copy
                    </label>
                    <textarea
                      rows={2}
                      value={config.gate.subcopy}
                      onChange={(e) => updateGate({ subcopy: e.target.value })}
                      className="w-full rounded-[8px] border border-[#D1D5DB] p-2.5 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Valid Partner Access Codes (comma-separated)
                    </label>
                    <textarea
                      rows={2}
                      value={accessCodesDraft}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setAccessCodesDraft(raw);
                        const codes = raw
                          .split(',')
                          .map((c) => c.trim().toUpperCase())
                          .filter(Boolean);
                        if (codes.length > 0) {
                          updateGate({ validAccessCodes: codes });
                        }
                      }}
                      className="w-full rounded-[8px] border border-[#D1D5DB] p-2.5 font-mono-tabular text-[12px] text-[#0D1520]"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.gate.enforceCorporateEmail}
                      onChange={(e) =>
                        updateGate({ enforceCorporateEmail: e.target.checked })
                      }
                      className="h-4 w-4 accent-[#163B66]"
                    />
                    <span className="text-[12.5px] text-[#4B5B6E]">
                      Block personal webmail domains (gmail, yahoo, outlook…)
                    </span>
                  </label>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Checkbox Consent Copy
                    </label>
                    <input
                      type="text"
                      value={config.gate.checkboxLabel}
                      onChange={(e) =>
                        updateGate({ checkboxLabel: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[12.5px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Footer Attribution Line
                    </label>
                    <input
                      type="text"
                      value={config.gate.footerAttribution}
                      onChange={(e) =>
                        updateGate({ footerAttribution: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 font-mono-tabular text-[11.5px] text-[#0D1520]"
                    />
                  </div>

                  <div className="rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] p-3 space-y-1">
                    <span className="block font-mono-tabular text-[10.5px] font-medium text-[#2E5A8A] uppercase">
                      SUPABASE AUDIT TELEMETRY ACTIVE
                    </span>
                    <p className="text-[12px] leading-[1.5] text-[#4B5B6E]">
                      External corporate{' '}
                      <span className="font-mono-tabular">GATE_LOGIN</span>,{' '}
                      <span className="font-mono-tabular">TAB_VIEW</span>, and{' '}
                      <span className="font-mono-tabular">ROI_SIMULATION</span>{' '}
                      events log silently to{' '}
                      <span className="font-mono-tabular">
                        public.portal_access_logs
                      </span>
                      . Internal{' '}
                      <span className="font-mono-tabular">@fortifai.io</span>{' '}
                      sessions unlock immediately and are excluded from external
                      logs.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'header' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Header Badge Pill
                    </label>
                    <input
                      type="text"
                      value={config.header.portalPillLabel}
                      onChange={(e) =>
                        updateHeader({ portalPillLabel: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 font-mono-tabular text-[12px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Primary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={config.header.bookDemoLabel}
                      onChange={(e) =>
                        updateHeader({ bookDemoLabel: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Primary CTA Bookings URL
                    </label>
                    <input
                      type="url"
                      value={config.header.bookDemoUrl}
                      onChange={(e) =>
                        updateHeader({ bookDemoUrl: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 font-mono-tabular text-[12px] text-[#0D1520]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                      Sign Out Button Label
                    </label>
                    <input
                      type="text"
                      value={config.header.signOutLabel}
                      onChange={(e) =>
                        updateHeader({ signOutLabel: e.target.value })
                      }
                      className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] text-[#0D1520]"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] space-y-2.5">
                    <span className="block font-mono-tabular text-[11px] font-medium text-[#2E5A8A] uppercase">
                      WATERMARK &amp; CONTENT PROTECTION
                    </span>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.security.enableWatermark}
                        onChange={(e) =>
                          updateSecurity({ enableWatermark: e.target.checked })
                        }
                        className="h-4 w-4 accent-[#163B66]"
                      />
                      <span className="text-[12.5px] text-[#4B5B6E]">
                        Enable diagonal SVG session watermark (opacity 0.035)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.security.disableRightClick}
                        onChange={(e) =>
                          updateSecurity({
                            disableRightClick: e.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-[#163B66]"
                      />
                      <span className="text-[12.5px] text-[#4B5B6E]">
                        Disable right-click context menu
                      </span>
                    </label>

                    <div>
                      <label className="block text-[12px] font-medium text-[#163B66] mb-1">
                        Watermark Classification Suffix
                      </label>
                      <input
                        type="text"
                        value={config.security.watermarkSuffix}
                        onChange={(e) =>
                          updateSecurity({ watermarkSuffix: e.target.value })
                        }
                        className="w-full h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 font-mono-tabular text-[12px] text-[#0D1520]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Drawer Footer with Primary Instant Save Button */}
            <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onResetDefaults}
                  disabled={!hasCustomEdits}
                  className="inline-flex items-center gap-1 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E5E7EB] px-2.5 py-2 text-[11.5px] font-medium text-[#4B5B6E] hover:text-[#163B66] disabled:opacity-45 cursor-pointer transition-colors"
                  title="Reset all CMS fields to factory defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTsConfig}
                  className="inline-flex items-center gap-1 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E5E7EB] px-2.5 py-2 text-[11.5px] font-medium text-[#4B5B6E] hover:text-[#163B66] cursor-pointer transition-colors"
                  title="Copy TypeScript config backup to clipboard"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy TS</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => void onSaveNow()}
                disabled={diskSyncStatus === 'saving'}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-[8px] px-4 py-2 text-[12.5px] font-medium transition-colors cursor-pointer disabled:opacity-75 ${
                  justSavedBanner
                    ? 'bg-[#15803D] text-[#FFFFFF]'
                    : 'bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF]'
                }`}
              >
                {diskSyncStatus === 'saving' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes…</span>
                  </>
                ) : justSavedBanner ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Changes Saved ✓</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                    {isDirty && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#93C5FD]" />
                    )}
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
