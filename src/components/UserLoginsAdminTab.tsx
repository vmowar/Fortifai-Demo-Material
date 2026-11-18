import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import {
  PortalAccessLogRow,
  isFortifaiEmail,
  supabase,
} from '../lib/supabase';

interface UserLoginsAdminTabProps {
  portalSessionEmail: string;
}

type EventFilter = 'ALL' | 'GATE_LOGIN' | 'TAB_VIEW' | 'ROI_SIMULATION';
type AuthMethod = 'password' | 'otp';

function extractEmailDomain(email: string): string {
  const parts = email.trim().toLowerCase().split('@');
  return parts[1] || 'unknown';
}

function formatIstTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return (
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date) + ' IST'
  );
}

function formatUtcTimestampDetailed(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const str = date.toISOString();
  return `${str.slice(0, 10)} ${str.slice(11, 19)} UTC`;
}

function escapeCsvCell(value: string | null | undefined): string {
  const raw = value ?? '';
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export const UserLoginsAdminTab: React.FC<UserLoginsAdminTabProps> = ({
  portalSessionEmail,
}) => {
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Admin verification form state
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [adminEmail, setAdminEmail] = useState<string>(() =>
    isFortifaiEmail(portalSessionEmail) ? portalSessionEmail : ''
  );
  const [password, setPassword] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpToken, setOtpToken] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Audit logs data & filter state
  const [logs, setLogs] = useState<PortalAccessLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [eventFilter, setEventFilter] = useState<EventFilter>('ALL');
  const [accessCodeFilter, setAccessCodeFilter] = useState<string>('ALL');

  const verifiedAdminEmail = useMemo(() => {
    const email = supabaseSession?.user?.email ?? '';
    return isFortifaiEmail(email) ? email.toLowerCase() : null;
  }, [supabaseSession]);

  // Check Supabase Auth session on mount & listen for auth changes
  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const sess = data.session;
      if (sess?.user?.email && !isFortifaiEmail(sess.user.email)) {
        void supabase.auth.signOut();
        setSupabaseSession(null);
      } else {
        setSupabaseSession(sess);
      }
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      if (
        nextSession?.user?.email &&
        !isFortifaiEmail(nextSession.user.email)
      ) {
        void supabase.auth.signOut();
        setSupabaseSession(null);
        setAuthError(
          'Access restricted strictly to authenticated @fortifai.io accounts.'
        );
      } else {
        setSupabaseSession(nextSession);
      }
      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    if (!verifiedAdminEmail) return;
    setLogsLoading(true);
    setLogsError(null);
    try {
      const { data, error } = await supabase
        .from('portal_access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        setLogsError(error.message);
      } else {
        setLogs((data as PortalAccessLogRow[] | null) ?? []);
      }
    } catch (err) {
      setLogsError(
        err instanceof Error
          ? err.message
          : 'Unable to load portal access logs.'
      );
    } finally {
      setLogsLoading(false);
    }
  }, [verifiedAdminEmail]);

  useEffect(() => {
    if (verifiedAdminEmail) {
      void fetchAuditLogs();
    }
  }, [verifiedAdminEmail, fetchAuditLogs]);

  const handlePasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);

    const normalizedEmail = adminEmail.trim().toLowerCase();
    if (!isFortifaiEmail(normalizedEmail)) {
      setAuthError('Please enter a valid @fortifai.io team email address.');
      return;
    }
    if (!password) {
      setAuthError('Please enter your Supabase admin password.');
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setPassword('');
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Authentication failed.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);

    const normalizedEmail = adminEmail.trim().toLowerCase();
    if (!isFortifaiEmail(normalizedEmail)) {
      setAuthError('Please enter a valid @fortifai.io team email address.');
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setOtpSent(true);
        setAuthNotice(
          `One-time verification sent to ${normalizedEmail}. Enter the code below (or click the sign-in link in your inbox).`
        );
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Unable to send one-time email code.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);

    const normalizedEmail = adminEmail.trim().toLowerCase();
    const cleanedToken = otpToken.trim();
    if (!cleanedToken) {
      setAuthError('Please enter the one-time verification code from your email.');
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanedToken,
        type: 'email',
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setOtpToken('');
        setOtpSent(false);
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Invalid verification code.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLockAdminLogs = async () => {
    await supabase.auth.signOut();
    setLogs([]);
  };

  // Compute KPI metrics across external corporate logs
  const kpiSummary = useMemo(() => {
    const externalRows = logs.filter(
      (row) => row.email && !isFortifaiEmail(row.email)
    );
    const gateLoginRows = externalRows.filter(
      (row) => row.event_type === 'GATE_LOGIN'
    );

    const domainCounts = new Map<string, number>();
    const uniqueDomains = new Set<string>();

    for (const row of externalRows) {
      const dom = extractEmailDomain(row.email);
      if (dom && dom !== 'unknown') {
        uniqueDomains.add(dom);
        domainCounts.set(dom, (domainCounts.get(dom) ?? 0) + 1);
      }
    }

    const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const loginsLast7Days = gateLoginRows.filter((row) => {
      const ts = new Date(row.created_at).getTime();
      return Number.isFinite(ts) && ts >= sevenDaysAgoMs;
    }).length;

    let topCompany = '—';
    let topCompanyEvents = 0;
    for (const [dom, count] of domainCounts.entries()) {
      if (count > topCompanyEvents) {
        topCompany = dom;
        topCompanyEvents = count;
      }
    }

    return {
      totalExternalLogins: gateLoginRows.length,
      totalEvents: externalRows.length,
      uniqueCorporateDomains: uniqueDomains.size,
      loginsLast7Days,
      mostActiveCompany: topCompany,
      mostActiveCompanyEvents: topCompanyEvents,
    };
  }, [logs]);

  const availableAccessCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const row of logs) {
      if (row.access_code && row.access_code.trim()) {
        codes.add(row.access_code.trim().toUpperCase());
      }
    }
    return Array.from(codes).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs.filter((row) => {
      if (eventFilter !== 'ALL' && row.event_type !== eventFilter) {
        return false;
      }
      if (
        accessCodeFilter !== 'ALL' &&
        (row.access_code ?? '').trim().toUpperCase() !== accessCodeFilter
      ) {
        return false;
      }
      if (!q) return true;

      const domain = extractEmailDomain(row.email);
      const haystack = `${row.full_name ?? ''} ${row.email} ${domain} ${
        row.access_code ?? ''
      } ${row.tab_viewed ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [logs, searchQuery, eventFilter, accessCodeFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Timestamp (IST)',
      'Timestamp (UTC)',
      'Full Name',
      'Work Email',
      'Company Domain',
      'Access Code',
      'Event Type',
      'Tab Viewed',
      'Portal',
      'User Agent',
    ];

    const csvRows = [
      headers.join(','),
      ...filteredLogs.map((row) =>
        [
          escapeCsvCell(formatIstTimestamp(row.created_at)),
          escapeCsvCell(formatUtcTimestampDetailed(row.created_at)),
          escapeCsvCell(row.full_name),
          escapeCsvCell(row.email),
          escapeCsvCell(extractEmailDomain(row.email)),
          escapeCsvCell(row.access_code),
          escapeCsvCell(row.event_type),
          escapeCsvCell(row.tab_viewed),
          escapeCsvCell(row.portal),
          escapeCsvCell(row.user_agent),
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fortifai-overview-access-logs-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-16 pb-12 flex flex-col items-center justify-center gap-2.5">
        <div className="h-6 w-6 rounded-full border-2 border-[#2E5A8A] border-t-transparent animate-spin" />
        <span className="font-mono-tabular text-[11px] font-medium tracking-[0.05em] text-[#2E5A8A]">
          VERIFYING @FORTIFAI.IO ADMIN SESSION…
        </span>
      </div>
    );
  }

  // UNVERIFIED SUPABASE AUTH STATE — Render Daylight Editorial Admin Verification Card
  if (!verifiedAdminEmail) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-10 pb-14 flex items-center justify-center">
        <section
          aria-labelledby="admin-verify-heading"
          className="w-full max-w-[480px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-8 fortifai-card-shadow space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 fortifai-pill uppercase">
              <Lock className="w-3.5 h-3.5 text-[#2E5A8A]" />
              <span>INTERNAL RLS ENCLAVE</span>
            </span>
            <span className="font-mono-tabular text-[10.5px] font-medium text-[#64748B]">
              @FORTIFAI.IO ONLY
            </span>
          </div>

          <div>
            <h1
              id="admin-verify-heading"
              className="text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-[#163B66]"
            >
              Admin Verification Required
            </h1>
            <p className="mt-1.5 text-[14px] leading-[1.55] text-[#4B5B6E]">
              Sign in with your <span className="font-mono-tabular text-[#163B66]">@fortifai.io</span> credentials to decrypt partner access logs.
            </p>
          </div>

          {/* Auth Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 rounded-[9px] bg-[#F8FAFC] border border-[#E5E7EB] p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setAuthError(null);
                setAuthNotice(null);
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-[7px] py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-[#FFFFFF] text-[#163B66] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(13,21,32,0.04)]'
                  : 'text-[#4B5B6E] hover:text-[#163B66]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#2E5A8A]" />
              <span>Password Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setAuthError(null);
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-[7px] py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer ${
                authMethod === 'otp'
                  ? 'bg-[#FFFFFF] text-[#163B66] border border-[#E5E7EB] shadow-[0_1px_2px_rgba(13,21,32,0.04)]'
                  : 'text-[#4B5B6E] hover:text-[#163B66]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#2E5A8A]" />
              <span>One-Time Email Code</span>
            </button>
          </div>

          {authError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[10px] bg-[#FDECEC] border border-[#F3C5C5] px-3 py-2 text-[12.5px] leading-[1.45] text-[#8B1A1A]"
            >
              <AlertCircle className="w-4 h-4 text-[#8B1A1A] shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authNotice && (
            <div className="flex items-start gap-2 rounded-[10px] bg-[#E8F0F8] border border-[#6699CC]/40 px-3 py-2 text-[12.5px] leading-[1.45] text-[#163B66]">
              <CheckCircle2 className="w-4 h-4 text-[#2E5A8A] shrink-0 mt-0.5" />
              <span>{authNotice}</span>
            </div>
          )}

          {authMethod === 'password' ? (
            <form onSubmit={handlePasswordSignIn} className="space-y-3">
              <div>
                <label
                  htmlFor="admin-auth-email"
                  className="block text-[12px] font-medium text-[#163B66] mb-1"
                >
                  Fortifai Team Email
                </label>
                <input
                  id="admin-auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@fortifai.io"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-[#FFFFFF] px-3 text-[13.5px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-auth-password"
                  className="block text-[12px] font-medium text-[#163B66] mb-1"
                >
                  Password
                </label>
                <input
                  id="admin-auth-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-[#FFFFFF] px-3 text-[13.5px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-[40px] rounded-[10px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] text-[13.5px] font-medium transition-colors cursor-pointer disabled:opacity-60"
              >
                {authLoading ? 'Verifying Credentials…' : 'Decrypt Partner Access Logs →'}
              </button>
            </form>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label
                  htmlFor="admin-otp-email"
                  className="block text-[12px] font-medium text-[#163B66] mb-1"
                >
                  Fortifai Team Email
                </label>
                <input
                  id="admin-otp-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@fortifai.io"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-[#FFFFFF] px-3 text-[13.5px] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-[40px] rounded-[10px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] text-[13.5px] font-medium transition-colors cursor-pointer disabled:opacity-60"
              >
                {authLoading ? 'Sending One-Time Code…' : 'Send One-Time Email Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <label
                  htmlFor="admin-otp-token"
                  className="block text-[12px] font-medium text-[#163B66] mb-1"
                >
                  One-Time Verification Code
                </label>
                <input
                  id="admin-otp-token"
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="w-full h-[38px] rounded-[8px] border border-[#D1D5DB] bg-[#FFFFFF] px-3 font-mono-tabular text-[14px] tracking-[0.12em] text-[#0D1520] focus:outline-none focus:border-[#2E5A8A] focus:ring-2 focus:ring-[#2E5A8A]/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpToken('');
                    setAuthNotice(null);
                  }}
                  className="h-[40px] rounded-[10px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E5E7EB] px-3.5 text-[13px] font-medium text-[#4B5B6E] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex-1 h-[40px] rounded-[10px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] text-[13.5px] font-medium transition-colors cursor-pointer disabled:opacity-60"
                >
                  {authLoading ? 'Verifying Code…' : 'Verify & Unlock Logs →'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    );
  }

  // VERIFIED SUPABASE @FORTIFAI.IO ADMIN DASHBOARD
  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-4 pb-10 space-y-4">
      {/* Header & Utility Actions */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[5px] px-2 py-0.5 fortifai-pill uppercase">
              <ShieldCheck className="w-3 h-3 text-[#2E5A8A]" />
              <span>RLS DECRYPTED · {verifiedAdminEmail}</span>
            </span>
            <span className="font-mono-tabular text-[10px] font-medium text-[#64748B]">
              · PUBLIC.PORTAL_ACCESS_LOGS (LATEST 500)
            </span>
          </div>
          <h1 className="text-[21px] sm:text-[22px] font-medium leading-[1.2] tracking-[-0.02em] text-[#163B66]">
            Partner &amp; Executive Access Logs
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => void fetchAuditLogs()}
            disabled={logsLoading}
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1.5 text-[12px] font-medium text-[#163B66] transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#2E5A8A] ${
                logsLoading ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-[#163B66] hover:bg-[#2E5A8A] text-[#FFFFFF] px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => void handleLockAdminLogs()}
            className="inline-flex items-center gap-1 rounded-[7px] bg-transparent hover:bg-[#E8F0F8]/60 border border-transparent hover:border-[#E5E7EB] px-2 py-1.5 text-[11.5px] font-medium text-[#4B5B6E] hover:text-[#163B66] transition-colors cursor-pointer"
            title="Sign out of Supabase RLS session"
          >
            <Lock className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Lock</span>
          </button>
        </div>
      </section>

      {/* 4 Crisp White KPI Summary Cards */}
      <section
        aria-label="Portal Access Summary Metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] fortifai-card-shadow px-4 py-3 flex flex-col justify-between">
          <span className="font-mono-tabular text-[10px] font-medium tracking-[0.04em] text-[#2E5A8A] uppercase">
            TOTAL EXTERNAL LOGINS
          </span>
          <span className="mt-1.5 font-mono-tabular text-[22px] font-medium leading-none tracking-[-0.03em] text-[#163B66]">
            {kpiSummary.totalExternalLogins}
          </span>
          <span className="mt-1 text-[11.5px] text-[#4B5B6E]">
            {kpiSummary.totalEvents} total tracked events
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] fortifai-card-shadow px-4 py-3 flex flex-col justify-between">
          <span className="font-mono-tabular text-[10px] font-medium tracking-[0.04em] text-[#2E5A8A] uppercase">
            UNIQUE CORPORATE DOMAINS
          </span>
          <span className="mt-1.5 font-mono-tabular text-[22px] font-medium leading-none tracking-[-0.03em] text-[#163B66]">
            {kpiSummary.uniqueCorporateDomains}
          </span>
          <span className="mt-1 text-[11.5px] text-[#4B5B6E]">
            Distinct external organizations
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] fortifai-card-shadow px-4 py-3 flex flex-col justify-between">
          <span className="font-mono-tabular text-[10px] font-medium tracking-[0.04em] text-[#2E5A8A] uppercase">
            LOGINS (LAST 7 DAYS)
          </span>
          <span className="mt-1.5 font-mono-tabular text-[22px] font-medium leading-none tracking-[-0.03em] text-[#163B66]">
            {kpiSummary.loginsLast7Days}
          </span>
          <span className="mt-1 text-[11.5px] text-[#4B5B6E]">
            Rolling 7-day gate unlocks
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] fortifai-card-shadow px-4 py-3 flex flex-col justify-between">
          <span className="font-mono-tabular text-[10px] font-medium tracking-[0.04em] text-[#2E5A8A] uppercase">
            MOST ACTIVE COMPANY
          </span>
          <span
            title={kpiSummary.mostActiveCompany}
            className="mt-1.5 font-mono-tabular text-[17px] font-medium leading-[1.2] tracking-[-0.02em] text-[#163B66] truncate"
          >
            {kpiSummary.mostActiveCompany}
          </span>
          <span className="mt-1 text-[11.5px] text-[#4B5B6E]">
            {kpiSummary.mostActiveCompanyEvents > 0
              ? `${kpiSummary.mostActiveCompanyEvents} recorded events`
              : 'Awaiting external activity'}
          </span>
        </div>
      </section>

      {logsError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] bg-[#FDECEC] border border-[#F3C5C5] px-3.5 py-2.5 text-[12px] text-[#8B1A1A]"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{logsError}</span>
        </div>
      )}

      {/* Searchable, Filterable Audit Table Card */}
      <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] fortifai-card-shadow overflow-hidden">
        {/* Filter Bar */}
        <div className="px-4 py-3 border-b border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-[400px]">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email, full name, or company domain…"
              className="w-full h-[34px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] pl-8 pr-3 text-[12.5px] text-[#0D1520] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2E5A8A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Event Type Segmented Pills */}
            <div className="inline-flex items-center rounded-[7px] bg-[#F8FAFC] border border-[#E5E7EB] p-0.5">
              {(
                [
                  { id: 'ALL', label: 'All' },
                  { id: 'GATE_LOGIN', label: 'Gate Logins' },
                  { id: 'TAB_VIEW', label: 'Tab Views' },
                  { id: 'ROI_SIMULATION', label: 'ROI Copies' },
                ] as const
              ).map((pill) => {
                const active = eventFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setEventFilter(pill.id)}
                    className={`px-2 py-0.5 rounded-[5px] text-[11.5px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#163B66] text-[#FFFFFF]'
                        : 'text-[#4B5B6E] hover:text-[#163B66]'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Access Code Filter */}
            <select
              aria-label="Filter by Partner Access Code"
              value={accessCodeFilter}
              onChange={(e) => setAccessCodeFilter(e.target.value)}
              className="h-[32px] rounded-[7px] border border-[#D1D5DB] bg-[#FFFFFF] px-2 font-mono-tabular text-[11.5px] font-medium text-[#163B66] focus:outline-none focus:border-[#2E5A8A] cursor-pointer"
            >
              <option value="ALL">All Access Codes</option>
              {availableAccessCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            <span className="font-mono-tabular text-[10.5px] font-medium text-[#64748B]">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'ROW' : 'ROWS'}
            </span>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto fortifai-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] font-mono-tabular text-[10px] font-medium tracking-[0.04em] text-[#2E5A8A] uppercase">
                <th className="py-2.5 px-3.5 whitespace-nowrap">Timestamp (IST &amp; UTC)</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Full Name</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Work Email</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Company Domain</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Access Code</th>
                <th className="py-2.5 px-3.5 whitespace-nowrap">Event / Tab Viewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[12px]">
              {logsLoading && logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 px-4 text-center font-mono-tabular text-[11px] text-[#64748B]"
                  >
                    LOADING PORTAL ACCESS LOGS…
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 px-4 text-center text-[12.5px] text-[#64748B]"
                  >
                    No matching access log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((row) => {
                  const domain = extractEmailDomain(row.email);
                  const isGateLogin = row.event_type === 'GATE_LOGIN';
                  return (
                    <tr
                      key={String(row.id)}
                      className="hover:bg-[#F8FAFC]/80 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="font-mono-tabular text-[11.5px] font-medium text-[#163B66]">
                          {formatIstTimestamp(row.created_at)}
                        </div>
                        <div className="font-mono-tabular text-[10px] text-[#64748B]">
                          {formatUtcTimestampDetailed(row.created_at)}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5 font-medium text-[#163B66] whitespace-nowrap">
                        {row.full_name || '—'}
                      </td>

                      <td className="py-2.5 px-3.5 font-mono-tabular text-[11.5px] text-[#4B5B6E] whitespace-nowrap">
                        {row.email}
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="inline-block rounded-[5px] px-2 py-0.5 fortifai-pill">
                          {domain}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="inline-block rounded-[5px] bg-[#F8FAFC] border border-[#E5E7EB] px-1.5 py-0.5 font-mono-tabular text-[10.5px] font-medium text-[#163B66]">
                          {row.access_code || '—'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {isGateLogin ? (
                          <span className="inline-flex items-center gap-1 rounded-[5px] bg-[#163B66] text-[#FFFFFF] px-2 py-0.5 font-mono-tabular text-[10px] font-medium">
                            GATE_LOGIN
                          </span>
                        ) : row.event_type === 'ROI_SIMULATION' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block rounded-[5px] bg-[#2E5A8A] text-[#FFFFFF] px-1.5 py-0.5 font-mono-tabular text-[10px] font-medium">
                              ROI_SIMULATION
                            </span>
                            {row.tab_viewed && (
                              <span className="text-[11.5px] text-[#4B5B6E]">
                                {row.tab_viewed}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block rounded-[5px] px-1.5 py-0.5 fortifai-pill">
                              {row.event_type || 'TAB_VIEW'}
                            </span>
                            {row.tab_viewed && (
                              <span className="text-[11.5px] text-[#4B5B6E]">
                                {row.tab_viewed}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
