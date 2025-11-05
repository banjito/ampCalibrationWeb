// Authentication utilities for AMP Calibration Dashboard
// Uses Supabase Auth for email + 6 digit PIN authentication

/**
 * Get the Supabase client instance
 */
function getSupabaseClient() {
  if (!window.supabaseClient) {
    console.error('Supabase client not initialized. Make sure config.js is loaded.');
    return null;
  }
  return window.supabaseClient;
}

/**
 * Create a user account with a 6 digit PIN (stored as Supabase password)
 * @param {string} email
 * @param {string} pin
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
async function registerWithPin(email, pin) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  if (!/^[0-9]{6}$/.test(pin)) {
    return { success: false, error: 'PIN must be 6 digits' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pin,
      options: {
        emailRedirectTo: `${window.location.origin}/verify.html`
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message || 'Failed to create account' };
  }
}

/**
 * Sign in with email + 6 digit PIN
 * @param {string} email
 * @param {string} pin
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
async function loginWithPin(email, pin) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  if (!/^[0-9]{6}$/.test(pin)) {
    return { success: false, error: 'PIN must be 6 digits' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pin
    });

    if (error) {
      console.error('PIN login error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('PIN login error:', error);
    return { success: false, error: error.message || 'Failed to sign in' };
  }
}

/**
 * Handle email verification from magic link
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
async function handleEmailVerification() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Check if user has a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return { success: false, error: sessionError.message };
    }

    if (!session) {
      return { success: false, error: 'No active session' };
    }

    return { success: true, user: session.user };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, error: error.message || 'Failed to verify email' };
  }
}

/**
 * Get current authenticated user with their profile/role
 * @returns {Promise<{user?: object, profile?: object, role?: string, error?: string}>}
 */
async function getCurrentUser() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: 'Supabase client not initialized' };
  }

  try {
    // Get current session - try multiple times if needed (for session propagation)
    let session = null;
    let sessionError = null;
    
    // Try getting session up to 3 times with small delays
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = await supabase.auth.getSession();
      sessionError = result.error;
      session = result.data?.session;
      
      if (session) {
        break; // Got session, exit loop
      }
      
      // If no session and not last attempt, wait a bit
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    if (sessionError || !session) {
      return { error: 'Not authenticated' };
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // User exists but profile might not be created yet - still return user
      return {
        user: session.user,
        profile: null,
        role: null,
        error: 'Profile not found'
      };
    }

    return {
      user: session.user,
      profile: profile,
      role: profile.role
    };
  } catch (error) {
    console.error('Get user error:', error);
    return { error: error.message || 'Failed to get user' };
  }
}

/**
 * Sign out current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function logout() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }

    // Clear any local storage
    localStorage.removeItem('userRole');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message || 'Failed to logout' };
  }
}

/**
 * Protect a page - redirect to login if not authenticated
 * @param {Function} callback - Optional callback to run if authenticated
 */
async function requireAuth(callback) {
  const result = await getCurrentUser();
  
  // Check if we have a user (even if profile is missing, that's okay)
  if (!result.user || (result.error && result.error !== 'Profile not found')) {
    // Only redirect if we're actually not authenticated
    // Don't redirect if we have a user but profile is missing
    if (!result.user) {
      window.location.href = '/login';
      return null;
    }
  }

  // Authenticated, store role in localStorage for quick access
  if (result.role) {
    localStorage.setItem('userRole', result.role);
  }

  // Run callback if provided
  if (callback && typeof callback === 'function') {
    callback(result);
  }

  return result;
}

/**
 * Check auth state changes (e.g., when user clicks magic link in another tab)
 */
function setupAuthStateListener(callback) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN' && session) {
      // User signed in, reload page or redirect
      if (callback && typeof callback === 'function') {
        callback(session);
      } else {
        window.location.href = '/';
      }
    } else if (event === 'SIGNED_OUT') {
      // User signed out
      localStorage.removeItem('userRole');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  });
}

function userHasAdminBadge(profile, role) {
  const normalizedRole = (role || profile?.role || localStorage.getItem('userRole') || '').toString().toLowerCase();
  if (normalizedRole === 'admin') {
    return true;
  }

  const badges = profile?.badges;
  if (Array.isArray(badges)) {
    return badges.some(badge => typeof badge === 'string' && badge.toLowerCase() === 'admin');
  }

  if (typeof badges === 'string') {
    return badges
      .split(',')
      .map(part => part.trim().toLowerCase())
      .includes('admin');
  }

  return false;
}

