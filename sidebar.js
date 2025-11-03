// Global sidebar component - accessible from header on all pages
// Handles sidebar toggle, profile modal, and navigation

let sidebarOpen = false;

/**
 * Initialize the global sidebar
 */
function initSidebar() {
  // Make sure we don't initialize multiple times
  if (window.sidebarInitialized) {
    return;
  }
  window.sidebarInitialized = true;

  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('globalSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const profileModal = document.getElementById('profileModal');
  const profileCloseBtn = document.getElementById('profileCloseBtn');

  console.log('Initializing sidebar...', { sidebarToggle, sidebar, sidebarOverlay });

  // Toggle sidebar - attach listener directly
  if (sidebarToggle) {
    // Remove any existing listeners first by cloning
    const toggleClone = sidebarToggle.cloneNode(true);
    if (sidebarToggle.parentNode) {
      sidebarToggle.parentNode.replaceChild(toggleClone, sidebarToggle);
    }
    
    // Now attach listener to the fresh button
    toggleClone.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Toggle button clicked');
      toggleSidebar();
    });
    
    console.log('Toggle button listener attached');
  } else {
    console.warn('sidebarToggle button not found - will retry');
    // Retry after a short delay
    setTimeout(() => {
      const retryToggle = document.getElementById('sidebarToggle');
      if (retryToggle) {
        retryToggle.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Toggle button clicked (retry)');
          toggleSidebar();
        });
        console.log('Toggle button listener attached (retry)');
      }
    }, 200);
  }

  // Close sidebar when clicking overlay
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      closeSidebar();
    });
  }

  // Close sidebar when pressing ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebarOpen) {
      closeSidebar();
    }
  });

  // Close sidebar button
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => {
      closeSidebar();
    });
  }

  // Profile modal handlers
  const profileImage = document.getElementById('profileImage');
  if (profileImage) {
    profileImage.addEventListener('click', () => {
      closeSidebar(); // Close sidebar first
      openProfileModal();
    });
  }

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
      // TODO: Open settings
      console.log('Settings clicked');
      closeSidebar();
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
}

/**
 * Toggle sidebar open/closed
 */
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById('globalSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  console.log('Toggling sidebar', { sidebarOpen, sidebar: !!sidebar, overlay: !!overlay });
  
  if (sidebar && overlay) {
    if (sidebarOpen) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('sidebar-open');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      console.log('Sidebar opened');
    } else {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('sidebar-open');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
      console.log('Sidebar closed');
    }
  } else {
    console.warn('Sidebar or overlay not found', { sidebar: !!sidebar, overlay: !!overlay });
  }
}

/**
 * Close sidebar
 */
function closeSidebar() {
  sidebarOpen = false;
  const sidebar = document.getElementById('globalSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('sidebar-open');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
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
  const userEmailEl = document.getElementById('sidebarUserEmail');
  const userRoleEl = document.getElementById('sidebarUserRole');
  const profileImageEl = document.getElementById('profileImage');

  try {
    const result = await getCurrentUser();
    
    if (result.user && !result.error) {
      if (userEmailEl) {
        userEmailEl.textContent = result.user.email || 'User';
      }
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
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
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
// Note: Sidebar HTML is loaded via fetch, so initialization happens after fetch
// This function will be called from the inline script in each HTML page after fetch completes

// Also try to initialize if sidebar is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Delay to allow fetch to complete
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

