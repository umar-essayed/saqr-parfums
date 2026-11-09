import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials (use environment variables or settings in dashboard)
const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://memdcdugzekutlkqbcgq.supabase.co';
const DEFAULT_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_akIf1P5lzStyyc1XivJF1Q_aZpbimb-';
const DEFAULT_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

const getCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const envServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('saqr_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('saqr_supabase_key') : null;
  const localServiceKey = typeof window !== 'undefined' ? localStorage.getItem('saqr_supabase_service_key') : null;

  const url = localUrl || envUrl || DEFAULT_URL;
  const key = localKey || envKey || DEFAULT_ANON_KEY;
  const serviceKey = localServiceKey || envServiceKey || DEFAULT_SERVICE_KEY;

  return {
    url,
    key,
    serviceKey,
    isConfigured: Boolean(url && key)
  };
};

export const config = getCredentials();

// Public client for the storefront
export const supabase = createClient(config.url, config.key);

// Admin client for the dashboard (bypasses RLS smoothly)
export const supabaseAdmin = config.serviceKey
  ? createClient(config.url, config.serviceKey)
  : supabase;

// Helper to save Supabase keys dynamically from UI if ever needed
export const saveSupabaseConfig = (url, key, serviceKey = '') => {
  if (url && key) {
    localStorage.setItem('saqr_supabase_url', url.trim());
    localStorage.setItem('saqr_supabase_key', key.trim());
    if (serviceKey) {
      localStorage.setItem('saqr_supabase_service_key', serviceKey.trim());
    }
    window.location.reload();
  }
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('saqr_supabase_url');
  localStorage.removeItem('saqr_supabase_key');
  localStorage.removeItem('saqr_supabase_service_key');
  window.location.reload();
};
