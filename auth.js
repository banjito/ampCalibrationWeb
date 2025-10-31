// Authentication utilities for AMP Calibration Dashboard
// Uses Supabase Auth for magic link authentication

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
 * Send OTP (PIN code) to user's email
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendOTP(email) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      console.error('OTP error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('OTP error:', error);
    return { success: false, error: error.message || 'Failed to send PIN code' };
  }
}

/**
 * Verify OTP (PIN code) entered by user
 * @param {string} email - User's email address
 * @param {string} token - The 6-digit PIN code
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function verifyOTP(email, token) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    });

    if (error) {
      console.error('OTP verification error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: error.message || 'Failed to verify PIN code' };
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
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
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
      // User exists but profile might not be created yet
      return {
        user: session.user,
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
  
  if (result.error || !result.user) {
    // Not authenticated, redirect to login
    window.location.href = '/login';
    return;
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
        window.location.href = '/dashboard';
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

