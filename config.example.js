// Example Supabase Configuration File
// Copy this to config.js and fill in your actual values
// 
// GET YOUR KEYS FROM:
// Supabase Dashboard > Project Settings > API

const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'your-anon-key-here'
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}

// If using Supabase JS library:
// import { createClient } from '@supabase/supabase-js'
// export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

