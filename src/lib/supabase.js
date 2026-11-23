import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials for SAQR Luxury Perfumes
const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://memdcdugzekutlkqbcgq.supabase.co';
const DEFAULT_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_akIf1P5lzStyyc1XivJF1Q_aZpbimb-';

// Proactively purge any secret keys from browser localStorage to prevent "Forbidden use of secret API key in browser"
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('saqr_supabase_service_key');
  } catch {}
}

const isValidUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.startsWith('https://') || trimmed.startsWith('http://');
};

const isValidKey = (str) => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  // Ensure it's not a secret key which Supabase forbids in browser environments
  if (trimmed.startsWith('sb_secret_') || trimmed.includes('secret')) return false;
  return trimmed.length > 20;
};

const getCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let localUrl = typeof window !== 'undefined' ? localStorage.getItem('saqr_supabase_url') : null;
  let localKey = typeof window !== 'undefined' ? localStorage.getItem('saqr_supabase_key') : null;

  // Sanitize localStorage overrides
  if (localUrl && !isValidUrl(localUrl)) {
    try { localStorage.removeItem('saqr_supabase_url'); } catch {}
    localUrl = null;
  }
  if (localKey && !isValidKey(localKey)) {
    try { localStorage.removeItem('saqr_supabase_key'); } catch {}
    localKey = null;
  }

  const url = (localUrl && isValidUrl(localUrl)) ? localUrl.trim() : (envUrl || DEFAULT_URL);
  const key = (localKey && isValidKey(localKey)) ? localKey.trim() : (envKey || DEFAULT_ANON_KEY);

  return {
    url,
    key,
    isConfigured: Boolean(url && key)
  };
};

export const config = getCredentials();

// Standard publishable client for storefront & admin dashboard
export const supabase = createClient(config.url, config.key);
export const supabaseAdmin = supabase;

// Helper to save custom Supabase keys from UI
export const saveSupabaseConfig = (url, key) => {
  if (isValidUrl(url) && isValidKey(key)) {
    localStorage.setItem('saqr_supabase_url', url.trim());
    localStorage.setItem('saqr_supabase_key', key.trim());
    localStorage.removeItem('saqr_supabase_service_key');
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
