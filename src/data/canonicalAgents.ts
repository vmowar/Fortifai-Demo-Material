export type AgentSuiteCategory =
  | 'ALL'
  | 'PROCUREMENT'
  | 'REVENUE'
  | 'FINANCE'
  | 'COMPLIANCE'
  | 'AUDIT';

export interface CanonicalAgent {
  indexBadge: string;
  suite: Exclude<AgentSuiteCategory, 'ALL'>;
  suiteLabel: string;
  title: string;
  description: string;
  signals: string;
  output: string;
}

export interface AgentSuiteFilterOption {
  id: AgentSuiteCategory;
  label: string;
}

export const AGENT_SUITE_FILTERS: readonly AgentSuiteFilterOption[] = [
  { id: 'ALL', label: 'All Suites' },
  { id: 'PROCUREMENT', label: 'Procurement & Supply Chain' },
  { id: 'REVENUE', label: 'Revenue & O2C' },
  { id: 'FINANCE', label: 'Finance & Working Capital' },
  { id: 'COMPLIANCE', label: 'Compliance & Legal' },
  { id: 'AUDIT', label: 'Internal Audit' },
];

export const CANONICAL_AGENTS: readonly CanonicalAgent[] = [
  // Procurement & Supply Chain (01–07)
  {
    indexBadge: '01',
    suite: 'PROCUREMENT',
    suiteLabel: 'Procurement & Supply Chain',
    title: 'Procurement Cost',
    description:
      'Monitors 100% of supplier invoices against master contracts, payment terms, commodity indices, and volume-rebate tiers to stop overpayments before disbursement.',
    signals:
      'Signed Contracts · PO & Invoice Line Items · Commodity Indices · Payment Terms',
    output: 'Pre-payment hold & quantified overcharge recovery pack',
  },
  {
    indexBadge: '02',
    suite: 'PROCUREMENT',
    suiteLabel: 'Procurement & Supply Chain',
    title: 'Pass-Through Vendor',
    description:
      'Exposes zero-substance intermediaries and trading shells inserting unearned 20–40% markups between your plants and Tier-2 OEM manufacturers.',
    signals:
      'Cross-Plant PO Pricing · Fortifai D7 Substance & Headcount · Tax/HSN Scope',
    output: 'OEM disintermediation & direct-sourcing savings dossier',
  },
  {
    indexBadge: '03',
    suite: 'PROCUREMENT',
    suiteLabel: 'Procurement & Supply Chain',
    title: 'Third-Party Due Diligence',
    description:
      'Autonomous pure-play external counterparty vetting powered by Fortifai D7 across 11 risk dimensions—delivering a scored onboarding verdict in hours without ERP integration.',
    signals:
      'Global UBO Registries · Sanctions & PEP · Financial Health · Litigation & Adverse Media · ESG',
    output: '11-dimension counterparty risk score & onboarding verdict',
  },
  {
    indexBadge: '04',
    suite: 'PROCUREMENT',
    suiteLabel: 'Procurement & Supply Chain',
    title: 'Vendor Risk Monitoring',
    description:
      'Continuous post-onboarding vendor surveillance that triangulates Fortifai D7 external ownership shifts with live ERP spend behavior and employee master records.',
    signals:
      'Fortifai D7 Risk Graph · ERP Vendor Master & Payments · HR/Employee Records',
    output: 'Undisclosed related-party, employee-conflict & vendor drift alert',
  },
  {
    indexBadge: '05',
    suite: 'PROCUREMENT',
    suiteLabel: 'Procurement & Supply Chain',
    title: 'Freight & Inventory',
    description:
      'Reconciles weighbridge logs, goods receipts, stock movements, and carrier rate cards to catch phantom deliveries, shrinkage, and duplicate freight billing.',
    signals:
      'Goods Receipts · Weighbridge Logs · Carrier Invoices · Inventory Movements',
    output: 'Verified logistics recovery & inventory discrepancy report',
  },
  {
    indexBadge: '06',
    suite: 'PROCUREMENT',
    suiteLabel: 'Procurement & Supply Chain',
    title: 'Tender & Bid Risk',
    description:
      'Screens pre-award RFQs, vendor quotes, and split requisitions to detect bid rotation, specification tailoring, and approval-threshold bypasses before PO award.',
    signals:
      'RFQ Bid Submissions · Purchase Requisitions · Bidder Metadata · Price Spreads',
    output: 'Pre-award bid integrity & split-order intervention alert',
  },
  {
    indexBadge: '07',
    suite: 'PROCUREMENT',
    suiteLabel: 'Procurement & Supply Chain',
    title: 'Procurement Controls',
    description:
      'Continuously audits three-way match tolerances, retroactive POs, maverick spend, and segregation-of-duties breaches across every procure-to-pay step.',
    signals:
      'PO-to-GRN-to-Invoice Chains · Tolerance Tables · User Access & Approval Logs',
    output: 'Real-time P2P control breach & configuration fix pack',
  },

  // Revenue & O2C (08–10)
  {
    indexBadge: '08',
    suite: 'REVENUE',
    suiteLabel: 'Revenue & O2C',
    title: 'Discounting Risk',
    description:
      'Tracks manual price overrides, off-policy sales discounts, and unapproved customer rebates eroding gross-to-net margin across regions and reps.',
    signals:
      'Sales Orders · Pricing Condition Overrides · Rebate Accruals · Customer Master',
    output: 'Gross-to-net margin leakage & pricing governance dossier',
  },
  {
    indexBadge: '09',
    suite: 'REVENUE',
    suiteLabel: 'Revenue & O2C',
    title: 'Revenue Cut-Off',
    description:
      'Detects quarter-end channel stuffing, unverified proof-of-delivery billings, and post-period credit-memo washes under ASC 606.',
    signals:
      'Period-End Shipments · Proof-of-Delivery Logs · Post-Close Credit Memos & Returns',
    output: 'ASC 606 cut-off exception & revenue assurance pack',
  },
  {
    indexBadge: '10',
    suite: 'REVENUE',
    suiteLabel: 'Revenue & O2C',
    title: 'Demand & Order Risk',
    description:
      'Isolates artificial quarter-end order spikes, non-binding bookings, and manual allocation overrides that distort S&OP demand baselines.',
    signals:
      'Order Backlog · Modification Logs · Historical Sell-Through · Credit Overrides',
    output: 'Sanitized true-demand baseline & order-integrity alert',
  },

  // Finance & Working Capital (11–12)
  {
    indexBadge: '11',
    suite: 'FINANCE',
    suiteLabel: 'Finance & Working Capital',
    title: 'Working Capital',
    description:
      'Intercepts fuzzy-matched duplicate invoices, early payments ahead of contracted terms, and unapplied vendor credits prior to the payment run.',
    signals:
      'Open AP Subledger · Payment Proposals · Contracted Terms · Vendor Credit Memos',
    output: 'Pre-payment block queue & DPO cash-release schedule',
  },
  {
    indexBadge: '12',
    suite: 'FINANCE',
    suiteLabel: 'Finance & Working Capital',
    title: 'Balance Sheet Close',
    description:
      'Auto-triages routine GL account reconciliations while isolating unsubstantiated accruals, aged GR/IR balances, and high-risk top-side manual journal entries.',
    signals:
      'General Ledger Postings · Top-Side Manual JEs · Subledger Tie-Outs · GR/IR Aging',
    output: 'Auto-cleared reconciliation pack & close anomaly workpaper',
  },

  // Compliance & Legal (13–15)
  {
    indexBadge: '13',
    suite: 'COMPLIANCE',
    suiteLabel: 'Compliance & Legal',
    title: 'Bribery & T&E Risk',
    description:
      'Continuously tests 100% of third-party payments, offshore consulting retainers, and employee T&E claims against FCPA, UKBA, and ISO 37001 indicators.',
    signals:
      'Non-PO Disbursements · T&E & Attendee Logs · High-CPI Conduits · Government Tenders',
    output: 'Privileged legal review signal ("Signals, Not Verdicts")',
  },
  {
    indexBadge: '14',
    suite: 'COMPLIANCE',
    suiteLabel: 'Compliance & Legal',
    title: 'Trade Diversion Risk',
    description:
      'Monitors controlled shipments after initial trade-compliance clearance to catch mid-flight destination flips, transshipment hubs, and front-company masking.',
    signals:
      'Controlled Orders (ECCN) · Post-Clearance Route Edits · Freight Forwarders · Fortifai D7 Screening',
    output: 'Pre-shipment export hold & BIS/OFAC/EAR evidence file',
  },
  {
    indexBadge: '15',
    suite: 'COMPLIANCE',
    suiteLabel: 'Compliance & Legal',
    title: 'Forensic Case Investigations',
    description:
      'Clusters multi-rule anomalies and whistleblower tips across ERP chains and entity graphs into court- and regulator-defensible investigation files.',
    signals:
      'Cross-Rule Convergence · Whistleblower Intake · Bank/Address Links · Audit Logs',
    output: 'Cryptographically sealed forensic investigation dossier',
  },

  // Internal Audit (16–17)
  {
    indexBadge: '16',
    suite: 'AUDIT',
    suiteLabel: 'Internal Audit',
    title: 'Control Testing',
    description:
      'Replaces 25-row quarterly sampling with continuous 100% population SOX and ICFR control testing mapped to COSO 2013 and PCAOB AS 1105 completeness checks.',
    signals:
      'Full ERP Transaction Population · User Roles & SoD Matrix · System Change Logs',
    output: '100% population ICFR workpaper & Audit Committee pack',
  },
  {
    indexBadge: '17',
    suite: 'AUDIT',
    suiteLabel: 'Internal Audit',
    title: 'Document Forensics',
    description:
      'Screens incoming supplier PDFs, bank-change letters, and supporting vouchers prior to posting for digital tampering, cloned templates, and altered metadata.',
    signals:
      'Invoice & Bank Letter PDFs · Pixel & Font Metadata · Cross-Vendor Document Hashes',
    output: 'Pre-posting forged document quarantine alert',
  },
];
