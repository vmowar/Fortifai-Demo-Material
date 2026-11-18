import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Database,
  FileCheck2,
  GlobeLock,
  Layers,
  Lock,
  Scale,
  Server,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ArchitectureStudioConfig, TabId } from '../config/briefingConfig';

type LayerId = 4 | 3 | 2 | 1;

interface SaraArchitectureStudioTabProps {
  config: ArchitectureStudioConfig;
  bookDemoUrl: string;
  onSelectTab: (tab: TabId) => void;
}

const TECHNICAL_SECURITY_PILLARS = [
  {
    code: '01',
    title: 'Infrastructure Isolation',
    body: 'Customer-hosted AWS/Azure/GCP VPC or On-Premises K8s; Customer IT managed firewall with default-deny outbound network policies; segregated staging, UAT, and production environments.',
    icon: Server,
  },
  {
    code: '02',
    title: 'AI & Data Privacy',
    body: '0% customer data used in LLM training; deterministic and validated SQL & rule execution preventing hallucinated figures; TLS 1.3 & AES-256 with Customer-Managed Keys.',
    icon: Lock,
  },
  {
    code: '03',
    title: 'Regulatory & Regional Residency',
    body: "SOC 2 Type II & ISO/IEC 27001 certified; supports regional data residency requirements, data minimization practices, and contractual data processing commitments, subject to the customer's deployment and processing arrangements.",
    icon: GlobeLock,
  },
  {
    code: '04',
    title: 'Audit & Legal Defensibility',
    body: 'Subledger-to-GL completeness checks (PCAOB AS 1105 aligned); objective non-conclusive framing ("Signals, Not Verdicts") with isolated Counsel review queue.',
    icon: Scale,
  },
] as const;

/**
 * Tab 2 (02 · Architecture & Security)
 * - Top: 2-Column Interactive 3D SARA Architecture Studio
 * - Beneath: Trust & Security Architecture (4 Proof Pills + #EEF2F7 Zero-Egress Perimeter Well + 2x2 Technical Security Grid)
 */
export const SaraArchitectureStudioTab: React.FC<
  SaraArchitectureStudioTabProps
> = ({ config, bookDemoUrl, onSelectTab }) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerId>(4);
  const [hoveredLayer, setHoveredLayer] = useState<LayerId | null>(null);
  const [selectedDomainIndex, setSelectedDomainIndex] = useState<number>(0);

  const activeLayer: LayerId = hoveredLayer ?? selectedLayer;

  const stackFocusClass =
    activeLayer === 4
      ? 'sara-stack-focus-4'
      : activeLayer === 3
        ? 'sara-stack-focus-3'
        : activeLayer === 2
          ? 'sara-stack-focus-2'
          : 'sara-stack-focus-1';

  const floatingBadges: {
    layer: LayerId;
    label: string;
    verticalSlotClass: string;
  }[] = [
    {
      layer: 4,
      label: config.layer4Badge,
      verticalSlotClass: 'top-[80px]',
    },
    {
      layer: 3,
      label: config.layer3Badge,
      verticalSlotClass: 'top-[164px]',
    },
    {
      layer: 2,
      label: config.layer2Badge,
      verticalSlotClass: 'top-[248px]',
    },
    {
      layer: 1,
      label: config.layer1Badge,
      verticalSlotClass: 'top-[332px]',
    },
  ];

  const activeDomain =
    config.layer3Domains[selectedDomainIndex] ?? config.layer3Domains[0];

  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-8 pt-8 pb-16 space-y-12">
      {/* ====================================================================
          PART A: 2-COLUMN INTERACTIVE 3D SARA ARCHITECTURE STUDIO
          ==================================================================== */}
      <div className="space-y-6">
        {/* Studio Editorial Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-[780px] space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 fortifai-pill">
              <Layers className="w-3.5 h-3.5 text-[#163B66] shrink-0" />
              <span>{config.pillLabel}</span>
            </span>

            <h1 className="text-[clamp(26px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.02em] text-[#163B66] text-balance">
              {config.headline}
            </h1>

            <p className="text-[15px] font-normal leading-[1.6] text-[#475569]">
              {config.subcopy}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('agents')}
              className="rounded-[8px] bg-[#FFFFFF] hover:bg-[#F5F5F7] border border-[#E5E7EB] px-4 py-2 text-[14px] font-medium text-[#163B66] whitespace-nowrap transition-colors cursor-pointer"
            >
              03 · Active Agent Suite
            </button>
            <a
              href={bookDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-4 py-2 text-[14px] font-medium whitespace-nowrap transition-colors"
            >
              <span>Architecture Deep-Dive</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* 2-COLUMN INTERACTIVE 3D SARA STACK */}
        <section
          aria-label="Interactive 3D SARA Architecture Studio"
          className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-8 items-start"
        >
          {/* LEFT COLUMN: Fixed 480px Tall Crisp White Isometric Stage */}
          <div className="h-[480px] w-full rounded-[14px] border border-[#E5E7EB] fortifai-card-shadow sara-dot-stage relative overflow-hidden select-none">
            {/* Subtle Stage Top Header */}
            <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
              <span className="rounded-[6px] px-2.5 py-1 fortifai-pill">
                ISOMETRIC SOVEREIGN STACK · ZERO EGRESS
              </span>
              <span className="rounded-[6px] bg-[#E8F0F8] border border-[#6699CC]/35 px-2.5 py-1 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] uppercase text-[#163B66]">
                LAYER 0{activeLayer} ACTIVE
              </span>
            </div>

            {/* Un-tilted Camera-Facing (0deg) Left-Edge Floating Pills + Horizontal Leader Lines */}
            <div className="hidden sm:block absolute inset-0 z-20 pointer-events-none">
              {floatingBadges.map((badge) => {
                const isActive = activeLayer === badge.layer;
                return (
                  <div
                    key={badge.layer}
                    className={`absolute left-5 ${badge.verticalSlotClass} flex items-center pointer-events-auto transition-all duration-300`}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setHoveredLayer(badge.layer)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      onClick={() => setSelectedLayer(badge.layer)}
                      className={`px-3 py-1.5 rounded-[8px] font-mono-tabular text-[11.5px] font-medium tracking-[0.04em] whitespace-nowrap transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66] shadow-[0_6px_18px_rgba(22,59,102,0.22)] translate-x-0.5'
                          : 'bg-[#FFFFFF]/95 text-[#475569] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
                      }`}
                    >
                      {badge.label}
                    </button>

                    {/* Clean Horizontal Leader Line + Terminal Dot */}
                    <div className="flex items-center">
                      <div
                        className={`h-[1.5px] transition-all duration-300 ${
                          isActive
                            ? 'w-9 md:w-12 bg-[#2E5A8A]'
                            : 'w-6 md:w-9 bg-[#CBD5E1]'
                        }`}
                      />
                      <div
                        className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                          isActive
                            ? 'bg-[#6699CC] ring-3 ring-[#6699CC]/25'
                            : 'bg-[#99AFBC]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Compact Layer Selector Bar (< 640px) */}
            <div className="sm:hidden absolute top-14 left-4 right-4 z-20 flex items-center justify-center gap-2">
              {([4, 3, 2, 1] as const).map((layerNum) => {
                const isActive = activeLayer === layerNum;
                return (
                  <button
                    key={layerNum}
                    type="button"
                    onClick={() => setSelectedLayer(layerNum)}
                    className={`px-3 py-1 rounded-[6px] font-mono-tabular text-[12px] font-medium border cursor-pointer ${
                      isActive
                        ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                        : 'bg-[#F5F5F7] text-[#475569] border-[#E5E7EB]'
                    }`}
                  >
                    L0{layerNum}
                  </button>
                );
              })}
            </div>

            {/* Animated Upward Vertical Data Channels (Layer 01 -> Layer 04) */}
            <div
              aria-hidden="true"
              className="absolute inset-y-[84px] left-1/2 sm:left-[68%] -translate-x-1/2 w-[156px] z-10 pointer-events-none flex justify-between px-4"
            >
              <div className="relative h-full w-[1.5px] bg-gradient-to-t from-[#2E5A8A]/25 via-[#6699CC]/35 to-[#2E5A8A]/15 overflow-hidden">
                <div className="w-full h-14 bg-gradient-to-t from-transparent via-[#6699CC] to-[#2E5A8A] sara-flow-particle" />
              </div>
              <div className="relative h-full w-[1.5px] bg-gradient-to-t from-[#2E5A8A]/30 via-[#6699CC]/45 to-[#2E5A8A]/20 overflow-hidden">
                <div className="w-full h-16 bg-gradient-to-t from-transparent via-[#2E5A8A] to-[#6699CC] sara-flow-particle sara-flow-delay-1" />
              </div>
              <div className="relative h-full w-[1.5px] bg-gradient-to-t from-[#2E5A8A]/25 via-[#6699CC]/35 to-[#2E5A8A]/15 overflow-hidden">
                <div className="w-full h-14 bg-gradient-to-t from-transparent via-[#6699CC] to-[#2E5A8A] sara-flow-particle sara-flow-delay-2" />
              </div>
            </div>

            {/* 3D Isometric Glass Stack Viewport — Centered cleanly inside 480px height with zero bottom clipping */}
            <div className="sara-perspective-viewport absolute inset-0 flex items-center justify-center sm:pl-[205px] -mt-2">
              <div
                className={`sara-iso-assembly relative w-[186px] h-[186px] sm:w-[196px] sm:h-[196px] ${stackFocusClass}`}
              >
                {/* PLATE 01 (Bottom): Zero-Egress Customer VPC (Dark Navy Enclave) */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Inspect Layer 01: Zero-Egress Customer VPC"
                  onMouseEnter={() => setHoveredLayer(1)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  onClick={() => setSelectedLayer(1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLayer(1);
                    }
                  }}
                  className={`sara-iso-plate sara-plate-1 sara-plate-z-1-base absolute inset-0 rounded-[18px] p-3.5 cursor-pointer ${
                    activeLayer === 1
                      ? 'sara-plate-active-navy opacity-100'
                      : 'sara-plate-inactive-navy opacity-45'
                  }`}
                >
                  <div className="h-full w-full rounded-[12px] border border-dashed border-[#6699CC]/70 p-2.5 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 rounded-[7px] bg-[#2E5A8A]/45 border border-[#6699CC]/50 flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#6699CC]" />
                      </div>
                      <div className="h-8 rounded-[7px] bg-[#2E5A8A]/45 border border-[#6699CC]/50 flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#6699CC]" />
                      </div>
                    </div>

                    <div className="mx-auto h-10 w-10 rounded-[10px] bg-[#0D1520]/90 border border-[#6699CC] flex items-center justify-center shadow-[0_0_16px_rgba(102,153,204,0.45)]">
                      <div className="h-3.5 w-3.5 rounded-sm border-2 border-[#6699CC]" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 rounded-[7px] bg-[#2E5A8A]/45 border border-[#6699CC]/50 flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#6699CC]" />
                      </div>
                      <div className="h-8 rounded-[7px] bg-[#2E5A8A]/45 border border-[#6699CC]/50 flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#6699CC]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PLATE 02: Fortifai SARA Core Intelligence (6-Engine Lattice) */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Inspect Layer 02: Fortifai SARA Core Intelligence"
                  onMouseEnter={() => setHoveredLayer(2)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  onClick={() => setSelectedLayer(2)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLayer(2);
                    }
                  }}
                  className={`sara-iso-plate sara-plate-2 sara-plate-z-2-base absolute inset-0 rounded-[18px] p-3.5 cursor-pointer ${
                    activeLayer === 2
                      ? 'sara-plate-active-light opacity-100'
                      : 'sara-plate-inactive-light opacity-45'
                  }`}
                >
                  <div className="relative h-full w-full rounded-[12px] border border-[#6699CC]/50 bg-[#FFFFFF]/45 p-2.5 flex items-center justify-center">
                    <svg
                      viewBox="0 0 140 140"
                      className="h-full w-full"
                      aria-hidden="true"
                    >
                      <circle
                        cx="70"
                        cy="70"
                        r="44"
                        fill="none"
                        stroke="#6699CC"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                      <line
                        x1="70"
                        y1="26"
                        x2="70"
                        y2="114"
                        stroke="#2E5A8A"
                        strokeWidth="1.2"
                        strokeOpacity="0.5"
                      />
                      <line
                        x1="32"
                        y1="48"
                        x2="108"
                        y2="92"
                        stroke="#2E5A8A"
                        strokeWidth="1.2"
                        strokeOpacity="0.5"
                      />
                      <line
                        x1="108"
                        y1="48"
                        x2="32"
                        y2="92"
                        stroke="#2E5A8A"
                        strokeWidth="1.2"
                        strokeOpacity="0.5"
                      />

                      <circle cx="70" cy="26" r="6" fill="#FFFFFF" stroke="#2E5A8A" strokeWidth="2" />
                      <circle cx="108" cy="48" r="6" fill="#FFFFFF" stroke="#2E5A8A" strokeWidth="2" />
                      <circle cx="108" cy="92" r="6" fill="#FFFFFF" stroke="#2E5A8A" strokeWidth="2" />
                      <circle cx="70" cy="114" r="6" fill="#FFFFFF" stroke="#2E5A8A" strokeWidth="2" />
                      <circle cx="32" cy="92" r="6" fill="#FFFFFF" stroke="#2E5A8A" strokeWidth="2" />
                      <circle cx="32" cy="48" r="6" fill="#FFFFFF" stroke="#2E5A8A" strokeWidth="2" />

                      <circle cx="70" cy="70" r="14" fill="#163B66" />
                      <circle cx="70" cy="70" r="6" fill="#6699CC" />
                    </svg>
                  </div>
                </div>

                {/* PLATE 03: Specialized Domain Agents (5 Domain Agent Pods) */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Inspect Layer 03: Specialized Domain Agents"
                  onMouseEnter={() => setHoveredLayer(3)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  onClick={() => setSelectedLayer(3)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLayer(3);
                    }
                  }}
                  className={`sara-iso-plate sara-plate-3 sara-plate-z-3-base absolute inset-0 rounded-[18px] p-3.5 cursor-pointer ${
                    activeLayer === 3
                      ? 'sara-plate-active-light opacity-100'
                      : 'sara-plate-inactive-light opacity-45'
                  }`}
                >
                  <div className="h-full w-full rounded-[12px] border border-[#6699CC]/50 bg-[#FFFFFF]/50 p-2.5 grid grid-cols-3 grid-rows-3 gap-2">
                    {[
                      { idx: 0, pos: 'col-start-1 row-start-1' },
                      { idx: 1, pos: 'col-start-3 row-start-1' },
                      { idx: 2, pos: 'col-start-2 row-start-2' },
                      { idx: 3, pos: 'col-start-1 row-start-3' },
                      { idx: 4, pos: 'col-start-3 row-start-3' },
                    ].map((pod) => {
                      const isDomainSelected =
                        activeLayer === 3 && selectedDomainIndex === pod.idx;
                      return (
                        <div
                          key={pod.idx}
                          className={`${pod.pos} rounded-[8px] border flex items-center justify-center transition-all ${
                            isDomainSelected
                              ? 'bg-[#163B66] border-[#163B66] shadow-[0_0_16px_rgba(46,90,138,0.45)] scale-105'
                              : 'bg-[#FFFFFF]/90 border-[#6699CC]/65'
                          }`}
                        >
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${
                              isDomainSelected ? 'bg-[#6699CC]' : 'bg-[#2E5A8A]'
                            }`}
                          />
                        </div>
                      );
                    })}

                    <div className="col-start-2 row-start-1 flex items-center justify-center">
                      <div className="h-[2px] w-full bg-[#6699CC]/60" />
                    </div>
                    <div className="col-start-1 row-start-2 flex items-center justify-center">
                      <div className="w-[2px] h-full bg-[#6699CC]/60" />
                    </div>
                    <div className="col-start-3 row-start-2 flex items-center justify-center">
                      <div className="w-[2px] h-full bg-[#6699CC]/60" />
                    </div>
                    <div className="col-start-2 row-start-3 flex items-center justify-center">
                      <div className="h-[2px] w-full bg-[#6699CC]/60" />
                    </div>
                  </div>
                </div>

                {/* PLATE 04 (Top): Executive Cockpit & QuantumQuery */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Inspect Layer 04: Executive Cockpit and QuantumQuery"
                  onMouseEnter={() => setHoveredLayer(4)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  onClick={() => setSelectedLayer(4)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLayer(4);
                    }
                  }}
                  className={`sara-iso-plate sara-plate-4 sara-plate-z-4-base absolute inset-0 rounded-[18px] p-3.5 cursor-pointer ${
                    activeLayer === 4
                      ? 'sara-plate-active-light opacity-100'
                      : 'sara-plate-inactive-light opacity-45'
                  }`}
                >
                  <div className="h-full w-full rounded-[12px] border border-[#2E5A8A]/45 bg-[#FFFFFF]/65 p-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#163B66]" />
                        <div className="h-2 w-11 rounded-full bg-[#6699CC]/55" />
                      </div>
                      <div className="h-5 w-5 rounded-[6px] bg-[#163B66] flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-[#6699CC]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 items-end h-18 px-1">
                      <div className="h-9 rounded-t-[5px] bg-[#99AFBC]/65 border border-[#6699CC]/40" />
                      <div className="h-12 rounded-t-[5px] bg-[#6699CC]/75 border border-[#2E5A8A]/35" />
                      <div className="h-15 rounded-t-[5px] bg-[#2E5A8A]/85" />
                      <div className="h-18 rounded-t-[5px] bg-[#163B66] shadow-[0_0_14px_rgba(22,59,102,0.3)]" />
                    </div>

                    <div className="h-5.5 rounded-[7px] bg-[#F4F8FC] border border-[#6699CC]/60 px-2.5 flex items-center justify-between">
                      <div className="h-1.5 w-14 rounded-full bg-[#2E5A8A]/65" />
                      <div className="h-2 w-2 rounded-full bg-[#6699CC]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stage Hint */}
            <div className="absolute bottom-4 left-5 right-5 z-20 flex items-center justify-between font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] text-[#64748B] pointer-events-none">
              <span>CLICK OR HOVER ANY PLATE TO INSPECT</span>
              <span>SELECT-ONLY · 0% DATA EGRESS</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Unified #FFFFFF 4-Layer Editorial Hairline Sheet */}
          <div className="rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow divide-y divide-[#E5E7EB] overflow-hidden">
            {/* LAYER 04 ROW */}
            <div
              onMouseEnter={() => setHoveredLayer(4)}
              onMouseLeave={() => setHoveredLayer(null)}
              className={`transition-colors ${
                activeLayer === 4 ? 'bg-[#F8FAFC]/60' : 'bg-[#FFFFFF]'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedLayer(4)}
                aria-expanded={selectedLayer === 4}
                className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`rounded-[6px] px-2 py-0.5 font-mono-tabular text-[12px] font-medium tracking-[0.05em] shrink-0 transition-colors ${
                      activeLayer === 4
                        ? 'bg-[#163B66] text-[#FFFFFF]'
                        : 'bg-[#F5F5F7] border border-[#E5E7EB] text-[#64748B]'
                    }`}
                  >
                    04
                  </span>
                  <h3
                    className={`text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] truncate ${
                      activeLayer === 4 ? 'text-[#163B66]' : 'text-[#0F172A]'
                    }`}
                  >
                    {config.layer4Title}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                    selectedLayer === 4 ? 'rotate-180 text-[#163B66]' : ''
                  }`}
                />
              </button>

              {selectedLayer === 4 && (
                <div className="px-6 pb-6 pt-2 border-t border-[#E5E7EB]/80 space-y-3.5">
                  <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                    {config.layer4Summary}
                  </p>
                  <div className="space-y-2 pt-1">
                    {config.layer4Highlights.map((item, idx) => (
                      <div
                        key={`${item}-${idx}`}
                        className="flex items-center gap-2.5 text-[14.5px] font-medium text-[#0F172A]"
                      >
                        <Sparkles className="w-4 h-4 text-[#163B66] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LAYER 03 ROW — With Interactive Domain Pills */}
            <div
              onMouseEnter={() => setHoveredLayer(3)}
              onMouseLeave={() => setHoveredLayer(null)}
              className={`transition-colors ${
                activeLayer === 3 ? 'bg-[#F8FAFC]/60' : 'bg-[#FFFFFF]'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedLayer(3)}
                aria-expanded={selectedLayer === 3}
                className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`rounded-[6px] px-2 py-0.5 font-mono-tabular text-[12px] font-medium tracking-[0.05em] shrink-0 transition-colors ${
                      activeLayer === 3
                        ? 'bg-[#163B66] text-[#FFFFFF]'
                        : 'bg-[#F5F5F7] border border-[#E5E7EB] text-[#64748B]'
                    }`}
                  >
                    03
                  </span>
                  <h3
                    className={`text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] truncate ${
                      activeLayer === 3 ? 'text-[#163B66]' : 'text-[#0F172A]'
                    }`}
                  >
                    {config.layer3Title}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                    selectedLayer === 3 ? 'rotate-180 text-[#163B66]' : ''
                  }`}
                />
              </button>

              {selectedLayer === 3 && (
                <div className="px-6 pb-6 pt-2 border-t border-[#E5E7EB]/80 space-y-4">
                  <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                    {config.layer3Summary}
                  </p>

                  {/* Interactive Domain Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {config.layer3Domains.map((dom, idx) => {
                      const isSelected = selectedDomainIndex === idx;
                      return (
                        <button
                          key={dom.id}
                          type="button"
                          onClick={() => {
                            setSelectedLayer(3);
                            setSelectedDomainIndex(idx);
                          }}
                          className={`px-3 py-1.5 rounded-[7px] text-[13.5px] font-medium transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                              : 'bg-[#FFFFFF] text-[#475569] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
                          }`}
                        >
                          {dom.name}
                        </button>
                      );
                    })}
                  </div>

                  {activeDomain && (
                    <div className="pt-3 border-t border-[#E5E7EB] space-y-1.5">
                      <span className="inline-block rounded-[5px] px-2 py-0.5 fortifai-pill">
                        SHARED SPINE · {activeDomain.signals}
                      </span>
                      <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                        {activeDomain.detail}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LAYER 02 ROW — 6 Plain-English Engine Layers */}
            <div
              onMouseEnter={() => setHoveredLayer(2)}
              onMouseLeave={() => setHoveredLayer(null)}
              className={`transition-colors ${
                activeLayer === 2 ? 'bg-[#F8FAFC]/60' : 'bg-[#FFFFFF]'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedLayer(2)}
                aria-expanded={selectedLayer === 2}
                className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`rounded-[6px] px-2 py-0.5 font-mono-tabular text-[12px] font-medium tracking-[0.05em] shrink-0 transition-colors ${
                      activeLayer === 2
                        ? 'bg-[#163B66] text-[#FFFFFF]'
                        : 'bg-[#F5F5F7] border border-[#E5E7EB] text-[#64748B]'
                    }`}
                  >
                    02
                  </span>
                  <h3
                    className={`text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] truncate ${
                      activeLayer === 2 ? 'text-[#163B66]' : 'text-[#0F172A]'
                    }`}
                  >
                    {config.layer2Title}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                    selectedLayer === 2 ? 'rotate-180 text-[#163B66]' : ''
                  }`}
                />
              </button>

              {selectedLayer === 2 && (
                <div className="px-6 pb-6 pt-2 border-t border-[#E5E7EB]/80 space-y-3.5">
                  <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                    {config.layer2Summary}
                  </p>
                  <div className="rounded-[10px] border border-[#E5E7EB] bg-[#FFFFFF] divide-y divide-[#E5E7EB]">
                    {config.layer2Capabilities.map((cap, idx) => (
                      <div
                        key={`${cap}-${idx}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[14.5px] font-medium text-[#0F172A]"
                      >
                        <Cpu className="w-4 h-4 text-[#163B66] shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LAYER 01 ROW — Single Source of Truth & Zero-Egress VPC */}
            <div
              onMouseEnter={() => setHoveredLayer(1)}
              onMouseLeave={() => setHoveredLayer(null)}
              className={`transition-colors ${
                activeLayer === 1 ? 'bg-[#F8FAFC]/60' : 'bg-[#FFFFFF]'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedLayer(1)}
                aria-expanded={selectedLayer === 1}
                className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`rounded-[6px] px-2 py-0.5 font-mono-tabular text-[12px] font-medium tracking-[0.05em] shrink-0 transition-colors ${
                      activeLayer === 1
                        ? 'bg-[#163B66] text-[#FFFFFF]'
                        : 'bg-[#F5F5F7] border border-[#E5E7EB] text-[#64748B]'
                    }`}
                  >
                    01
                  </span>
                  <h3
                    className={`text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] truncate ${
                      activeLayer === 1 ? 'text-[#163B66]' : 'text-[#0F172A]'
                    }`}
                  >
                    {config.layer1Title}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                    selectedLayer === 1 ? 'rotate-180 text-[#163B66]' : ''
                  }`}
                />
              </button>

              {selectedLayer === 1 && (
                <div className="px-6 pb-6 pt-2 border-t border-[#E5E7EB]/80 space-y-3.5">
                  <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                    {config.layer1Summary}
                  </p>
                  <div className="rounded-[10px] border border-[#E5E7EB] bg-[#FFFFFF] divide-y divide-[#E5E7EB]">
                    {config.layer1Assurances.map((assurance, idx) => (
                      <div
                        key={`${assurance}-${idx}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[14.5px] font-medium text-[#0F172A]"
                      >
                        {idx === 3 ? (
                          <Lock className="w-4 h-4 text-[#163B66] shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#163B66] shrink-0" />
                        )}
                        <span>{assurance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ====================================================================
          PART B: TRUST & SECURITY ARCHITECTURE SECTION
          ==================================================================== */}
      <section
        aria-labelledby="trust-security-heading"
        className="pt-10 border-t border-[#E5E7EB] space-y-7"
      >
        {/* Section Header + 4 Proof Pills */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div className="space-y-2 max-w-[680px]">
            <span className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 fortifai-pill">
              <ShieldCheck className="w-3.5 h-3.5 text-[#163B66] shrink-0" />
              <span>CISO &amp; AUDIT SECURITY SPECIFICATION</span>
            </span>
            <h2
              id="trust-security-heading"
              className="text-[clamp(26px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.02em] text-[#163B66]"
            >
              Trust &amp; Security Architecture
            </h2>
            <p className="text-[15px] leading-[1.6] text-[#475569]">
              100% sovereign execution inside your Customer Private Cloud VPC or
              On-Premises infrastructure—engineered for enterprise InfoSec,
              Internal Audit, and Legal review.
            </p>
          </div>

          {/* 4 Proof Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-[8px] bg-[#FFFFFF] border border-[#E5E7EB] px-3 py-1.5 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] uppercase text-[#0F172A] whitespace-nowrap">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[#16A34A] shrink-0"
              />
              <span>SOC 2 Type II · Certified</span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-[8px] bg-[#FFFFFF] border border-[#E5E7EB] px-3 py-1.5 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] uppercase text-[#0F172A] whitespace-nowrap">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[#16A34A] shrink-0"
              />
              <span>ISO/IEC 27001 · Certified</span>
            </span>

            <span className="inline-flex items-center rounded-[8px] bg-[#FFFFFF] border border-[#E5E7EB] px-3 py-1.5 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] uppercase text-[#163B66] whitespace-nowrap">
              0 Bytes · Data Egress
            </span>

            <span className="inline-flex items-center rounded-[8px] bg-[#FFFFFF] border border-[#E5E7EB] px-3 py-1.5 font-mono-tabular text-[11.5px] font-medium tracking-[0.05em] uppercase text-[#163B66] whitespace-nowrap">
              0% · Customer Data in LLM Training
            </span>
          </div>
        </div>

        {/* Zero-Egress Perimeter Well (#EEF2F7) */}
        <div className="rounded-[14px] bg-[#EEF2F7] border border-[#CBD5E1] p-6 sm:p-8 space-y-6">
          {/* Perimeter Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#CBD5E1]">
            <div className="flex items-start sm:items-center gap-3">
              <span className="h-8 w-8 rounded-[8px] bg-[#163B66] text-[#FFFFFF] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Lock className="w-4 h-4" />
              </span>
              <p className="text-[15px] font-medium leading-[1.5] text-[#163B66]">
                Customer Private Cloud VPC / On-Premises security managed by
                Customer IT, with default-deny outbound network policies
              </p>
            </div>
            <span className="font-mono-tabular text-[12px] font-medium tracking-[0.05em] uppercase text-[#163B66] whitespace-nowrap">
              ZERO EXTERNAL DATA EGRESS
            </span>
          </div>

          {/* 3 Connected Stage Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-4">
            {/* Stage 1: Read-Only Source Extraction */}
            <article className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-7 flex flex-col justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-[12px] font-medium tracking-[0.05em] uppercase text-[#64748B]">
                    STAGE 01
                  </span>
                  <Database className="w-4 h-4 text-[#163B66] shrink-0" />
                </div>
                <h3 className="text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#0F172A]">
                  Read-Only Source Extraction
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                  SAP S/4HANA &amp; ECC · Oracle · NetSuite · Dynamics 365 ·
                  Snowflake / Databricks
                </p>
              </div>
              <div className="pt-4 border-t border-[#E5E7EB] font-mono-tabular text-[12px] font-medium tracking-[0.03em] text-[#163B66] leading-[1.5]">
                Scheduled read-only batch extraction · Zero unapproved ERP writes
              </div>
            </article>

            {/* Connector 1 -> 2 */}
            <div
              aria-hidden="true"
              className="flex items-center justify-center py-0.5 lg:py-0 text-[#163B66]"
            >
              <ArrowRight className="hidden lg:block w-4 h-4" />
              <ArrowDown className="lg:hidden w-4 h-4" />
            </div>

            {/* Stage 2: In-VPC Fortifai SARA + D7 Engine */}
            <article className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-7 flex flex-col justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-[12px] font-medium tracking-[0.05em] uppercase text-[#64748B]">
                    STAGE 02
                  </span>
                  <Cpu className="w-4 h-4 text-[#163B66] shrink-0" />
                </div>
                <h3 className="text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#0F172A]">
                  In-VPC Fortifai SARA + D7 Engine
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                  Deterministic and validated SQL &amp; rule execution preventing
                  hallucinated figures · Signed in-VPC Fortifai D7 intelligence ·
                  AES-256 + Customer KMS
                </p>
              </div>
              <div className="pt-4 border-t border-[#E5E7EB] font-mono-tabular text-[12px] font-medium tracking-[0.03em] text-[#163B66] leading-[1.5]">
                0% LLM financial math · Customer-Managed Encryption Keys
              </div>
            </article>

            {/* Connector 2 -> 3 */}
            <div
              aria-hidden="true"
              className="flex items-center justify-center py-0.5 lg:py-0 text-[#163B66]"
            >
              <ArrowRight className="hidden lg:block w-4 h-4" />
              <ArrowDown className="lg:hidden w-4 h-4" />
            </div>

            {/* Stage 3: Governance & Audit Integrity */}
            <article className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-7 flex flex-col justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-[12px] font-medium tracking-[0.05em] uppercase text-[#64748B]">
                    STAGE 03
                  </span>
                  <FileCheck2 className="w-4 h-4 text-[#163B66] shrink-0" />
                </div>
                <h3 className="text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#0F172A]">
                  Governance &amp; Audit Integrity
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                  SAML 2.0 / OIDC SSO · Two-person Maker-Checker SoD · Isolated
                  Privileged Legal Queue · 7-year immutable logs
                </p>
              </div>
              <div className="pt-4 border-t border-[#E5E7EB] font-mono-tabular text-[12px] font-medium tracking-[0.03em] text-[#163B66] leading-[1.5]">
                PCAOB AS 1105 document lineage · Immutable disposition trail
              </div>
            </article>
          </div>
        </div>

        {/* Unified 2x2 #FFFFFF Editorial Hairline Technical Security Sheet */}
        <div className="rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] fortifai-card-shadow overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {TECHNICAL_SECURITY_PILLARS.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            const borderClasses =
              idx === 0
                ? 'border-b border-[#E5E7EB] md:border-r'
                : idx === 1
                  ? 'border-b border-[#E5E7EB]'
                  : idx === 2
                    ? 'border-b md:border-b-0 md:border-r border-[#E5E7EB]'
                    : '';
            return (
              <article
                key={pillar.code}
                className={`p-7 sm:p-8 space-y-3 ${borderClasses}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-[5px] px-2 py-0.5 fortifai-pill">
                      {pillar.code}
                    </span>
                    <h3 className="text-[17.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#0F172A]">
                      {pillar.title}
                    </h3>
                  </div>
                  <IconComponent className="w-4 h-4 text-[#163B66] shrink-0" />
                </div>

                <p className="text-[14.5px] leading-[1.6] text-[#334155]">
                  {pillar.body}
                </p>
              </article>
            );
          })}
        </div>

        {/* Bottom Continuation Bar */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] fortifai-card-shadow px-6 py-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[14.5px] leading-[1.6] text-[#334155]">
            Next: Explore the Active Domain Agent Suite or model deduplicated
            USD savings for your enterprise volume.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('agents')}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5F5F7] hover:bg-[#E8F0F8] border border-[#E5E7EB] px-4 py-2 text-[14px] font-medium text-[#163B66] whitespace-nowrap transition-colors cursor-pointer"
            >
              <span>03 · Active Agent Suite</span>
              <ArrowRight className="w-4 h-4 text-[#163B66]" />
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('roi')}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-4 py-2 text-[14px] font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              <span>04 · Business Case &amp; ROI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
