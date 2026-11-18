import {
  PERSISTED_CMS_DATA,
  PERSISTED_CMS_UPDATED_AT,
} from './cmsPersisted';

export type TabId =
  | 'walkthrough'
  | 'architecture'
  | 'agents'
  | 'roi'
  | 'faq'
  | 'logins';

export type FaqCategory =
  | 'Reliability & SME Pedigree'
  | 'Customization & Data'
  | 'Engagement & Support'
  | 'Architecture & Security'
  | 'Governance & Audit'
  | 'Rollout & Commercials';

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  'Reliability & SME Pedigree',
  'Customization & Data',
  'Engagement & Support',
  'Architecture & Security',
  'Governance & Audit',
  'Rollout & Commercials',
];

export interface AuthenticatedSession {
  name: string;
  email: string;
  organization: string;
  accessCode: string;
  timestamp: string;
  formattedTimestamp: string;
  hideHeaderIdentity?: boolean;
}

export interface DataRoomTab {
  id: TabId;
  code: string;
  label: string;
  shortSubtitle: string;
  utilityEyebrow?: string;
  utilityTitle?: string;
  utilitySubtitle?: string;
  embedSrc?: string;
}

export interface WalkthroughMetricCard {
  metric: string;
  label: string;
  sublabel?: string;
}

export interface WalkthroughStageChapter {
  code: string;
  title: string;
  detail: string;
  timestampSec: number;
}

export interface NdaClause {
  heading: string;
  body: string;
}

export interface ArchitectureDomainPill {
  id: string;
  name: string;
  detail: string;
  signals: string;
}

export interface ArchitectureStudioConfig {
  pillLabel: string;
  headline: string;
  subcopy: string;
  layer4Badge: string;
  layer4Title: string;
  layer4Summary: string;
  layer4Highlights: string[];
  layer3Badge: string;
  layer3Title: string;
  layer3Summary: string;
  layer3Domains: ArchitectureDomainPill[];
  layer2Badge: string;
  layer2Title: string;
  layer2Summary: string;
  layer2Capabilities: string[];
  layer1Badge: string;
  layer1Title: string;
  layer1Summary: string;
  layer1Assurances: string[];
}

export interface RoiEvidenceCard {
  metric: string;
  label: string;
}

export interface BusinessCaseRoiConfig {
  pillLabel: string;
  headline: string;
  subtitle: string;
  evidenceCards: RoiEvidenceCard[];
}

export interface ExecutiveFaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export interface ExecutiveFaqConfig {
  pillLabel: string;
  headline: string;
  subtitle: string;
  items: ExecutiveFaqItem[];
}

export interface BriefingCmsConfig {
  gate: {
    badgeLabel: string;
    eyebrow: string;
    headline: string;
    subcopy: string;
    ndaHeaderLabel: string;
    checkboxLabel: string;
    submitButtonLabel: string;
    footerAttribution: string;
    enforceCorporateEmail: boolean;
    validAccessCodes: string[];
    blockedEmailDomains: string[];
    ndaClauses: NdaClause[];
  };
  header: {
    portalPillLabel: string;
    bookDemoLabel: string;
    bookDemoUrl: string;
    signOutLabel: string;
  };
  walkthrough: {
    headline: string;
    subtitle: string;
    durationBadge: string;
    coverHeadline: string;
    coverPlayLabel: string;
    trupeerEmbedUrl: string;
    maskCornerStamp: boolean;
    openExternalLabel: string;
    chapters: WalkthroughStageChapter[];
    metrics: WalkthroughMetricCard[];
    nextStepPrompt: string;
  };
  architecture: ArchitectureStudioConfig;
  roi: BusinessCaseRoiConfig;
  faq: ExecutiveFaqConfig;
  tabs: DataRoomTab[];
  security: {
    enableWatermark: boolean;
    watermarkSuffix: string;
    disableRightClick: boolean;
  };
}

export interface InitialCmsLoadResult {
  config: BriefingCmsConfig;
  revision: number;
  hasCustomEdits: boolean;
  needsInitialDiskSync: boolean;
  savedAtLabel: string | null;
}

export const SESSION_STORAGE_KEY = 'fortifai_overview_session_v4';
export const CMS_STORAGE_KEY = 'fortifai_overview_cms_v9';
const PREVIOUS_V8_CMS_STORAGE_KEY = 'fortifai_overview_cms_v8';

const LEGACY_CMS_STORAGE_KEYS: readonly string[] = [
  'fortifai_overview_cms_v7',
  'fortifai_overview_cms_v6',
  'fortifai_overview_cms_v5',
  'fortifai_overview_cms_v4_supabase',
  'fortifai_overview_cms_v4',
  'fortifai_overview_cms_v3',
  'fortifai_overview_cms_v2',
  'fortifai_overview_cms_v1',
  'fortifai_overview_cms',
  'fortifai_cms_config',
];

/**
 * Returns true ONLY inside Google AI Studio preview environments.
 * When the ZIP is downloaded and pushed to Git (Vercel, Netlify, Cloudflare, overview.fortifai.io, or localhost),
 * both __AISTUDIO_CMS_ENABLED__ and the hostname check evaluate to false, completely disabling Live CMS.
 */
export function isLiveCmsEnabled(): boolean {
  if (
    typeof __AISTUDIO_CMS_ENABLED__ !== 'boolean' ||
    !__AISTUDIO_CMS_ENABLED__
  ) {
    return false;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname.toLowerCase();
  return (
    host.startsWith('ais-dev-') ||
    host.startsWith('ais-pre-') ||
    host.endsWith('.usercontent.goog') ||
    host.includes('aistudio.google.com')
  );
}

export const BOOK_LIVE_DEMO_URL =
  'https://bookings.cloud.microsoft/bookwithme/user/9d42e199ba2849b09460c0f0b246122e@fortifai.io/meetingtype/csvZYBwRkkuw11HGTwN8rg2?anonymous&ismsaljsauthenabled';

export const TRUPEER_EMBED_URL = 'https://app.trupeer.ai/embed/ODyVNQIWB';

export const VALID_ACCESS_CODES: readonly string[] = [
  'FORTIFAI2026',
  'PARTNER2026',
  'KPMG2026',
  'DELOITTE2026',
  'EY2026',
  'PWC2026',
  'COCKPIT2026',
  'NDA2026',
];

export const BLOCKED_FREE_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.co.in',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'gmx.net',
  'fastmail.com',
  'hey.com',
];

export const DATA_ROOM_TABS: readonly DataRoomTab[] = [
  {
    id: 'walkthrough',
    code: '01',
    label: '01 · Platform Walkthrough',
    shortSubtitle: 'Interactive Video Briefing',
  },
  {
    id: 'architecture',
    code: '02',
    label: '02 · Architecture & Security',
    shortSubtitle: '3D SARA Stack & Zero-Egress Security',
  },
  {
    id: 'agents',
    code: '03',
    label: '03 · Agent Suite',
    shortSubtitle: 'Specialized Agent Catalogue',
    utilityEyebrow: 'FORTIFAI SARA · SPECIALIZED AGENT CATALOGUE',
    utilityTitle: 'Active Domain Agent Suite',
    utilitySubtitle:
      'Specialized domain agents executing natively inside your private cloud on Fortifai SARA—combining deterministic verification, Fortifai D7 external corroboration, and plain-English audit dossiers.',
    embedSrc: '',
  },
  {
    id: 'roi',
    code: '04',
    label: '04 · Business Case & ROI',
    shortSubtitle: 'USD Volume-to-Savings Simulator',
  },
  {
    id: 'faq',
    code: '05',
    label: '05 · Executive FAQ',
    shortSubtitle: 'Security, Financial Math & Audit FAQ',
  },
];

export const INTERNAL_LOGINS_TAB: DataRoomTab = {
  id: 'logins',
  code: '06',
  label: '06 · User Logins',
  shortSubtitle: 'Internal Partner Access Audit',
};

export const WALKTHROUGH_STAGE_CHAPTERS: readonly WalkthroughStageChapter[] = [
  {
    code: '01',
    title: 'Zero-Egress VPC Connect',
    detail:
      'Read-only connector across ERP ledgers, contracts, and vendor masters.',
    timestampSec: 0,
  },
  {
    code: '02',
    title: '100% Population Scan',
    detail:
      'Continuous inspection of every transaction—replacing <5% post-close samples.',
    timestampSec: 42,
  },
  {
    code: '03',
    title: 'Deterministic Math + D7',
    detail:
      'Exact financial calculations corroborated across independent external signals.',
    timestampSec: 95,
  },
  {
    code: '04',
    title: 'Audit Action Dossiers',
    detail:
      'Plain-English case narratives and pre-staged holds ready for sign-off.',
    timestampSec: 145,
  },
];

export const WALKTHROUGH_METRICS: readonly WalkthroughMetricCard[] = [
  {
    metric: '100%',
    label: 'Population Monitored',
    sublabel: 'Continuous pre-payment coverage',
  },
  {
    metric: '0%',
    label: 'Data Egress (Customer VPC)',
    sublabel: '100% sovereign cloud deployment',
  },
  {
    metric: '0%',
    label: 'LLM Hallucination',
    sublabel: 'Isolated deterministic math engine',
  },
];

export const NDA_TERMS_COPY: readonly NdaClause[] = [
  {
    heading: '1. Confidential Proprietary Information.',
    body: 'All briefings, multi-agent orchestration architectures, deterministic verification methodologies, product demonstrations, pricing frameworks, and technical specifications presented within overview.fortifai.io constitute strictly confidential and proprietary trade secrets of Fortifai Inc. ("Fortifai").',
  },
  {
    heading: '2. Permitted Evaluation Scope.',
    body: 'Access is granted solely to authorized corporate executives, enterprise security reviewers, and accredited advisory partners evaluating a prospective commercial or strategic partnership with Fortifai.',
  },
  {
    heading: '3. Non-Disclosure & Non-Reproduction.',
    body: 'Recipient agrees not to copy, screen-record, print, redistribute, reverse-engineer, or disclose any portion of these materials to unauthorized third parties or competing entities without prior written authorization from Fortifai.',
  },
  {
    heading: '4. Forensic Session Watermarking & Audit Logging.',
    body: 'By proceeding, you acknowledge that this data room session is dynamically watermarked with your corporate identity, organization, and UTC access timestamp for security compliance and audit governance.',
  },
];

export const DEFAULT_ARCHITECTURE_CONFIG: ArchitectureStudioConfig = {
  pillLabel: 'Fortifai SARA · Architecture & Sovereign Security',
  headline: 'Four sovereign layers—engineered for deterministic truth.',
  subcopy:
    'Select or hover any plate in the 3D stack to inspect how data moves inside your Customer Private Cloud VPC or On-Premises environment with zero external egress.',
  layer4Badge: '04 · Executive Cockpit & QuantumQuery',
  layer4Title: 'Layer 04 — Executive Cockpit & QuantumQuery',
  layer4Summary:
    'Consolidated boardroom risk & value waterfall, dollar-ranked action queue, and plain-English QuantumQuery copilot (SELECT-only validated queries, zero LLM math).',
  layer4Highlights: [
    'Boardroom Risk & Verified Value Waterfall',
    'Dollar-Ranked Pre-Payment Action Queue',
    'QuantumQuery Copilot (SELECT-Only · 0% LLM Math)',
  ],
  layer3Badge: '03 · Specialized Domain Agents',
  layer3Title: 'Layer 03 — Specialized Domain Agents',
  layer3Summary:
    'Five domain agent suites execute natively on the shared SARA spine—eliminating duplicate ERP integrations and siloed point tools.',
  layer3Domains: [
    {
      id: 'procurement',
      name: 'Procurement & Supply Chain',
      detail:
        'Correlates POs, contracts, commodity indices, and supplier registries on the shared spine to stop overcharging pre-payment.',
      signals: 'Contracts · Market Indices · Vendor Graph',
    },
    {
      id: 'revenue',
      name: 'Revenue',
      detail:
        'Cross-checks signed commercial terms, shipments, and billing schedules to stop margin dilution and unbilled fulfillment.',
      signals: 'Order Terms · Fulfillment · Billing Spine',
    },
    {
      id: 'finance',
      name: 'Finance',
      detail:
        'Continuously reconciles payables, treasury disbursements, and working-capital terms before cash leaves the bank.',
      signals: 'Payables · Bank Master · Treasury Controls',
    },
    {
      id: 'compliance',
      name: 'Compliance',
      detail:
        'Screens beneficial ownership, sanctions lists, and employee spend policies across 100% of third-party relationships.',
      signals: 'Corporate Registries · Sanctions · Policy Rules',
    },
    {
      id: 'audit',
      name: 'Internal Audit',
      detail:
        'Automates full-population control verification, segregation-of-duties checks, and regulator-ready audit case workpapers.',
      signals: 'Access Logs · Control Matrix · Evidence Trail',
    },
  ],
  layer2Badge: '02 · Fortifai SARA Core Intelligence',
  layer2Title: 'Layer 02 — Fortifai SARA Core Intelligence',
  layer2Summary:
    'Six shared intelligence engines convert raw multi-system records into corroborated, deterministic financial proof — powered by Fortifai SARA and Fortifai D7.',
  layer2Capabilities: [
    'Risk Rule Builder',
    '3-Arm Detection Engine',
    'False-Positive & Exclusion Memory',
    'Audit Explanation Engine',
    'QuantumQuery Copilot',
    'Executive Reporting',
  ],
  layer1Badge: '01 · Zero-Egress Customer VPC',
  layer1Title: 'Layer 01 — Single Source of Truth & Zero-Egress VPC',
  layer1Summary:
    '100% read-only deployment inside the Customer Private Cloud VPC (AWS, Azure, GCP) or On-Premises across SAP, Oracle, NetSuite, and non-ERP sources — zero external data egress and 0% LLM training on customer data.',
  layer1Assurances: [
    'AWS · Azure · GCP · On-Premises',
    'SAP · Oracle · NetSuite · Non-ERP',
    '100% Read-Only Scoped Access',
    '0% Data Egress · 0% Customer LLM Training',
  ],
};

export const DEFAULT_ROI_CONFIG: BusinessCaseRoiConfig = {
  pillLabel: 'CFO Business Case · USD ($) Deterministic Value Model',
  headline: 'Verified Enterprise Impact & USD ROI Simulator',
  subtitle:
    'Model deduplicated annual P&L savings separately from one-time Working Capital cash release across your enterprise transaction volume in USD ($).',
  evidenceCards: [
    {
      metric: '$24.4M',
      label: 'Verified exposure surfaced in weeks at a $1.5B enterprise',
    },
    {
      metric: '$146M',
      label: 'Total exposure identified across 11,117 findings',
    },
    {
      metric: '70–80%',
      label: 'Reduction in manual audit, triage & review effort',
    },
    {
      metric: '10x+',
      label: 'Indicative ROI on annual platform subscription',
    },
  ],
};

export const DEFAULT_FAQ_ITEMS: readonly ExecutiveFaqItem[] = [
  // Category: Reliability & SME Pedigree (01–03)
  {
    id: 'faq-01-sme-pedigree',
    category: 'Reliability & SME Pedigree',
    question:
      'Who designed the underlying risk methodology, algorithms, and workflows?',
    answer:
      'Every detection model, corroboration rule, and investigation workflow is designed by seasoned subject-matter experts—including former Big-4 forensic accounting partners, CPAs, former US Department of Justice (DOJ) fraud prosecutors, and enterprise AI architects. Rather than generic data-science anomaly detection, Fortifai encodes decades of real-world investigative and audit judgment directly into autonomous software.',
  },
  {
    id: 'faq-02-deterministic-math-waterfall',
    category: 'Reliability & SME Pedigree',
    question:
      'How do you guarantee AI never hallucinates financial figures or double-counts savings?',
    answer:
      'Large language models never calculate financial exposure. Every dollar figure is computed deterministically via AST-validated SQL at the individual document-line grain, cross-checked by autonomous QC validation, and passed through our **4-Rung Economic Precedence Waterfall**—clipping billing errors, contract/middleman markups, commodity lag, and consolidation sequentially while keeping one-time Working Capital release strictly separate from recurring P&L / EBITDA impact.',
  },
  {
    id: 'faq-03-false-positive-exclusion-memory',
    category: 'Reliability & SME Pedigree',
    question:
      'How do you eliminate false-positive alert fatigue without creating audit blind spots?',
    answer:
      'Every alert requires multi-signal 3-Arm corroboration (deterministic rules, behavioral baselines, and external Fortifai D7 counterparty intelligence) before surfacing. Verified business exceptions and intercompany patterns are captured in a self-learning **Exclusion Memory** that suppresses repeat noise while permanently recording the reviewer, timestamp, and rationale—cutting manual review effort by 70–80%.',
  },

  // Category: Customization & Data (04–06)
  {
    id: 'faq-04-industry-erp-customization',
    category: 'Customization & Data',
    question:
      'How customizable are the agents to our industry, materiality thresholds, and custom ERP tables?',
    answer:
      'Highly customizable. Materiality floors, tolerance bands, approval hierarchies, vendor/entity allowlists, regional tax logic, and custom ERP extensions (including custom SAP Z-tables and industry-specific schemas) are tailored per company code and business unit during configuration without altering core software stability.',
  },
  {
    id: 'faq-05-risk-rule-builder',
    category: 'Customization & Data',
    question:
      'Can we build new company-specific risk rules without waiting on vendor product releases?',
    answer:
      "Yes. The platform includes an AI-assisted **Risk Rule Builder** that translates your organization's unique commercial policies, contract clauses, or newly discovered fraud typologies into governed, deterministic production monitors in days.",
  },
  {
    id: 'faq-06-multi-erp-unstructured-pdfs',
    category: 'Customization & Data',
    question:
      'What if we run multiple ERPs, have messy master data, or keep contracts in unstructured PDFs?',
    answer:
      'Fortifai SARA is ERP-agnostic—unifying SAP S/4HANA, SAP ECC, Oracle Cloud/EBS, NetSuite, Microsoft Dynamics 365, and cloud data warehouses alongside unstructured PDF contracts, rate cards, and supplier invoices. Built-in entity resolution and an automated **ERP Data Audit** step flag master-data hygiene gaps on day one, even mid-migration to S/4HANA.',
  },

  // Category: Engagement & Support (07–09)
  {
    id: 'faq-07-engagement-operating-models',
    category: 'Engagement & Support',
    question:
      'What engagement and operating models do you offer (Product, Managed Service, or BOOT)?',
    answer:
      'Enterprises choose from three flexible operating structures:\n- **Pure-Play Product License:** Your internal Finance, Audit, Procurement, or Compliance teams operate the platform in-house; Fortifai deploys, configures, trains, and provides continuous technical support.\n- **Co-Sourced or Fully Managed Service:** Fortifai’s forensic SMEs operate continuous detection, calibration, and first-pass triage (or end-to-end monitoring and reporting against agreed SLAs), while your leadership retains final sign-off.\n- **BOOT (Build-Operate-Own-Transfer):** Fortifai stands up the agents inside your VPC, operates and proves quantified outcomes on live data, trains your internal staff, and transfers full operational ownership to your team on a defined schedule.',
  },
  {
    id: 'faq-08-post-deployment-support',
    category: 'Engagement & Support',
    question:
      'What continuous technical and SME support is available post-deployment?',
    answer:
      'Every subscription includes continuous platform maintenance, ERP schema adapter updates, ongoing noise calibration, and access to newly released risk models at no extra license cost. Clients can also attach dedicated forensic SME retainers for continuous backlog triage, threshold tuning, and quarterly Audit Committee / Board pack preparation.',
  },
  {
    id: 'faq-09-big4-advisory-comparison',
    category: 'Engagement & Support',
    question:
      'How does Fortifai differ from hiring a Big-4 or advisory firm for a review?',
    answer:
      'Traditional consulting engagements bill analyst hours to test a 2–5% post-facto sample and leave behind a static slide deck—taking institutional context out the door when the project ends. Fortifai deploys a permanent, 100%-population AI capability inside your environment so you get partner-grade forensic logic continuously without paying for a recurring junior analyst pyramid.',
  },

  // Category: Architecture & Security (10–13)
  {
    id: 'faq-10-zero-erp-performance-impact',
    category: 'Architecture & Security',
    question:
      'Will continuous 100% transaction monitoring slow down our live production ERP?',
    answer:
      'Zero production ERP impact. Fortifai ingests data via scheduled, read-only batch extractions during off-peak windows—or reads directly from your existing Snowflake, Databricks, BigQuery, or SAP BW analytical replica—without intrusive Change Data Capture (CDC) agents on transactional nodes.',
  },
  {
    id: 'faq-11-zero-egress-private-vpc',
    category: 'Architecture & Security',
    question:
      'Does any transaction data leave our environment or train external AI models?',
    answer:
      'Zero data egress. Fortifai deploys 100% inside your Customer Private Cloud VPC (AWS, Azure, GCP, including GovCloud) or On-Premises environment under Customer IT’s default-deny outbound network policies. We are **SOC 2 Type II** and **ISO/IEC 27001** certified, support Customer-Managed Encryption Keys (KMS), and use **0%** of customer data to train external AI models.',
  },
  {
    id: 'faq-12-build-vs-buy-ai-coe',
    category: 'Architecture & Security',
    question:
      "Why shouldn't our internal Data & AI Center of Excellence build this in-house?",
    answer:
      'Internal data teams excel at infrastructure, but building an audit-grade risk platform from scratch requires 12–18+ months of reverse-engineering complex ERP table joins (`ACDOCA`, `BSEG`, `EKKO`, `CDHDR`), codifying 200+ battle-tested forensic accounting models, building false-positive exclusion memory, and integrating external 11-dimension counterparty intelligence (`Fortifai D7`). Fortifai gives your AI CoE a ready-made, VPC-native control tower in weeks.',
  },
  {
    id: 'faq-13-native-erp-grc-gap',
    category: 'Architecture & Security',
    question:
      "Why don't SAP S/4HANA, Ariba, SAP GTS, BlackLine, or GRC tools already catch these leakages?",
    answer:
      'Native ERP modules and point-of-entry screening tools check whether a single record is formatted correctly or permissible at the moment of entry. Fortifai inspects **100% of post-entry execution across systems**—correlating live ERP postings, change logs, master contracts, external commodity indices, HR employee records, and continuous **Fortifai D7** ownership and factory-substance shifts.',
  },

  // Category: Governance & Audit (14–16)
  {
    id: 'faq-14-maker-checker-no-erp-writes',
    category: 'Governance & Audit',
    question:
      'Does Fortifai autonomously block payments or write back to our ERP?',
    answer:
      'Never without human authorization. Ingestion is strictly read-only with zero unapproved ERP writes. Recommended actions—such as pre-payment holds, supplier debit memos, or shipment holds—are staged in a governed action queue enforcing two-person **Maker-Checker Segregation of Duties (SoD)**.',
  },
  {
    id: 'faq-15-attorney-client-privilege',
    category: 'Governance & Audit',
    question:
      'How is Attorney-Client Privilege preserved on sensitive bribery, trade, or fraud flags?',
    answer:
      'Compliance agents apply objective **"Signals, Not Verdicts"** language—presenting corroborated factual indicators and source document lineage without generating discoverable legal conclusions—and allow one-click escalation into an isolated **Privileged Legal Review** enclave restricted to authorized Counsel.',
  },
  {
    id: 'faq-16-big4-pcaob-sox-reliance',
    category: 'Governance & Audit',
    question:
      'Can external Big-4 auditors and regulators rely on Fortifai outputs?',
    answer:
      'Yes. Before risk scoring runs, Fortifai executes automated subledger-to-GL completeness tie-outs aligned with **PCAOB AS 1105** (Information Produced by the Entity). Every finding carries deterministic ERP document lineage, COSO 2013 / statutory mapping (SOX 404, FCPA, EAR/ITAR), and a 7-year immutable disposition log aligned with DOJ Evaluation of Corporate Compliance Programs (ECCP) expectations.',
  },

  // Category: Rollout & Commercials (17–19)
  {
    id: 'faq-17-deployment-timeline-it-lift',
    category: 'Rollout & Commercials',
    question:
      'How long does deployment take, and how much internal IT bandwidth is required?',
    answer:
      'Typical production deployment takes **6–8 weeks**. Client lift is intentionally light: 1–2 technical sessions with IT/InfoSec to provision the VPC container and read-only data feed, plus 2–3 scoping workshops with business leads to align materiality thresholds and workflows.',
  },
  {
    id: 'faq-18-single-domain-land-and-expand',
    category: 'Rollout & Commercials',
    question:
      'Can we start with a single domain and expand to other departments later?',
    answer:
      'Yes. Most enterprises start with a single high-ROI domain (such as Procurement & AP, Continuous Control Testing, or Third-Party Risk via standalone **Fortifai D7**, which requires zero ERP integration to start). Because all 17 agents share one foundational ERP spine, activating additional suites for Finance, Audit, Compliance, or Revenue requires zero duplicate IT or security onboarding.',
  },
  {
    id: 'faq-19-usd-pricing-unlimited-seats',
    category: 'Rollout & Commercials',
    question: 'How is Fortifai priced, and do we pay per user seat?',
    answer:
      'Pricing is denominated in USD and combines a one-time VPC deployment & configuration fee with an annual subscription scoped by selected agent domains and annual transaction volume—with **unlimited internal user seats** and optional fixed-scope or retainer packages for Co-Sourced, Fully Managed, or BOOT delivery.',
  },
];

export const DEFAULT_FAQ_CONFIG: ExecutiveFaqConfig = {
  pillLabel: 'EXECUTIVE DUE DILIGENCE · BUYER COMMITTEE FAQ',
  headline: 'Answers for Finance, Audit, Legal, IT & Procurement',
  subtitle:
    'Direct answers covering SME reliability, customization, engagement models, Private Cloud security, and financial accuracy.',
  items: DEFAULT_FAQ_ITEMS.map((item) => ({ ...item })),
};

export const DEFAULT_CMS_CONFIG: BriefingCmsConfig = {
  gate: {
    badgeLabel: 'NDA PROTECTED',
    eyebrow: 'CONFIDENTIAL EXECUTIVE BRIEFING · ZERO DATA EGRESS',
    headline: 'Access the Fortifai Platform Overview',
    subcopy:
      'Enter your corporate details and partner access code to review product briefings, architecture, and agent workflows.',
    ndaHeaderLabel: 'CONFIDENTIALITY & TERMS OF USE',
    checkboxLabel:
      'I agree to the Confidentiality Terms & Non-Disclosure conditions.',
    submitButtonLabel: 'Accept Terms & View Briefing →',
    footerAttribution:
      'OVERVIEW.FORTIFAI.IO · SOVEREIGN ENTERPRISE ASSURANCE · DYNAMIC WATERMARK ACTIVE',
    enforceCorporateEmail: true,
    validAccessCodes: [...VALID_ACCESS_CODES],
    blockedEmailDomains: [...BLOCKED_FREE_EMAIL_DOMAINS],
    ndaClauses: NDA_TERMS_COPY.map((c) => ({ ...c })),
  },
  header: {
    portalPillLabel: 'EXECUTIVE DATA ROOM',
    bookDemoLabel: 'Book a Live Demo ↗',
    bookDemoUrl: BOOK_LIVE_DEMO_URL,
    signOutLabel: 'Sign Out',
  },
  walkthrough: {
    headline: 'Executive Walkthrough',
    subtitle:
      'See Fortifai SARA detect leakages, verify controls, and generate audit-ready dossiers across 100% of live transactions.',
    durationBadge: 'GUIDED PRODUCT TOUR · ~3 MIN',
    coverHeadline: 'Continuous Risk & Margin Assurance — Live Cockpit Tour',
    coverPlayLabel: 'Launch Executive Walkthrough',
    trupeerEmbedUrl: TRUPEER_EMBED_URL,
    maskCornerStamp: true,
    openExternalLabel: 'Open in New Tab ↗',
    chapters: WALKTHROUGH_STAGE_CHAPTERS.map((ch) => ({ ...ch })),
    metrics: WALKTHROUGH_METRICS.map((m) => ({ ...m })),
    nextStepPrompt:
      'Ready to inspect how Fortifai SARA deploys read-only inside your Customer Private Cloud VPC?',
  },
  architecture: {
    ...DEFAULT_ARCHITECTURE_CONFIG,
    layer4Highlights: [...DEFAULT_ARCHITECTURE_CONFIG.layer4Highlights],
    layer3Domains: DEFAULT_ARCHITECTURE_CONFIG.layer3Domains.map((d) => ({
      ...d,
    })),
    layer2Capabilities: [...DEFAULT_ARCHITECTURE_CONFIG.layer2Capabilities],
    layer1Assurances: [...DEFAULT_ARCHITECTURE_CONFIG.layer1Assurances],
  },
  roi: {
    ...DEFAULT_ROI_CONFIG,
    evidenceCards: DEFAULT_ROI_CONFIG.evidenceCards.map((card) => ({
      ...card,
    })),
  },
  faq: {
    ...DEFAULT_FAQ_CONFIG,
    items: DEFAULT_FAQ_CONFIG.items.map((item) => ({ ...item })),
  },
  tabs: DATA_ROOM_TABS.map((t) => ({ ...t })),
  security: {
    enableWatermark: true,
    watermarkSuffix: 'CONFIDENTIAL',
    disableRightClick: true,
  },
};

function safeString(val: unknown, fallback: string): string {
  return typeof val === 'string' ? val : fallback;
}

function safeBool(val: unknown, fallback: boolean): boolean {
  return typeof val === 'boolean' ? val : fallback;
}

function safeNumber(val: unknown, fallback: number): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

function safeStringArray(val: unknown, fallback: string[]): string[] {
  if (!Array.isArray(val)) return [...fallback];
  const filtered = val.filter((item): item is string => typeof item === 'string');
  return filtered.length > 0 ? filtered : [...fallback];
}

function isValidFaqCategory(val: unknown): val is FaqCategory {
  return (
    typeof val === 'string' &&
    (FAQ_CATEGORIES as readonly string[]).includes(val)
  );
}

export function cloneDefaultCmsConfig(): BriefingCmsConfig {
  return JSON.parse(JSON.stringify(DEFAULT_CMS_CONFIG)) as BriefingCmsConfig;
}

function sanitizeCmsRecord(
  parsed: Record<string, unknown>,
  isLegacyMigration = false
): BriefingCmsConfig {
  const defaults = cloneDefaultCmsConfig();
  const g = (parsed.gate ?? {}) as Record<string, unknown>;
  const h = (parsed.header ?? {}) as Record<string, unknown>;
  const w = (parsed.walkthrough ?? {}) as Record<string, unknown>;
  const a = (parsed.architecture ?? {}) as Record<string, unknown>;
  const r = (parsed.roi ?? {}) as Record<string, unknown>;
  const f = (parsed.faq ?? {}) as Record<string, unknown>;
  const s = (parsed.security ?? {}) as Record<string, unknown>;

  const parsedClauses = Array.isArray(g.ndaClauses)
    ? g.ndaClauses
        .filter(
          (item): item is NdaClause =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as NdaClause).heading === 'string' &&
            typeof (item as NdaClause).body === 'string'
        )
        .map((c) => ({ heading: c.heading, body: c.body }))
    : defaults.gate.ndaClauses;

  const parsedChapters = Array.isArray(w.chapters)
    ? w.chapters
        .filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as Record<string, unknown>).code === 'string' &&
            typeof (item as Record<string, unknown>).title === 'string' &&
            typeof (item as Record<string, unknown>).detail === 'string'
        )
        .map((ch, idx) => {
          const rawTitle = safeString(ch.title, '');
          const cleanTitle =
            isLegacyMigration && rawTitle.endsWith('Action Dossiers')
              ? 'Audit Action Dossiers'
              : rawTitle;
          return {
            code: safeString(ch.code, `0${idx + 1}`),
            title: cleanTitle,
            detail: safeString(ch.detail, ''),
            timestampSec: safeNumber(ch.timestampSec, idx * 45),
          };
        })
    : defaults.walkthrough.chapters;

  const parsedMetrics = Array.isArray(w.metrics)
    ? w.metrics
        .filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as Record<string, unknown>).metric === 'string' &&
            typeof (item as Record<string, unknown>).label === 'string'
        )
        .map((m, idx) => ({
          metric: safeString(
            m.metric,
            defaults.walkthrough.metrics[idx]?.metric ?? ''
          ),
          label: safeString(
            m.label,
            defaults.walkthrough.metrics[idx]?.label ?? ''
          ),
          sublabel: safeString(
            m.sublabel,
            defaults.walkthrough.metrics[idx]?.sublabel ?? ''
          ),
        }))
    : defaults.walkthrough.metrics;

  const parsedDomains = Array.isArray(a.layer3Domains)
    ? a.layer3Domains
        .filter(
          (item): item is ArchitectureDomainPill =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as ArchitectureDomainPill).id === 'string' &&
            typeof (item as ArchitectureDomainPill).name === 'string' &&
            typeof (item as ArchitectureDomainPill).detail === 'string' &&
            typeof (item as ArchitectureDomainPill).signals === 'string'
        )
        .map((d) => ({
          id: d.id,
          name: d.name,
          detail: isLegacyMigration
            ? d.detail.replace(
                /regulator-ready\s+\S+\s+case workpapers/i,
                'regulator-ready audit case workpapers'
              )
            : d.detail,
          signals: d.signals,
        }))
    : defaults.architecture.layer3Domains;

  const parsedRoiCards = Array.isArray(r.evidenceCards)
    ? r.evidenceCards
        .filter(
          (item): item is RoiEvidenceCard =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as RoiEvidenceCard).metric === 'string' &&
            typeof (item as RoiEvidenceCard).label === 'string'
        )
        .map((c) => ({
          metric: c.metric,
          label: c.label,
        }))
    : defaults.roi.evidenceCards;

  const LEGACY_FAQ_IDS = new Set([
    'faq-zero-egress-llm',
    'faq-erp-controls-gap',
    'faq-deterministic-math-waterfall',
    'faq-read-only-batch-no-cdc',
    'faq-alert-fatigue-exclusion-memory',
    'faq-attorney-client-privilege',
    'faq-big4-sox-pcaob',
    'faq-pricing-licensing-usd',
  ]);

  const parsedFaqItems = (() => {
    if (!Array.isArray(f.items)) {
      return defaults.faq.items;
    }
    const rawObjects = f.items.filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).question === 'string' &&
        typeof (item as Record<string, unknown>).answer === 'string'
    );
    const hasLegacy8FaqSet = rawObjects.some((item) =>
      LEGACY_FAQ_IDS.has(safeString(item.id, ''))
    );
    if (hasLegacy8FaqSet) {
      const customExtras = rawObjects
        .filter((item) => !LEGACY_FAQ_IDS.has(safeString(item.id, '')))
        .map((item, idx) => ({
          id: safeString(item.id, `faq-custom-migrated-${idx + 1}`),
          category: isValidFaqCategory(item.category)
            ? item.category
            : ('Architecture & Security' as FaqCategory),
          question: safeString(item.question, ''),
          answer: safeString(item.answer, ''),
        }))
        .filter((item) => item.question.trim().length > 0);
      return [...defaults.faq.items, ...customExtras];
    }

    const mapped = rawObjects
      .map((item, idx) => ({
        id: safeString(item.id, `faq-item-${idx + 1}`),
        category: isValidFaqCategory(item.category)
          ? item.category
          : ('Architecture & Security' as FaqCategory),
        question: safeString(item.question, ''),
        answer: safeString(item.answer, ''),
      }))
      .filter((item) => item.question.trim().length > 0);

    return mapped.length > 0 ? mapped : defaults.faq.items;
  })();

  const isLegacyFaqHeader =
    isLegacyMigration &&
    (safeString(f.headline, '') === 'Executive FAQ' ||
      safeString(f.pillLabel, '').startsWith('Buyer Diligence'));

  const RETIRED_TAB_LABELS: Record<string, string[]> = {
    walkthrough: [
      '01 · Executive Walkthrough',
      '01 · Video - Platform Walkthrough',
    ],
    architecture: [
      '03 · Multi-Agent Architecture',
      '02 · Multi-Agent Architecture',
    ],
  };

  const parsedTabs: DataRoomTab[] = defaults.tabs.map((defTab) => {
    if (!Array.isArray(parsed.tabs)) return defTab;
    const match = parsed.tabs.find(
      (candidate): candidate is Record<string, unknown> =>
        Boolean(candidate) &&
        typeof candidate === 'object' &&
        (candidate as Record<string, unknown>).id === defTab.id
    );
    if (!match) return defTab;

    let label = safeString(match.label, defTab.label);
    if (
      isLegacyMigration &&
      (RETIRED_TAB_LABELS[defTab.id]?.includes(label.trim()) ||
        /\d+-Agent Suite/i.test(label))
    ) {
      label = defTab.label;
    }

    const utilityEyebrow =
      defTab.utilityEyebrow !== undefined
        ? safeString(match.utilityEyebrow, defTab.utilityEyebrow)
        : undefined;

    let utilityTitle =
      defTab.utilityTitle !== undefined
        ? safeString(match.utilityTitle, defTab.utilityTitle)
        : undefined;
    if (
      isLegacyMigration &&
      utilityTitle &&
      /\d+-Agent Domain Catalog/i.test(utilityTitle)
    ) {
      utilityTitle = defTab.utilityTitle;
    }

    const utilitySubtitle =
      defTab.utilitySubtitle !== undefined
        ? safeString(match.utilitySubtitle, defTab.utilitySubtitle)
        : undefined;

    let embedSrc =
      defTab.embedSrc !== undefined
        ? safeString(match.embedSrc, defTab.embedSrc)
        : undefined;
    if (embedSrc === './agent-suite.html' || embedSrc === '/agent-suite.html') {
      embedSrc = '';
    }

    return {
      ...defTab,
      label,
      shortSubtitle: safeString(match.shortSubtitle, defTab.shortSubtitle),
      utilityEyebrow,
      utilityTitle,
      utilitySubtitle,
      embedSrc,
    };
  });

  let validCodes = safeStringArray(
    g.validAccessCodes,
    defaults.gate.validAccessCodes
  );
  if (isLegacyMigration) {
    const mergedSet = new Set([
      ...validCodes.map((c) => c.trim().toUpperCase()),
      ...VALID_ACCESS_CODES,
    ]);
    validCodes = Array.from(mergedSet).filter(Boolean);
  }

  return {
    gate: {
      badgeLabel: safeString(g.badgeLabel, defaults.gate.badgeLabel),
      eyebrow: safeString(g.eyebrow, defaults.gate.eyebrow),
      headline: safeString(g.headline, defaults.gate.headline),
      subcopy: safeString(g.subcopy, defaults.gate.subcopy),
      ndaHeaderLabel: safeString(
        g.ndaHeaderLabel,
        defaults.gate.ndaHeaderLabel
      ),
      checkboxLabel: safeString(g.checkboxLabel, defaults.gate.checkboxLabel),
      submitButtonLabel: safeString(
        g.submitButtonLabel,
        defaults.gate.submitButtonLabel
      ),
      footerAttribution: safeString(
        g.footerAttribution,
        defaults.gate.footerAttribution
      ),
      enforceCorporateEmail: safeBool(
        g.enforceCorporateEmail,
        defaults.gate.enforceCorporateEmail
      ),
      validAccessCodes: validCodes,
      blockedEmailDomains: safeStringArray(
        g.blockedEmailDomains,
        defaults.gate.blockedEmailDomains
      ),
      ndaClauses:
        parsedClauses.length > 0 ? parsedClauses : defaults.gate.ndaClauses,
    },
    header: {
      portalPillLabel: safeString(
        h.portalPillLabel,
        defaults.header.portalPillLabel
      ),
      bookDemoLabel: safeString(
        h.bookDemoLabel,
        defaults.header.bookDemoLabel
      ),
      bookDemoUrl: safeString(h.bookDemoUrl, defaults.header.bookDemoUrl),
      signOutLabel: safeString(h.signOutLabel, defaults.header.signOutLabel),
    },
    walkthrough: {
      headline: safeString(w.headline, defaults.walkthrough.headline),
      subtitle: safeString(w.subtitle, defaults.walkthrough.subtitle),
      durationBadge: safeString(
        w.durationBadge,
        defaults.walkthrough.durationBadge
      ),
      coverHeadline: safeString(
        w.coverHeadline,
        defaults.walkthrough.coverHeadline
      ),
      coverPlayLabel: safeString(
        w.coverPlayLabel,
        defaults.walkthrough.coverPlayLabel
      ),
      trupeerEmbedUrl: safeString(
        w.trupeerEmbedUrl,
        defaults.walkthrough.trupeerEmbedUrl
      ),
      maskCornerStamp: safeBool(
        w.maskCornerStamp,
        defaults.walkthrough.maskCornerStamp
      ),
      openExternalLabel: safeString(
        w.openExternalLabel,
        defaults.walkthrough.openExternalLabel
      ),
      chapters:
        parsedChapters.length > 0
          ? parsedChapters
          : defaults.walkthrough.chapters,
      metrics:
        parsedMetrics.length > 0 ? parsedMetrics : defaults.walkthrough.metrics,
      nextStepPrompt: safeString(
        w.nextStepPrompt,
        defaults.walkthrough.nextStepPrompt
      ),
    },
    architecture: {
      pillLabel: safeString(a.pillLabel, defaults.architecture.pillLabel),
      headline: safeString(a.headline, defaults.architecture.headline),
      subcopy: safeString(a.subcopy, defaults.architecture.subcopy),
      layer4Badge: safeString(a.layer4Badge, defaults.architecture.layer4Badge),
      layer4Title: safeString(a.layer4Title, defaults.architecture.layer4Title),
      layer4Summary: safeString(
        a.layer4Summary,
        defaults.architecture.layer4Summary
      ),
      layer4Highlights: safeStringArray(
        a.layer4Highlights,
        defaults.architecture.layer4Highlights
      ),
      layer3Badge: safeString(a.layer3Badge, defaults.architecture.layer3Badge),
      layer3Title: safeString(a.layer3Title, defaults.architecture.layer3Title),
      layer3Summary: safeString(
        a.layer3Summary,
        defaults.architecture.layer3Summary
      ),
      layer3Domains:
        parsedDomains.length > 0
          ? parsedDomains
          : defaults.architecture.layer3Domains,
      layer2Badge: safeString(a.layer2Badge, defaults.architecture.layer2Badge),
      layer2Title: safeString(a.layer2Title, defaults.architecture.layer2Title),
      layer2Summary:
        safeString(a.layer2Summary, defaults.architecture.layer2Summary) ===
        'Seven shared intelligence engines convert raw multi-system records into corroborated, deterministic financial proof.'
          ? defaults.architecture.layer2Summary
          : safeString(a.layer2Summary, defaults.architecture.layer2Summary),
      layer2Capabilities: (() => {
        const arr = safeStringArray(
          a.layer2Capabilities,
          defaults.architecture.layer2Capabilities
        );
        const hasLegacyEngines = arr.some(
          (item) =>
            item.trim() === 'Single Source of Truth' ||
            item.includes('Plain-English Case Narratives')
        );
        return hasLegacyEngines
          ? [...defaults.architecture.layer2Capabilities]
          : arr;
      })(),
      layer1Badge: safeString(a.layer1Badge, defaults.architecture.layer1Badge),
      layer1Title: safeString(a.layer1Title, defaults.architecture.layer1Title),
      layer1Summary: safeString(
        a.layer1Summary,
        defaults.architecture.layer1Summary
      ),
      layer1Assurances: safeStringArray(
        a.layer1Assurances,
        defaults.architecture.layer1Assurances
      ),
    },
    roi: {
      pillLabel: safeString(r.pillLabel, defaults.roi.pillLabel),
      headline: safeString(r.headline, defaults.roi.headline),
      subtitle: safeString(r.subtitle, defaults.roi.subtitle),
      evidenceCards:
        parsedRoiCards.length === 4
          ? parsedRoiCards
          : defaults.roi.evidenceCards,
    },
    faq: {
      pillLabel: isLegacyFaqHeader
        ? defaults.faq.pillLabel
        : safeString(f.pillLabel, defaults.faq.pillLabel),
      headline: isLegacyFaqHeader
        ? defaults.faq.headline
        : safeString(f.headline, defaults.faq.headline),
      subtitle: isLegacyFaqHeader
        ? defaults.faq.subtitle
        : safeString(f.subtitle, defaults.faq.subtitle),
      items: parsedFaqItems,
    },
    tabs: parsedTabs,
    security: {
      enableWatermark: safeBool(
        s.enableWatermark,
        defaults.security.enableWatermark
      ),
      watermarkSuffix: safeString(
        s.watermarkSuffix,
        defaults.security.watermarkSuffix
      ),
      disableRightClick: safeBool(
        s.disableRightClick,
        defaults.security.disableRightClick
      ),
    },
  };
}

function normalizeCmsRevision(rawVal: unknown): number {
  if (typeof rawVal !== 'number' || !Number.isFinite(rawVal) || rawVal <= 0) {
    return 0;
  }
  // Normalize legacy container wall-clock timestamps (e.g. 1795002000000) to revision 1
  if (rawVal >= 1_000_000_000_000) {
    return 1;
  }
  return Math.floor(rawVal);
}

export function formatSavedTimeLabel(date = new Date()): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function loadInitialCmsState(): InitialCmsLoadResult {
  const cmsActive = isLiveCmsEnabled();
  const hasDiskData =
    PERSISTED_CMS_DATA !== null && typeof PERSISTED_CMS_DATA === 'object';
  const diskRevision = hasDiskData
    ? Math.max(1, normalizeCmsRevision(PERSISTED_CMS_UPDATED_AT))
    : 0;

  if (!cmsActive) {
    if (hasDiskData && PERSISTED_CMS_DATA) {
      return {
        config: sanitizeCmsRecord(PERSISTED_CMS_DATA, false),
        revision: diskRevision,
        hasCustomEdits: true,
        needsInitialDiskSync: false,
        savedAtLabel: null,
      };
    }
    return {
      config: cloneDefaultCmsConfig(),
      revision: 0,
      hasCustomEdits: false,
      needsInitialDiskSync: false,
      savedAtLabel: null,
    };
  }

  try {
    // 1. Check current v9 storage format ({ revision, dirty, savedAtLabel, config })
    const rawV9 = window.localStorage.getItem(CMS_STORAGE_KEY);
    if (rawV9) {
      const parsedV9 = JSON.parse(rawV9) as {
        revision?: number;
        dirty?: boolean;
        savedAtLabel?: string;
        config?: Record<string, unknown>;
      } | null;

      if (parsedV9 && parsedV9.config && typeof parsedV9.config === 'object') {
        const localRev = normalizeCmsRevision(parsedV9.revision);
        const isDirty = Boolean(parsedV9.dirty);
        if (isDirty || localRev >= diskRevision) {
          return {
            config: sanitizeCmsRecord(parsedV9.config, false),
            revision: Math.max(localRev, diskRevision),
            hasCustomEdits: true,
            needsInitialDiskSync: isDirty || localRev > diskRevision,
            savedAtLabel:
              typeof parsedV9.savedAtLabel === 'string'
                ? parsedV9.savedAtLabel
                : null,
          };
        }
      }
    }

    // 2. Recover any earlier user edits stored in v8 localStorage that were previously
    // shadowed by container/browser wall-clock skew, and immediately sync them to disk.
    const rawV8 = window.localStorage.getItem(PREVIOUS_V8_CMS_STORAGE_KEY);
    if (rawV8) {
      const parsedV8 = JSON.parse(rawV8) as {
        config?: Record<string, unknown>;
      } | null;
      if (parsedV8 && parsedV8.config && typeof parsedV8.config === 'object') {
        const recoveredConfig = sanitizeCmsRecord(parsedV8.config, false);
        return {
          config: recoveredConfig,
          revision: Math.max(1, diskRevision),
          hasCustomEdits: true,
          needsInitialDiskSync: true,
          savedAtLabel: formatSavedTimeLabel(),
        };
      }
    }

    // 3. Legacy pre-v8 storage fallback when disk has no persisted data
    for (const legacyKey of LEGACY_CMS_STORAGE_KEYS) {
      const rawLegacy = window.localStorage.getItem(legacyKey);
      if (!rawLegacy) continue;
      const parsedLegacy = JSON.parse(rawLegacy) as Record<
        string,
        unknown
      > | null;
      if (parsedLegacy && typeof parsedLegacy === 'object') {
        const inner =
          parsedLegacy.config && typeof parsedLegacy.config === 'object'
            ? (parsedLegacy.config as Record<string, unknown>)
            : parsedLegacy;
        const migratedConfig = sanitizeCmsRecord(inner, true);
        if (diskRevision === 0) {
          return {
            config: migratedConfig,
            revision: 1,
            hasCustomEdits: true,
            needsInitialDiskSync: true,
            savedAtLabel: formatSavedTimeLabel(),
          };
        }
      }
    }
  } catch {
    // Ignore restricted storage errors
  }

  if (hasDiskData && PERSISTED_CMS_DATA) {
    return {
      config: sanitizeCmsRecord(PERSISTED_CMS_DATA, false),
      revision: diskRevision,
      hasCustomEdits: true,
      needsInitialDiskSync: false,
      savedAtLabel: null,
    };
  }

  return {
    config: cloneDefaultCmsConfig(),
    revision: 0,
    hasCustomEdits: false,
    needsInitialDiskSync: false,
    savedAtLabel: null,
  };
}

export function saveCmsConfigLocal(
  config: BriefingCmsConfig,
  options?: {
    revision?: number;
    dirty?: boolean;
    savedAtLabel?: string | null;
  }
): void {
  if (!isLiveCmsEnabled()) return;
  try {
    const payload = {
      revision: options?.revision ?? 1,
      dirty: options?.dirty ?? false,
      savedAtLabel: options?.savedAtLabel ?? formatSavedTimeLabel(),
      config,
    };
    window.localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(payload));
    window.localStorage.removeItem(PREVIOUS_V8_CMS_STORAGE_KEY);
    for (const legacyKey of LEGACY_CMS_STORAGE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
}

export interface InstantCmsSaveResult {
  ok: boolean;
  diskSynced: boolean;
  revision: number;
  savedAtLabel: string;
}

export async function saveCmsConfigInstant(
  config: BriefingCmsConfig,
  currentRevision = 1
): Promise<InstantCmsSaveResult> {
  const savedAtLabel = formatSavedTimeLabel();
  if (!isLiveCmsEnabled()) {
    return {
      ok: false,
      diskSynced: false,
      revision: currentRevision,
      savedAtLabel,
    };
  }

  // Step 1: Immediate synchronous localStorage commit (0ms) marked dirty until disk confirms
  saveCmsConfigLocal(config, {
    revision: currentRevision,
    dirty: true,
    savedAtLabel,
  });

  // Step 2: Immediate atomic write to src/config/cmsPersisted.ts via Vite server middleware
  try {
    const response = await fetch('/api/cms/save', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, revision: currentRevision }),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (
      response.ok &&
      !response.redirected &&
      contentType.includes('application/json')
    ) {
      const data = (await response.json()) as {
        ok?: boolean;
        revision?: number;
      };
      if (data?.ok) {
        const nextRev =
          typeof data.revision === 'number' && data.revision > 0
            ? data.revision
            : currentRevision + 1;
        saveCmsConfigLocal(config, {
          revision: nextRev,
          dirty: false,
          savedAtLabel,
        });
        return {
          ok: true,
          diskSynced: true,
          revision: nextRev,
          savedAtLabel,
        };
      }
    }
  } catch {
    // Fall back cleanly to synchronous localStorage commit; will sync to disk on next reload
  }

  return {
    ok: true,
    diskSynced: false,
    revision: currentRevision,
    savedAtLabel,
  };
}

export async function fetchLatestCmsFromDisk(): Promise<{
  ok: boolean;
  revision: number;
  config: BriefingCmsConfig | null;
}> {
  if (!isLiveCmsEnabled()) {
    return { ok: false, revision: 0, config: null };
  }
  try {
    const response = await fetch('/api/cms/state', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    const contentType = response.headers.get('content-type') ?? '';
    if (
      !response.ok ||
      response.redirected ||
      !contentType.includes('application/json')
    ) {
      return { ok: false, revision: 0, config: null };
    }
    const payload = (await response.json()) as {
      ok?: boolean;
      revision?: number;
      config?: Record<string, unknown> | null;
    };
    if (!payload?.ok) {
      return { ok: false, revision: 0, config: null };
    }
    const rev = normalizeCmsRevision(payload.revision);
    if (!payload.config || typeof payload.config !== 'object') {
      return { ok: true, revision: 0, config: null };
    }
    return {
      ok: true,
      revision: Math.max(1, rev),
      config: sanitizeCmsRecord(payload.config, false),
    };
  } catch {
    return { ok: false, revision: 0, config: null };
  }
}

export function flushPendingCmsBeacon(
  config: BriefingCmsConfig,
  revision: number
): void {
  if (!isLiveCmsEnabled()) return;
  saveCmsConfigLocal(config, {
    revision,
    dirty: true,
    savedAtLabel: formatSavedTimeLabel(),
  });
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ config, revision })], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/cms/save', blob);
    }
  } catch {
    // Ignore beacon restrictions
  }
}

export async function clearStoredCmsConfig(): Promise<void> {
  try {
    window.localStorage.removeItem(CMS_STORAGE_KEY);
    window.localStorage.removeItem(PREVIOUS_V8_CMS_STORAGE_KEY);
    for (const legacyKey of LEGACY_CMS_STORAGE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
  } catch {
    // Ignore storage errors
  }
  if (isLiveCmsEnabled()) {
    try {
      await fetch('/api/cms/reset', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch {
      // Ignore network errors
    }
  }
}

export function formatCmsConfigAsTypeScript(
  config: BriefingCmsConfig,
  revision = 1
): string {
  return `// Auto-synced by Fortifai Live CMS Studio inside Google AI Studio.\n// When downloading the ZIP for Git deployment, any edits saved in Live CMS are persisted here automatically.\nexport const PERSISTED_CMS_UPDATED_AT = ${Math.max(1, revision)};\n\nexport const PERSISTED_CMS_DATA: Record<string, unknown> | null = ${JSON.stringify(config, null, 2)};\n`;
}
