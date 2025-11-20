// Supabase Configuration
// IMPORTANT: Only use PUBLIC keys here (anon key and URL)
// NEVER put service_role keys in client-side code!
//
// GET YOUR KEYS FROM:
// Supabase Dashboard > Project Settings > API
//
// For production deployments (Netlify, etc.):
// Set these as environment variables:
// - VITE_SUPABASE_URL or SUPABASE_URL
// - VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY

// Get config from environment variables (for Netlify/build servers) or use hardcoded values (for local dev)
const SUPABASE_CONFIG = {
  url: window.VITE_SUPABASE_URL || 
       window.SUPABASE_URL || 
       'https://edcrednhbzpovwxriluc.supabase.co',
  anonKey: window.VITE_SUPABASE_ANON_KEY || 
           window.SUPABASE_ANON_KEY || 
           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY3JlZG5oYnpwb3Z3eHJpbHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjkwMzAsImV4cCI6MjA3NzM0NTAzMH0.uMYJmXrg8yf29laB6eio1iVCSsVDfG17Uz2xvqjoAFA'
};

// Make config available globally
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

// Initialize Supabase client
// Supabase UMD build exposes supabase.createClient globally
function initSupabase() {
  // Validate config first
  if (!window.SUPABASE_CONFIG) {
    console.error('❌ Supabase config not found.');
    return;
  }
  
  if (!window.SUPABASE_CONFIG.url || window.SUPABASE_CONFIG.url === 'YOUR_SUPABASE_PROJECT_URL' || window.SUPABASE_CONFIG.url.includes('your-project-id')) {
    console.error('❌ Invalid Supabase URL. Please set SUPABASE_URL environment variable or update config.js.');
    return;
  }
  
  if (!window.SUPABASE_CONFIG.anonKey || window.SUPABASE_CONFIG.anonKey === 'your-anon-key-here') {
    console.error('❌ Invalid Supabase anon key. Please set SUPABASE_ANON_KEY environment variable or update config.js.');
    return;
  }
  
  // Check if supabase is available (UMD build exposes it globally)
  // The UMD build from jsdelivr exposes it as window.supabase or just supabase
  const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
  
  if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
    console.error('❌ Supabase SDK not loaded. Make sure the Supabase JS SDK script is loaded before config.js');
    return;
  }
  
  try {
    window.supabaseClient = supabaseLib.createClient(
      window.SUPABASE_CONFIG.url,
      window.SUPABASE_CONFIG.anonKey
    );
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
  }
}

// Initialize after scripts have loaded
// Since config.js loads after Supabase script, it should be available
function tryInitSupabase(retries = 5, delay = 100) {
  const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
  
  if (supabaseLib && typeof supabaseLib.createClient === 'function') {
    initSupabase();
  } else if (retries > 0) {
    console.log(`Waiting for Supabase library... (${retries} retries left)`);
    setTimeout(() => tryInitSupabase(retries - 1, delay), delay);
  } else {
    console.error('❌ Supabase library failed to load after multiple retries');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => tryInitSupabase());
} else {
  tryInitSupabase();
}
