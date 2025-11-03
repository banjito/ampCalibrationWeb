// Global sidebar component - Basecoat UI implementation
// Handles sidebar toggle, profile modal, and navigation

/**
 * Initialize Basecoat-style sidebar
 */
function initSidebar() {
  // Make sure we don't initialize multiple times
  if (window.sidebarInitialized) {
    return;
  }
  window.sidebarInitialized = true;

  const sidebar = document.getElementById('globalSidebar');
  if (!sidebar) {
    console.warn('Sidebar not found');
    return;
  }

  // Initialize Lucide icons in the sidebar after it's loaded
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Setup overlay click to close
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeSidebar();
    });
  }

  // Listen for Basecoat sidebar toggle events
  document.addEventListener('basecoat:sidebar', (e) => {
    const { id, action } = e.detail || {};
    
    // If ID specified, only toggle that sidebar
    if (id && sidebar.id !== id) {
      return;
    }

    const isHidden = sidebar.getAttribute('aria-hidden') === 'true';

    if (action === 'open' || (action === undefined && isHidden)) {
      openSidebar();
    } else if (action === 'close' || (action === undefined && !isHidden)) {
      closeSidebar();
    }
  });

  // Close sidebar when pressing ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.getAttribute('aria-hidden') === 'false') {
      closeSidebar();
    }
  });

  // Profile modal handlers
  const profileImage = document.getElementById('profileImage');
  if (profileImage) {
    profileImage.addEventListener('click', () => {
      closeSidebar();
      openProfileModal();
    });
  }

  const profileCloseBtn = document.getElementById('profileCloseBtn');
  if (profileCloseBtn) {
    profileCloseBtn.addEventListener('click', () => {
      closeProfileModal();
    });
  }

  // Close modal when clicking overlay
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeProfileModal();
      }
    });
  }

  // Settings button
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      console.log('Settings clicked');
      // Don't close sidebar - kept open with data-keep-mobile-sidebar-open
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to logout?')) {
        const result = await logout();
        if (result.success) {
          window.location.href = '/login';
        } else {
          alert('Failed to logout: ' + (result.error || 'Unknown error'));
        }
      }
    });
  }

  // Load user data into sidebar
  loadUserData();

  // Dispatch initialized event
  sidebar.dispatchEvent(new CustomEvent('basecoat:initialized'));
  console.log('Sidebar initialized (Basecoat UI)');
}

/**
 * Open sidebar
 */
function openSidebar() {
  const sidebar = document.getElementById('globalSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar) {
    // Prevent body scroll shift by using padding instead of overflow hidden
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    sidebar.setAttribute('aria-hidden', 'false');
    
    // Show overlay
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    
    console.log('Sidebar opened');
  }
}

/**
 * Close sidebar
 */
function closeSidebar() {
  const sidebar = document.getElementById('globalSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar) {
    sidebar.setAttribute('aria-hidden', 'true');
    
    // Restore body scroll and remove padding
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Hide overlay
    if (overlay) {
      overlay.classList.add('hidden');
    }
    
    console.log('Sidebar closed');
  }
}

/**
 * Open profile modal
 */
function openProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadProfileData();
  }
}

/**
 * Close profile modal
 */
function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/**
 * Load user data into sidebar
 */
async function loadUserData() {
  const profileSection = document.getElementById('sidebarProfileSection');
  const loginSection = document.getElementById('sidebarLoginSection');
  const userRoleEl = document.getElementById('sidebarUserRole');
  const profileImageEl = document.querySelector('#profileImage .w-10');

  try {
    const result = await getCurrentUser();
    
    if (result.user && !result.error) {
      // User is logged in - show profile, hide login
      if (profileSection) {
        profileSection.classList.remove('hidden');
      }
      if (loginSection) {
        loginSection.classList.add('hidden');
      }

      // Update role display
      if (userRoleEl && result.role) {
        userRoleEl.textContent = result.role.charAt(0).toUpperCase() + result.role.slice(1);
      }
      
      // Get user initials for profile image placeholder
      if (profileImageEl && result.user.email) {
        const initials = result.user.email
          .split('@')[0]
          .split('.')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        profileImageEl.textContent = initials;
        
        // Also update modal initials
        const modalInitials = document.getElementById('modalUserInitials');
        if (modalInitials) {
          modalInitials.textContent = initials;
        }
      }
    } else {
      // User is not logged in - show login, hide profile
      if (profileSection) {
        profileSection.classList.add('hidden');
      }
      if (loginSection) {
        loginSection.classList.remove('hidden');
      }
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
    // On error, show login button
    if (profileSection) {
      profileSection.classList.add('hidden');
    }
    if (loginSection) {
      loginSection.classList.remove('hidden');
    }
  }
}

/**
 * Load profile data into modal
 */
async function loadProfileData() {
  const modalEmailEl = document.getElementById('modalUserEmail');
  const modalRoleEl = document.getElementById('modalUserRole');

  try {
    const result = await getCurrentUser();
    
    if (result.user && !result.error) {
      if (modalEmailEl) {
        modalEmailEl.textContent = result.user.email || 'User';
      }
      if (modalRoleEl && result.role) {
        modalRoleEl.textContent = result.role.charAt(0).toUpperCase() + result.role.slice(1);
      }
      
      // Update modal initials
      const modalInitials = document.getElementById('modalUserInitials');
      if (modalInitials && result.user.email) {
        const initials = result.user.email
          .split('@')[0]
          .split('.')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        modalInitials.textContent = initials;
      }
    }
  } catch (error) {
    console.error('Failed to load profile data:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (document.getElementById('globalSidebar')) {
        initSidebar();
      }
    }, 100);
  });
} else {
  setTimeout(() => {
    if (document.getElementById('globalSidebar')) {
      initSidebar();
    }
  }, 100);
}
