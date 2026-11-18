import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Check,
  Copy,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  AuthenticatedSession,
  BusinessCaseRoiConfig,
  TabId,
} from '../config/briefingConfig';
import { logPortalEvent } from '../lib/supabase';

type RoiDomainId =
  | 'procurement'
  | 'ap_wc'
  | 'revenue_o2c'
  | 'close_audit_compliance'
  | 'full_suite';

type RealizationScenario = 'conservative' | 'benchmark';

interface DomainDefinition {
  id: RoiDomainId;
  title: string;
  agentsLabel: string;
  minUsd: number;
  maxUsd: number;
  stepUsd: number;
  defaultUsd: number;
}

const DOMAIN_DEFINITIONS: readonly DomainDefinition[] = [
  {
    id: 'procurement',
    title: 'Procurement & Supply Chain',
    agentsLabel:
      'Procurement Cost, Pass-Through Vendor, Freight & Inventory, Tender & Bid Risk',
    minUsd: 25_000_000,
    maxUsd: 5_000_000_000,
    stepUsd: 25_000_000,
    defaultUsd: 250_000_000,
  },
  {
    id: 'ap_wc',
    title: 'Accounts Payable & Working Capital',
    agentsLabel: 'Working Capital, Procurement Controls',
    minUsd: 50_000_000,
    maxUsd: 10_000_000_000,
    stepUsd: 50_000_000,
    defaultUsd: 400_000_000,
  },
  {
    id: 'revenue_o2c',
    title: 'Revenue & Order-to-Cash',
    agentsLabel: 'Discounting Risk, Revenue Cut-Off, Demand & Order Risk',
    minUsd: 50_000_000,
    maxUsd: 10_000_000_000,
    stepUsd: 50_000_000,
    defaultUsd: 500_000_000,
  },
  {
    id: 'close_audit_compliance',
    title: 'Finance Close, Audit & Compliance',
    agentsLabel:
      'Balance Sheet Close, Control Testing, Bribery & T&E Risk, Trade Diversion Risk, Vendor Risk Monitoring',
    minUsd: 50_000_000,
    maxUsd: 10_000_000_000,
    stepUsd: 50_000_000,
    defaultUsd: 500_000_000,
  },
  {
    id: 'full_suite',
    title: 'Full Multi-Domain Enterprise Suite',
    agentsLabel:
      'Simultaneous multi-domain coverage across Procurement, Accounts Payable & Working Capital, and Revenue & O2C',
    minUsd: 25_000_000,
    maxUsd: 10_000_000_000,
    stepUsd: 25_000_000,
    defaultUsd: 1_150_000_000,
  },
];

const QUICK_VOLUME_CHIPS: readonly { label: string; value: number }[] = [
  { label: '$100M', value: 100_000_000 },
  { label: '$250M', value: 250_000_000 },
  { label: '$500M', value: 500_000_000 },
  { label: '$1B', value: 1_000_000_000 },
  { label: '$2.5B', value: 2_500_000_000 },
];

const QUICK_AUDIT_HOURS_CHIPS: readonly { label: string; value: number }[] = [
  { label: '2,000 hrs', value: 2_000 },
  { label: '4,000 hrs', value: 4_000 },
  { label: '8,000 hrs', value: 8_000 },
  { label: '15,000 hrs', value: 15_000 },
];

function formatCompactUsd(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return '$0';
  }
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return `$${billions >= 10 ? billions.toFixed(1) : billions.toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `$${millions >= 100 ? millions.toFixed(1) : millions.toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000).toLocaleString('en-US')}K`;
  }
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

function formatFullUsdNumber(amount: number): string {
  return Math.round(amount).toLocaleString('en-US');
}

function clampNumber(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

interface UsdVolumeControlProps {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (nextValue: number) => void;
}

const UsdVolumeControl: React.FC<UsdVolumeControlProps> = ({
  id,
  label,
  sublabel,
  value,
  min,
  max,
  step,
  onChange,
}) => {
  const [rawInput, setRawInput] = useState<string | null>(null);

  const displayedText =
    rawInput !== null ? rawInput : formatFullUsdNumber(value);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    if (!digitsOnly) {
      setRawInput('');
      return;
    }
    const parsed = Number.parseInt(digitsOnly, 10);
    if (Number.isFinite(parsed)) {
      setRawInput(parsed.toLocaleString('en-US'));
      onChange(clampNumber(parsed, min, max));
    }
  };

  const handleBlur = () => {
    setRawInput(null);
  };

  return (
    <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] p-3 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <div>
          <label
            htmlFor={id}
            className="block text-[12px] font-medium text-[#163B66]"
          >
            {label}
          </label>
          {sublabel && (
            <span className="block text-[11px] text-[#64748B]">
              {sublabel}
            </span>
          )}
        </div>
        <span className="font-mono-tabular text-[11px] font-medium text-[#2E5A8A]">
          {formatCompactUsd(value)} USD
        </span>
      </div>

      {/* Formatted USD ($) Numeric Input */}
      <div className="relative flex items-center">
        <span className="absolute left-2.5 font-mono-tabular text-[12.5px] font-medium text-[#163B66] pointer-events-none">
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayedText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          aria-label={label}
          className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] pl-6 pr-12 font-mono-tabular text-[12.5px] font-medium text-[#0D1520] focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/15"
        />
        <span className="absolute right-2.5 font-mono-tabular text-[10px] font-medium text-[#64748B] pointer-events-none">
          USD
        </span>
      </div>

      {/* Smooth Range Slider */}
      <div className="space-y-0.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            setRawInput(null);
            onChange(Number(e.target.value));
          }}
          aria-label={`${label} slider`}
          className="w-full h-1.5 accent-[#163B66] cursor-pointer"
        />
        <div className="flex items-center justify-between font-mono-tabular text-[10px] text-[#64748B]">
          <span>{formatCompactUsd(min)}</span>
          <span>{formatCompactUsd(max)}</span>
        </div>
      </div>

      {/* Quick-Select USD Volume Chips */}
      <div className="flex flex-wrap items-center gap-1">
        {QUICK_VOLUME_CHIPS.filter(
          (chip) => chip.value >= min && chip.value <= max
        ).map((chip) => {
          const isSelected = value === chip.value;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setRawInput(null);
                onChange(chip.value);
              }}
              className={`rounded-[5px] px-2 py-0.5 font-mono-tabular text-[10.5px] font-medium transition-colors cursor-pointer border whitespace-nowrap ${
                isSelected
                  ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                  : 'bg-[#FFFFFF] text-[#2E5A8A] border-[#E5E7EB] hover:border-[#6699CC] hover:text-[#163B66]'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface BusinessCaseRoiTabProps {
  config: BusinessCaseRoiConfig;
  user: AuthenticatedSession;
  bookDemoUrl: string;
  onSelectTab: (tab: TabId) => void;
}

export const BusinessCaseRoiTab: React.FC<BusinessCaseRoiTabProps> = ({
  config,
  user,
  bookDemoUrl,
  onSelectTab,
}) => {
  const [selectedDomain, setSelectedDomain] =
    useState<RoiDomainId>('procurement');
  const [scenario, setScenario] = useState<RealizationScenario>('conservative');

  // Domain-specific USD volumes (preserving each domain's exact default)
  const [procurementVolumeUsd, setProcurementVolumeUsd] =
    useState<number>(250_000_000);
  const [apWorkingCapitalVolumeUsd, setApWorkingCapitalVolumeUsd] =
    useState<number>(400_000_000);
  const [revenueO2cVolumeUsd, setRevenueO2cVolumeUsd] =
    useState<number>(500_000_000);
  const [closeAuditVolumeUsd, setCloseAuditVolumeUsd] =
    useState<number>(500_000_000);
  const [manualReviewHours, setManualReviewHours] = useState<number>(4_000);

  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const activeDomainDef =
    DOMAIN_DEFINITIONS.find((d) => d.id === selectedDomain) ??
    DOMAIN_DEFINITIONS[0];

  const isBenchmark = scenario === 'benchmark';

  const calculation = useMemo(() => {
    const procRate = isBenchmark ? 0.022 : 0.01; // 1.0% Conservative / 2.2% Benchmark
    const apPlRate = isBenchmark ? 0.0045 : 0.002; // 0.20% Conservative / 0.45% Benchmark
    const apWcCashRate = isBenchmark ? 0.035 : 0.02; // 2.0% Conservative / 3.5% Benchmark
    const revRate = isBenchmark ? 0.01 : 0.0045; // 0.45% Conservative / 1.0% Benchmark
    const closeRate = isBenchmark ? 0.0035 : 0.0015; // 0.15% Conservative / 0.35% Benchmark

    if (selectedDomain === 'procurement') {
      const totalEbitda = procurementVolumeUsd * procRate;
      const prePaymentBlocked = totalEbitda * 0.45;
      const priceMarginRecovery = totalEbitda - prePaymentBlocked;
      return {
        totalVolumeUsd: procurementVolumeUsd,
        totalEbitda,
        prePaymentBlocked,
        priceMarginRecovery,
        workingCapitalCashRelease: 0,
        hasWorkingCapitalComponent: false,
        hoursSaved: null as number | null,
        rateSummaryLabel: `${isBenchmark ? '2.2%' : '1.0%'} Net P&L Yield`,
        domainBreakdown: null as {
          procEbitda: number;
          apEbitda: number;
          revEbitda: number;
        } | null,
      };
    }

    if (selectedDomain === 'ap_wc') {
      const totalEbitda = apWorkingCapitalVolumeUsd * apPlRate;
      const workingCapitalCashRelease =
        apWorkingCapitalVolumeUsd * apWcCashRate;
      return {
        totalVolumeUsd: apWorkingCapitalVolumeUsd,
        totalEbitda,
        prePaymentBlocked: totalEbitda,
        priceMarginRecovery: 0,
        workingCapitalCashRelease,
        hasWorkingCapitalComponent: true,
        hoursSaved: null as number | null,
        rateSummaryLabel: `${
          isBenchmark ? '0.45%' : '0.20%'
        } P&L + ${isBenchmark ? '3.5%' : '2.0%'} Cash Release`,
        domainBreakdown: null,
      };
    }

    if (selectedDomain === 'revenue_o2c') {
      const totalEbitda = revenueO2cVolumeUsd * revRate;
      const prePaymentBlocked = totalEbitda * 0.25;
      const priceMarginRecovery = totalEbitda - prePaymentBlocked;
      return {
        totalVolumeUsd: revenueO2cVolumeUsd,
        totalEbitda,
        prePaymentBlocked,
        priceMarginRecovery,
        workingCapitalCashRelease: 0,
        hasWorkingCapitalComponent: false,
        hoursSaved: null as number | null,
        rateSummaryLabel: `${
          isBenchmark ? '1.0%' : '0.45%'
        } Gross-to-Net Margin Yield`,
        domainBreakdown: null,
      };
    }

    if (selectedDomain === 'close_audit_compliance') {
      const totalEbitda = closeAuditVolumeUsd * closeRate;
      const hoursSaved = Math.round(manualReviewHours * 0.75);
      return {
        totalVolumeUsd: closeAuditVolumeUsd,
        totalEbitda,
        prePaymentBlocked: totalEbitda,
        priceMarginRecovery: 0,
        workingCapitalCashRelease: 0,
        hasWorkingCapitalComponent: false,
        hoursSaved,
        rateSummaryLabel: `${
          isBenchmark ? '0.35%' : '0.15%'
        } Risk/Leakage Yield + 75% Hours Freed`,
        domainBreakdown: null,
      };
    }

    // Full Multi-Domain Enterprise Suite (Procurement + AP + Revenue simultaneously)
    const procEbitda = procurementVolumeUsd * procRate;
    const apEbitda = apWorkingCapitalVolumeUsd * apPlRate;
    const revEbitda = revenueO2cVolumeUsd * revRate;

    const totalEbitda = procEbitda + apEbitda + revEbitda;
    const prePaymentBlocked =
      apEbitda + procEbitda * 0.45 + revEbitda * 0.25;
    const priceMarginRecovery = totalEbitda - prePaymentBlocked;
    const workingCapitalCashRelease =
      apWorkingCapitalVolumeUsd * apWcCashRate;

    return {
      totalVolumeUsd:
        procurementVolumeUsd + apWorkingCapitalVolumeUsd + revenueO2cVolumeUsd,
      totalEbitda,
      prePaymentBlocked,
      priceMarginRecovery,
      workingCapitalCashRelease,
      hasWorkingCapitalComponent: true,
      hoursSaved: null as number | null,
      rateSummaryLabel: isBenchmark
        ? 'Multi-Domain Benchmark (Deduplicated)'
        : 'Multi-Domain CFO Base Case (Deduplicated)',
      domainBreakdown: {
        procEbitda,
        apEbitda,
        revEbitda,
      },
    };
  }, [
    selectedDomain,
    isBenchmark,
    procurementVolumeUsd,
    apWorkingCapitalVolumeUsd,
    revenueO2cVolumeUsd,
    closeAuditVolumeUsd,
    manualReviewHours,
  ]);

  const handleCopyBusinessCaseSummary = async () => {
    const scenarioLabel = isBenchmark
      ? 'Typical Delivered Benchmark'
      : 'Conservative (CFO Base Case)';

    const lines: string[] = [
      'FORTIFAI® — DEDUPLICATED USD BUSINESS CASE SUMMARY',
      `Domain Scope: ${activeDomainDef.title}`,
      `Realization Basis: ${scenarioLabel}`,
    ];

    if (selectedDomain === 'full_suite') {
      lines.push(
        `Modeled USD Volumes: Procurement ${formatCompactUsd(
          procurementVolumeUsd
        )} · AP & Working Capital ${formatCompactUsd(
          apWorkingCapitalVolumeUsd
        )} · Revenue & O2C ${formatCompactUsd(revenueO2cVolumeUsd)}`
      );
    } else {
      lines.push(
        `Annual Business Volume Processed (USD): ${formatCompactUsd(
          calculation.totalVolumeUsd
        )}`
      );
    }

    lines.push(
      `1. Estimated Annual Recurring EBITDA / P&L Impact: ${formatCompactUsd(
        calculation.totalEbitda
      )} / yr`,
      `   - Pre-Payment Leakage Blocked: ${formatCompactUsd(
        calculation.prePaymentBlocked
      )}`,
      `   - Price & Margin Recovery: ${formatCompactUsd(
        calculation.priceMarginRecovery
      )}`,
      `2. One-Time Working Capital Cash Release (Tracked Separately from P&L EBITDA): ${formatCompactUsd(
        calculation.workingCapitalCashRelease
      )}`,
      `3. Team Capacity Freed: 70–80% less manual review effort · 50%+ faster resolution per finding${
        calculation.hoursSaved !== null
          ? ` (${calculation.hoursSaved.toLocaleString('en-US')} hrs/yr saved across ${manualReviewHours.toLocaleString('en-US')} manual review hrs)`
          : ''
      }`,
      'Methodology: Deterministic 4-Rung Economic Precedence Waterfall (zero double-counting across overlapping rules; Working Capital DPO cash release held 100% separate from recurring P&L EBITDA).'
    );

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2400);
    } catch {
      // Ignore clipboard sandbox restrictions
    }

    const logDetail = `04 · Business Case & ROI (${activeDomainDef.title} · ${formatCompactUsd(
      calculation.totalVolumeUsd
    )} · ${isBenchmark ? 'Benchmark' : 'Conservative'} → ${formatCompactUsd(
      calculation.totalEbitda
    )} P&L)`;
    void logPortalEvent(user, 'ROI_SIMULATION', logDetail);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-4 pb-10 space-y-4">
      {/* Editorial Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="max-w-[760px] space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-[5px] px-2 py-0.5 fortifai-pill">
            <Calculator className="w-3 h-3 text-[#2E5A8A] shrink-0" />
            <span>{config.pillLabel}</span>
          </span>
          <h1 className="text-[21px] sm:text-[22px] font-medium leading-[1.2] tracking-[-0.02em] text-[#163B66] text-balance">
            {config.headline}
          </h1>
          <p className="text-[13px] leading-[1.52] text-[#4B5B6E]">
            {config.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('faq')}
            className="rounded-[7px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-medium text-[#163B66] whitespace-nowrap transition-colors cursor-pointer"
          >
            05 · Executive FAQ
          </button>
          <a
            href={bookDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors"
          >
            <span>Book Value Assessment</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Top Live-Deployment Evidence Strip (4 #FFFFFF Cards) */}
      <section
        aria-label="Live Deployment Evidence"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {config.evidenceCards.map((card, idx) => (
          <article
            key={`${card.metric}-${idx}`}
            className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-3.5 sm:p-4 fortifai-card-shadow flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-tabular text-[22px] font-medium leading-none tracking-[-0.03em] text-[#163B66]">
                {card.metric}
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-[#6699CC] shrink-0" />
            </div>
            <p className="text-[12px] leading-[1.42] text-[#4B5B6E]">
              {card.label}
            </p>
          </article>
        ))}
      </section>

      {/* Interactive USD Volume-to-Savings Simulator (2-Column Split Card) */}
      <section
        aria-label="Interactive USD Volume-to-Savings Simulator"
        className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-4 sm:p-5 fortifai-card-shadow"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.04fr_0.96fr] gap-5 items-start">
          {/* LEFT COLUMN: Inputs (Strictly USD $) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
              <div>
                <h2 className="text-[15.5px] font-medium leading-[1.3] text-[#163B66]">
                  1. Configure Scope &amp; Annual Volume (USD $)
                </h2>
                <p className="text-[12px] text-[#64748B]">
                  Select an agent domain or model the full multi-domain suite in
                  USD ($).
                </p>
              </div>
              <span className="rounded-[5px] px-2 py-0.5 fortifai-pill whitespace-nowrap">
                USD ($) ONLY
              </span>
            </div>

            {/* Agent Domain Selector */}
            <div className="space-y-1.5" role="radiogroup" aria-label="Agent Domain Selector">
              <span className="block text-[11.5px] font-medium text-[#163B66]">
                Agent Domain Scope
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {DOMAIN_DEFINITIONS.map((dom, index) => {
                  const isActive = selectedDomain === dom.id;
                  return (
                    <button
                      key={dom.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setSelectedDomain(dom.id)}
                      className={`w-full rounded-[8px] border px-3 py-2 text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#F4F8FC] border-[#2E5A8A] ring-1 ring-[#2E5A8A]/20'
                          : 'bg-[#FFFFFF] border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12.5px] font-medium text-[#163B66]">
                          {dom.title}
                        </span>
                        <span
                          className={`rounded-[4px] px-1.5 py-0.5 font-mono-tabular text-[10px] font-medium shrink-0 ${
                            isActive
                              ? 'bg-[#163B66] text-[#FFFFFF]'
                              : 'bg-[#E8F0F8] text-[#2E5A8A]'
                          }`}
                        >
                          0{index + 1}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-[1.4] text-[#64748B]">
                        {dom.agentsLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Volume Inputs Based on Selected Domain */}
            {selectedDomain === 'procurement' && (
              <UsdVolumeControl
                id="vol-procurement"
                label="Annual Business Volume Processed by Agent(s) (USD)"
                sublabel="Addressable third-party supplier & PO/invoice spend"
                value={procurementVolumeUsd}
                min={25_000_000}
                max={5_000_000_000}
                step={25_000_000}
                onChange={setProcurementVolumeUsd}
              />
            )}

            {selectedDomain === 'ap_wc' && (
              <UsdVolumeControl
                id="vol-ap-wc"
                label="Annual Business Volume Processed by Agent(s) (USD)"
                sublabel="Annual Accounts Payable disbursement volume"
                value={apWorkingCapitalVolumeUsd}
                min={50_000_000}
                max={10_000_000_000}
                step={50_000_000}
                onChange={setApWorkingCapitalVolumeUsd}
              />
            )}

            {selectedDomain === 'revenue_o2c' && (
              <UsdVolumeControl
                id="vol-revenue-o2c"
                label="Annual Business Volume Processed by Agent(s) (USD)"
                sublabel="Annual billed revenue & order-to-cash volume"
                value={revenueO2cVolumeUsd}
                min={50_000_000}
                max={10_000_000_000}
                step={50_000_000}
                onChange={setRevenueO2cVolumeUsd}
              />
            )}

            {selectedDomain === 'close_audit_compliance' && (
              <div className="space-y-2.5">
                <UsdVolumeControl
                  id="vol-close-audit"
                  label="Annual Business Volume Processed by Agent(s) (USD)"
                  sublabel="Monitored ledger, T&E, vendor & close population"
                  value={closeAuditVolumeUsd}
                  min={50_000_000}
                  max={10_000_000_000}
                  step={50_000_000}
                  onChange={setCloseAuditVolumeUsd}
                />

                {/* Manual Audit / Review Hours Slider */}
                <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="audit-hours-input"
                      className="text-[12px] font-medium text-[#163B66]"
                    >
                      Annual Manual Audit / Review Hours
                    </label>
                    <span className="font-mono-tabular text-[11px] font-medium text-[#2E5A8A]">
                      {manualReviewHours.toLocaleString('en-US')} hrs / yr
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      id="audit-hours-input"
                      type="number"
                      min={500}
                      max={25000}
                      step={250}
                      value={manualReviewHours}
                      onChange={(e) =>
                        setManualReviewHours(
                          clampNumber(Number(e.target.value), 500, 25_000)
                        )
                      }
                      className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 pr-12 font-mono-tabular text-[12.5px] font-medium text-[#0D1520] focus:outline-none focus:border-[#2E5A8A]"
                    />
                    <span className="absolute right-2.5 font-mono-tabular text-[10px] font-medium text-[#64748B] pointer-events-none">
                      HRS
                    </span>
                  </div>

                  <input
                    type="range"
                    min={500}
                    max={25000}
                    step={250}
                    value={manualReviewHours}
                    onChange={(e) =>
                      setManualReviewHours(Number(e.target.value))
                    }
                    aria-label="Annual Manual Audit / Review Hours slider"
                    className="w-full h-1.5 accent-[#163B66] cursor-pointer"
                  />

                  <div className="flex flex-wrap items-center gap-1">
                    {QUICK_AUDIT_HOURS_CHIPS.map((chip) => {
                      const active = manualReviewHours === chip.value;
                      return (
                        <button
                          key={chip.value}
                          type="button"
                          onClick={() => setManualReviewHours(chip.value)}
                          className={`rounded-[5px] px-2 py-0.5 font-mono-tabular text-[10.5px] font-medium border cursor-pointer transition-colors ${
                            active
                              ? 'bg-[#163B66] text-[#FFFFFF] border-[#163B66]'
                              : 'bg-[#FFFFFF] text-[#2E5A8A] border-[#E5E7EB] hover:border-[#6699CC]'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedDomain === 'full_suite' && (
              <div className="space-y-2.5">
                <UsdVolumeControl
                  id="vol-suite-procurement"
                  label="Procurement & Supply Chain Volume (USD)"
                  sublabel="1.0% Conservative / 2.2% Benchmark net P&L savings"
                  value={procurementVolumeUsd}
                  min={25_000_000}
                  max={5_000_000_000}
                  step={25_000_000}
                  onChange={setProcurementVolumeUsd}
                />

                <UsdVolumeControl
                  id="vol-suite-ap"
                  label="Accounts Payable & Working Capital Volume (USD)"
                  sublabel="0.20% / 0.45% P&L overpayment + 2.0% / 3.5% cash release"
                  value={apWorkingCapitalVolumeUsd}
                  min={50_000_000}
                  max={10_000_000_000}
                  step={50_000_000}
                  onChange={setApWorkingCapitalVolumeUsd}
                />

                <UsdVolumeControl
                  id="vol-suite-revenue"
                  label="Revenue & Order-to-Cash Volume (USD)"
                  sublabel="0.45% Conservative / 1.0% Benchmark margin protection"
                  value={revenueO2cVolumeUsd}
                  min={50_000_000}
                  max={10_000_000_000}
                  step={50_000_000}
                  onChange={setRevenueO2cVolumeUsd}
                />
              </div>
            )}

            {/* Realization Basis Toggle */}
            <div className="space-y-1">
              <span className="block text-[11.5px] font-medium text-[#163B66]">
                Realization Basis
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 rounded-[8px] bg-[#F8FAFC] border border-[#E5E7EB] p-1">
                <button
                  type="button"
                  onClick={() => setScenario('conservative')}
                  className={`rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    scenario === 'conservative'
                      ? 'bg-[#163B66] text-[#FFFFFF]'
                      : 'text-[#4B5B6E] hover:text-[#163B66]'
                  }`}
                >
                  Conservative (CFO Base Case)
                </button>
                <button
                  type="button"
                  onClick={() => setScenario('benchmark')}
                  className={`rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    scenario === 'benchmark'
                      ? 'bg-[#163B66] text-[#FFFFFF]'
                      : 'text-[#4B5B6E] hover:text-[#163B66]'
                  }`}
                >
                  Typical Delivered Benchmark
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Deduplicated USD Output — Separating P&L from Cash Flow */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
              <div>
                <h2 className="text-[15.5px] font-medium leading-[1.3] text-[#163B66]">
                  2. Deduplicated USD Value Projection
                </h2>
                <p className="text-[12px] text-[#64748B]">
                  Strictly separates recurring P&amp;L EBITDA from Working
                  Capital cash release.
                </p>
              </div>
              <span className="font-mono-tabular text-[10.5px] font-medium text-[#2E5A8A] whitespace-nowrap">
                {calculation.rateSummaryLabel}
              </span>
            </div>

            {/* OUTPUT CARD 1: Primary #163B66 Recurring EBITDA / P&L Highlight Card */}
            <div className="rounded-[12px] bg-[#163B66] text-[#FFFFFF] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono-tabular text-[10px] font-medium tracking-[0.04em] text-[#DCE8F5] uppercase">
                  ESTIMATED ANNUAL RECURRING EBITDA / P&amp;L IMPACT ($ USD)
                </span>
                <span className="rounded-[5px] bg-[#FFFFFF]/12 border border-[#6699CC]/40 px-2 py-0.5 font-mono-tabular text-[10px] font-medium text-[#E8F0F8]">
                  {isBenchmark ? 'BENCHMARK CASE' : 'CFO BASE CASE'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono-tabular text-[32px] sm:text-[34px] font-medium leading-none tracking-[-0.03em] text-[#FFFFFF]">
                  {formatCompactUsd(calculation.totalEbitda)}
                </span>
                <span className="font-mono-tabular text-[12px] text-[#CBD5E1]">
                  / year (USD)
                </span>
              </div>

              {/* Breakout: Pre-Payment Leakage Blocked vs. Price & Margin Recovery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <div className="rounded-[8px] bg-[#FFFFFF]/10 border border-[#6699CC]/30 px-3 py-2">
                  <span className="block font-mono-tabular text-[9.5px] text-[#CBD5E1] uppercase">
                    Pre-Payment Leakage Blocked
                  </span>
                  <span className="mt-0.5 block font-mono-tabular text-[15.5px] font-medium text-[#FFFFFF]">
                    {formatCompactUsd(calculation.prePaymentBlocked)}
                  </span>
                </div>

                <div className="rounded-[8px] bg-[#FFFFFF]/10 border border-[#6699CC]/30 px-3 py-2">
                  <span className="block font-mono-tabular text-[9.5px] text-[#CBD5E1] uppercase">
                    Price &amp; Margin Recovery
                  </span>
                  <span className="mt-0.5 block font-mono-tabular text-[15.5px] font-medium text-[#FFFFFF]">
                    {formatCompactUsd(calculation.priceMarginRecovery)}
                  </span>
                </div>
              </div>

              {calculation.domainBreakdown && (
                <div className="pt-1.5 border-t border-[#FFFFFF]/15 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono-tabular text-[10.5px] text-[#DCE8F5]">
                  <span>
                    Procurement:{' '}
                    {formatCompactUsd(calculation.domainBreakdown.procEbitda)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    AP Overpayment:{' '}
                    {formatCompactUsd(calculation.domainBreakdown.apEbitda)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Revenue O2C:{' '}
                    {formatCompactUsd(calculation.domainBreakdown.revEbitda)}
                  </span>
                </div>
              )}
            </div>

            {/* OUTPUT CARD 2: One-Time Working Capital Cash Release ($ USD) */}
            <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] p-3.5 sm:p-4 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[13.5px] font-medium text-[#163B66]">
                  One-Time Working Capital Cash Release ($ USD)
                </h3>
                <span className="rounded-[5px] px-2 py-0.5 fortifai-pill whitespace-nowrap">
                  Tracked Separately from P&amp;L EBITDA
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono-tabular text-[22px] font-medium leading-none tracking-[-0.03em] text-[#163B66]">
                  {formatCompactUsd(calculation.workingCapitalCashRelease)}
                </span>
                {calculation.hasWorkingCapitalComponent && (
                  <span className="font-mono-tabular text-[11px] text-[#2E5A8A]">
                    ({isBenchmark ? '3.5%' : '2.0%'} of AP volume)
                  </span>
                )}
              </div>

              <p className="text-[12px] leading-[1.48] text-[#4B5B6E]">
                {calculation.hasWorkingCapitalComponent
                  ? 'Balance-sheet cash unlocked via early-payment prevention, payment-term standardization, and DPO alignment—never blended into recurring EBITDA.'
                  : 'Select Accounts Payable & Working Capital or Full Multi-Domain Enterprise Suite to model balance-sheet DPO cash release (2.0%–3.5%).'}
              </p>
            </div>

            {/* OUTPUT CARD 3: Team Capacity Freed */}
            <div className="rounded-[12px] bg-[#FFFFFF] border border-[#E5E7EB] p-3.5 sm:p-4 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[13.5px] font-medium text-[#163B66]">
                  Team Capacity Freed
                </h3>
                <Layers className="w-3.5 h-3.5 text-[#2E5A8A] shrink-0" />
              </div>

              {calculation.hoursSaved !== null ? (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono-tabular text-[20px] font-medium leading-none tracking-[-0.02em] text-[#163B66]">
                    {calculation.hoursSaved.toLocaleString('en-US')} hrs / yr
                  </span>
                  <span className="font-mono-tabular text-[11px] text-[#2E5A8A]">
                    saved (75% of {manualReviewHours.toLocaleString('en-US')}{' '}
                    manual review hrs)
                  </span>
                </div>
              ) : (
                <div className="font-mono-tabular text-[19px] font-medium leading-none tracking-[-0.02em] text-[#163B66]">
                  70–80% Effort Reduction
                </div>
              )}

              <p className="text-[12px] font-medium text-[#2E5A8A]">
                70–80% less manual review effort · 50%+ faster resolution per
                finding
              </p>
            </div>

            {/* Zero Double-Counting Method Note (4-Rung Economic Precedence Waterfall) */}
            <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E5A8A] shrink-0" />
                <span className="font-mono-tabular text-[10px] font-medium tracking-[0.04em] text-[#163B66] uppercase">
                  ZERO DOUBLE-COUNTING · 4-RUNG ECONOMIC PRECEDENCE WATERFALL
                </span>
              </div>
              <p className="text-[12px] leading-[1.5] text-[#4B5B6E]">
                Every exception is deduplicated at the invoice line-item level
                in strict economic order:{' '}
                <span className="font-medium text-[#163B66]">
                  Rung 1 Billing &amp; Quantity Errors → Rung 2 Contract &amp;
                  Pass-Through Markup → Rung 3 Commodity Index Lag → Rung 4 Tail
                  Consolidation
                </span>
                , with Working Capital DPO cash release held 100% separate from
                recurring P&amp;L EBITDA.
              </p>
            </div>

            {/* Copy USD Business Case Summary Action */}
            <div className="pt-0.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCopyBusinessCaseSummary()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3.5 py-2 text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied USD Business Case Summary</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy USD Business Case Summary</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('faq')}
                className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#F8FAFC] hover:bg-[#E8F0F8] border border-[#E5E7EB] px-3.5 py-2 text-[12.5px] font-medium text-[#163B66] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>05 · Executive FAQ</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2E5A8A]" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
