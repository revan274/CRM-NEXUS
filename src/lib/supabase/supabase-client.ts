/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let browserClientInstance: SupabaseClient | null = null;

/**
 * Public browser-safe Supabase client using Anon Key.
 * NEVER uses service_role key.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  if (!browserClientInstance) {
    browserClientInstance = createClient(supabaseUrl, anonKey);
  }

  return browserClientInstance;
}
