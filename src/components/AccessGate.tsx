import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  AuthenticatedSession,
  BriefingCmsConfig,
} from '../config/briefingConfig';
import { FortifaiLogo } from './FortifaiLogo';

interface AccessGateProps {
  gateConfig: BriefingCmsConfig['gate'];
  onAuthenticated: (session: AuthenticatedSession) => void;
}

export function formatUtcTimestamp(date: Date): string {
  const iso = date.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

export const AccessGate: React.FC<AccessGateProps> = ({
  gateConfig,
  onAuthenticated,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInternal = email.trim().toLowerCase().endsWith('@fortifai.io');

  const unlockPortal = () => {
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOrg = organization.trim();
    const normalizedCode = accessCode.trim().toUpperCase();
    const internalDirectBypass = trimmedEmail.endsWith('@fortifai.io');

    // Instant zero-checkbox direct bypass for @fortifai.io emails
    if (internalDirectBypass) {
      const emailRegex = /^[^\s@]+@fortifai\.io$/i;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage(
          'Please enter a valid @fortifai.io email address (for example, name@fortifai.io).'
        );
        return;
      }

      setIsSubmitting(true);
      const now = new Date();
      const emailPrefix = trimmedEmail.split('@')[0] || 'Fortifai Team';

      const sessionPayload: AuthenticatedSession = {
        name: trimmedName || emailPrefix,
        email: trimmedEmail,
        organization: trimmedOrg || 'Fortifai',
        accessCode: normalizedCode || 'FORTIFAI_INTERNAL',
        timestamp: now.toISOString(),
        formattedTimestamp: formatUtcTimestamp(now),
      };

      onAuthenticated(sessionPayload);
      return;
    }

    if (!trimmedName) {
      setErrorMessage(
        'Please enter your full name to register your executive briefing session.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage(
        'Please enter a valid corporate email address (for example, name@company.com).'
      );
      return;
    }

    const emailDomain = trimmedEmail.split('@')[1] || '';
    const normalizedBlocked = gateConfig.blockedEmailDomains.map((d) =>
      d.trim().toLowerCase()
    );
    if (
      gateConfig.enforceCorporateEmail &&
      normalizedBlocked.includes(emailDomain)
    ) {
      setErrorMessage(
        `Please enter your corporate or firm email address. Personal webmail domains (@${emailDomain}) are not eligible for partner data room access.`
      );
      return;
    }

    if (!trimmedOrg) {
      setErrorMessage(
        'Please specify your organization, enterprise, or advisory firm.'
      );
      return;
    }

    const normalizedAllowedCodes = gateConfig.validAccessCodes.map((c) =>
      c.trim().toUpperCase()
    );
    if (!normalizedCode || !normalizedAllowedCodes.includes(normalizedCode)) {
      setErrorMessage(
        'Invalid partner or briefing access code. Please enter a valid invitation code provided by your Fortifai executive contact.'
      );
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage(
        'Please confirm your acceptance of the Confidentiality Terms & Non-Disclosure conditions before proceeding.'
      );
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const sessionPayload: AuthenticatedSession = {
      name: trimmedName,
      email: trimmedEmail,
      organization: trimmedOrg,
      accessCode: normalizedCode,
      timestamp: now.toISOString(),
      formattedTimestamp: formatUtcTimestamp(now),
    };

    onAuthenticated(sessionPayload);
  };

  const validateAndSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unlockPortal();
  };

  return (
    <main className="min-h-screen w-full bg-[#F6F7F9] fortifai-gate-glow flex flex-col items-center justify-center px-4 py-2.5 sm:py-3">
      {/* Centered Crisp White Gate Card */}
      <section
        aria-labelledby="gate-headline"
        className="w-full max-w-[500px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] px-5 py-4 sm:px-7 sm:py-5 fortifai-card-shadow"
      >
        {/* Top Row: Official Fortifai Logo Lockup + Optional NDA Badge Pill */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <FortifaiLogo height={24} />
          {gateConfig.badgeLabel.trim() !== '' && (
            <span className="inline-flex items-center gap-1.5 rounded-[5px] px-2 py-0.5 fortifai-pill whitespace-nowrap">
              <ShieldCheck className="w-3 h-3 text-[#2E5A8A] shrink-0" />
              {gateConfig.badgeLabel}
            </span>
          )}
        </div>

        {/* Top Eyebrow */}
        {gateConfig.eyebrow.trim() !== '' && (
          <p className="font-mono-tabular text-[10px] font-medium tracking-[0.05em] text-[#2E5A8A] uppercase">
            {gateConfig.eyebrow}
          </p>
        )}

        {/* Gate H1 (#163B66, weight 500) */}
        <h1
          id="gate-headline"
          className="mt-1 text-[clamp(21px,2.4vw,26px)] font-medium leading-[1.18] tracking-[-0.022em] text-[#163B66] text-balance"
        >
          {gateConfig.headline}
        </h1>

        {/* Sub-copy */}
        {gateConfig.subcopy.trim() !== '' && (
          <p className="mt-1 text-[12.5px] font-normal leading-[1.5] text-[#4B5B6E]">
            {gateConfig.subcopy}
          </p>
        )}

        {/* Subtle Direct-Access Status Pill for @fortifai.io */}
        {isInternal && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-[7px] bg-[#E8F0F8] border border-[#6699CC]/40 px-2.5 py-1 font-mono-tabular text-[10.5px] font-medium text-[#163B66]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E5A8A] shrink-0" />
            <span>Internal Fortifai Team — Direct Access Enabled</span>
          </div>
        )}

        {/* Validation Error Alert (#FDECEC surface with #8B1A1A text) */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-2 flex items-start gap-2 rounded-[8px] bg-[#FDECEC] border border-[#F3C5C5] px-2.5 py-1.5 text-[12px] leading-[1.45] text-[#8B1A1A]"
          >
            <AlertCircle className="w-3.5 h-3.5 text-[#8B1A1A] shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Clickwrap NDA Access Form */}
        <form onSubmit={validateAndSubmit} noValidate className="mt-2.5 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 1. Full Name */}
            <div>
              <label
                htmlFor="gate-full-name"
                className="block text-[11.5px] font-medium text-[#163B66] mb-0.5"
              >
                Full Name{' '}
                {!isInternal && <span className="text-[#8B1A1A]">*</span>}
              </label>
              <input
                id="gate-full-name"
                name="name"
                type="text"
                required={!isInternal}
                autoComplete="name"
                placeholder={isInternal ? 'Optional for @fortifai.io' : 'Alexandra Vance'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12.5px] text-[#0D1520] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
              />
            </div>

            {/* 2. Corporate Email */}
            <div>
              <label
                htmlFor="gate-corporate-email"
                className="block text-[11.5px] font-medium text-[#163B66] mb-0.5"
              >
                Corporate Email <span className="text-[#8B1A1A]">*</span>
              </label>
              <input
                id="gate-corporate-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="avance@enterprise.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isInternal) {
                    e.preventDefault();
                    unlockPortal();
                  }
                }}
                className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12.5px] text-[#0D1520] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
              />
            </div>

            {/* 3. Organization / Firm */}
            <div className={isInternal ? 'sm:col-span-2' : ''}>
              <label
                htmlFor="gate-organization"
                className="block text-[11.5px] font-medium text-[#163B66] mb-0.5"
              >
                Organization / Firm{' '}
                {!isInternal && <span className="text-[#8B1A1A]">*</span>}
              </label>
              <input
                id="gate-organization"
                name="organization"
                type="text"
                required={!isInternal}
                autoComplete="organization"
                placeholder={isInternal ? 'Fortifai (auto-filled if blank)' : 'Global Assurance LLP'}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 text-[12.5px] text-[#0D1520] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
              />
            </div>

            {/* 4. Partner / Briefing Access Code (Hidden when @fortifai.io is entered) */}
            {!isInternal && (
              <div>
                <label
                  htmlFor="gate-access-code"
                  className="block text-[11.5px] font-medium text-[#163B66] mb-0.5"
                >
                  Partner / Access Code <span className="text-[#8B1A1A]">*</span>
                </label>
                <input
                  id="gate-access-code"
                  name="accessCode"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Enter invitation code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] px-2.5 font-mono-tabular text-[12px] tracking-[0.04em] uppercase text-[#0D1520] placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
                />
              </div>
            )}
          </div>

          {/* Confidentiality & Terms Box + Clickwrap Checkbox (Hidden when @fortifai.io direct access is active) */}
          {!isInternal && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-tabular text-[10px] font-medium tracking-[0.04em] text-[#2E5A8A] uppercase">
                    {gateConfig.ndaHeaderLabel}
                  </span>
                  <span className="font-mono-tabular text-[10px] text-[#64748B]">
                    Scroll to review
                  </span>
                </div>
                <div
                  tabIndex={0}
                  aria-label="Confidentiality and Non-Disclosure Terms"
                  className="max-h-[70px] overflow-y-auto fortifai-scroll rounded-[7px] bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1.5 text-[11px] leading-[1.42] text-[#4B5B6E] space-y-1 focus:outline-none focus:border-[#2E5A8A]"
                >
                  {gateConfig.ndaClauses.map((clause, index) => (
                    <p key={`${clause.heading}-${index}`}>
                      <span className="font-semibold text-[#163B66]">
                        {clause.heading}
                      </span>{' '}
                      {clause.body}
                    </p>
                  ))}
                </div>
              </div>

              <label
                htmlFor="gate-nda-checkbox"
                className="flex items-start gap-2 cursor-pointer select-none pt-0.5"
              >
                <input
                  id="gate-nda-checkbox"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-[#D1D5DB] text-[#163B66] accent-[#163B66] focus:ring-2 focus:ring-[#2E5A8A]/30 cursor-pointer shrink-0"
                />
                <span className="text-[12px] leading-[1.4] text-[#4B5B6E]">
                  {gateConfig.checkboxLabel}
                </span>
              </label>
            </>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[36px] rounded-[8px] bg-[#163B66] hover:bg-[#2E5A8A] active:bg-[#163B66] text-[#FFFFFF] text-[13px] font-medium tracking-[-0.01em] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5A8A] focus-visible:ring-offset-2"
          >
            <span>
              {isInternal
                ? 'Enter Portal Directly →'
                : gateConfig.submitButtonLabel}
            </span>
          </button>
        </form>
      </section>

      {/* Subtle Footer Attribution */}
      {gateConfig.footerAttribution.trim() !== '' && (
        <footer className="mt-2 text-center font-mono-tabular text-[10px] font-medium tracking-[0.05em] text-[#64748B]">
          {gateConfig.footerAttribution}
        </footer>
      )}
    </main>
  );
};
