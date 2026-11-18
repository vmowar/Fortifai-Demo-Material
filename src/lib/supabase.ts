import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://iagdhvrlypymniqmicys.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_1pKywoEaAn1Vjoslyrdw0g_4cP6L8BS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PortalEventType = 'GATE_LOGIN' | 'TAB_VIEW' | 'ROI_SIMULATION';

export interface PortalAccessLogRow {
  id: string | number;
  created_at: string;
  portal: string | null;
  event_type: string;
  full_name: string | null;
  email: string;
  access_code: string | null;
  tab_viewed: string | null;
  user_agent: string | null;
}

export interface PortalEventVisitor {
  name: string;
  email: string;
  accessCode: string;
}

export function isFortifaiEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith('@fortifai.io');
}

/**
 * Silently logs external visitor gate logins and tab views to `public.portal_access_logs`.
 * - Skips inserting rows if email ends with `@fortifai.io` (matches database RLS policy).
 * - Fails silently so network or RLS policies never interrupt executive UX.
 */
export async function logPortalEvent(
  visitor: PortalEventVisitor | null | undefined,
  eventType: PortalEventType,
  tabViewed?: string
): Promise<void> {
  if (!visitor || !visitor.email) {
    return;
  }

  const normalizedEmail = visitor.email.trim().toLowerCase();
  if (isFortifaiEmail(normalizedEmail)) {
    return;
  }

  try {
    await supabase.from('portal_access_logs').insert({
      portal: 'overview',
      event_type: eventType,
      full_name: visitor.name.trim(),
      email: normalizedEmail,
      access_code: visitor.accessCode.trim().toUpperCase(),
      tab_viewed: tabViewed ?? null,
      user_agent:
        typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
  } catch {
    // Fail silently so UX never blocks
  }
}
