import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials for SAQR Luxury Perfumes
const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://memdcdugzekutlkqbcgq.supabase.co';
const DEFAULT_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_akIf1P5lzStyyc1XivJF1Q_aZpbimb-';
const DEFAULT_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

const isValidUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.startsWith('https://') || trimmed.startsWith('http://');
};

const isValidKey = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.trim().length > 20;
};

const getCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const envServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

  let localUrl = typeof window !== 'undefined' ? localStorage.getItem('saqr_supabase_url') : null;
  let localKey = typeof window !== 'undefined' ? localStorage.getItem('saqr_supabase_key') : null;
  let localServiceKey = typeof window !== 'undefined' ? localStorage.getItem('saqr_supabase_service_key') : null;

  // Sanitize localStorage overrides: if corrupt or malformed, purge them to avoid breaking the app
  if (localUrl && !isValidUrl(localUrl)) {
    try { localStorage.removeItem('saqr_supabase_url'); } catch {}
    localUrl = null;
  }
  if (localKey && !isValidKey(localKey)) {
    try { localStorage.removeItem('saqr_supabase_key'); } catch {}
    localKey = null;
  }
  if (localServiceKey && !isValidKey(localServiceKey)) {
    try { localStorage.removeItem('saqr_supabase_service_key'); } catch {}
    localServiceKey = null;
  }

  const url = (localUrl && isValidUrl(localUrl)) ? localUrl.trim() : (envUrl || DEFAULT_URL);
  const key = (localKey && isValidKey(localKey)) ? localKey.trim() : (envKey || DEFAULT_ANON_KEY);
  const serviceKey = (localServiceKey && isValidKey(localServiceKey)) ? localServiceKey.trim() : (envServiceKey || DEFAULT_SERVICE_KEY);

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

// Admin client for the dashboard (bypasses RLS smoothly for full administration)
export const supabaseAdmin = config.serviceKey
  ? createClient(config.url, config.serviceKey)
  : supabase;

// Helper to save custom Supabase keys from UI
export const saveSupabaseConfig = (url, key, serviceKey = '') => {
  if (isValidUrl(url) && isValidKey(key)) {
    localStorage.setItem('saqr_supabase_url', url.trim());
    localStorage.setItem('saqr_supabase_key', key.trim());
    if (isValidKey(serviceKey)) {
      localStorage.setItem('saqr_supabase_service_key', serviceKey.trim());
    } else {
      localStorage.removeItem('saqr_supabase_service_key');
    }
    window.location.reload();
  }
};

// Helper to reset back to default official configuration
export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('saqr_supabase_url');
    localStorage.removeItem('saqr_supabase_key');
    localStorage.removeItem('saqr_supabase_service_key');
    window.location.reload();
  }
};
