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

  // Photo upload handlers
  const changePhotoBtn = document.getElementById('changePhotoBtn');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const photoUploadInput = document.getElementById('photoUploadInput');

  if (changePhotoBtn && photoUploadInput) {
    changePhotoBtn.addEventListener('click', () => {
      photoUploadInput.click();
    });
  }

  if (photoUploadInput) {
    photoUploadInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await uploadProfilePhoto(file);
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to remove your profile photo?')) {
        await removeProfilePhoto();
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
  const profileImageEl = document.getElementById('sidebarAvatar');

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
        
        // Check for existing profile photo
        const photoUrl = await getProfilePhotoUrl(result.user.id);
        if (photoUrl) {
          profileImageEl.innerHTML = `<img src="${photoUrl}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
        } else {
          profileImageEl.textContent = initials;
        }
        
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
      
      // Update modal initials and photo
      const modalInitials = document.getElementById('modalUserInitials');
      const modalPhoto = document.getElementById('modalProfilePhoto');
      const removeBtn = document.getElementById('removePhotoBtn');
      
      if (result.user.email) {
        const initials = result.user.email
          .split('@')[0]
          .split('.')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        if (modalInitials) {
          modalInitials.textContent = initials;
        }
        
        // Check for existing profile photo
        const photoUrl = await getProfilePhotoUrl(result.user.id);
        if (photoUrl && modalPhoto) {
          modalPhoto.innerHTML = `<img src="${photoUrl}" alt="Profile" class="w-full h-full object-cover">`;
          // Show remove button if photo exists
          if (removeBtn) {
            removeBtn.classList.remove('hidden');
          }
        } else if (modalPhoto && modalInitials) {
          modalPhoto.innerHTML = `<span id="modalUserInitials">${initials}</span>`;
          // Hide remove button if no photo
          if (removeBtn) {
            removeBtn.classList.add('hidden');
          }
        }
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

/**
 * Get profile photo URL if it exists
 */
async function getProfilePhotoUrl(userId) {
  try {
    // List files for this user
    const { data: files, error } = await window.supabaseClient.storage
      .from('profile-photo')
      .list('', {
        search: userId
      });

    if (error) throw error;

    // If file exists, return public URL
    if (files && files.length > 0) {
      const fileName = files[0].name;
      const { data: { publicUrl } } = window.supabaseClient.storage
        .from('profile-photo')
        .getPublicUrl(fileName);
      
      return `${publicUrl}?t=${Date.now()}`; // Cache busting
    }

    return null;
  } catch (error) {
    console.error('Error getting profile photo:', error);
    return null;
  }
}

/**
 * Upload profile photo to Supabase storage
 */
async function uploadProfilePhoto(file) {
  const statusEl = document.getElementById('uploadStatus');
  const modalPhoto = document.getElementById('modalProfilePhoto');
  const removeBtn = document.getElementById('removePhotoBtn');
  
  try {
    // Show loading state
    if (statusEl) {
      statusEl.textContent = 'Uploading...';
      statusEl.className = 'text-xs mt-2 text-blue-600';
      statusEl.classList.remove('hidden');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Get current user
    const result = await getCurrentUser();
    if (!result.user) {
      throw new Error('You must be logged in to upload a photo');
    }

    const userId = result.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await window.supabaseClient.storage
      .from('profile-photo')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite existing file
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = window.supabaseClient.storage
      .from('profile-photo')
      .getPublicUrl(filePath);

    // Update profile photo display
    if (modalPhoto) {
      modalPhoto.innerHTML = `<img src="${publicUrl}?t=${Date.now()}" alt="Profile" class="w-full h-full object-cover">`;
    }

    // Update sidebar avatar
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = `<img src="${publicUrl}?t=${Date.now()}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
    }

    // Show remove button
    if (removeBtn) {
      removeBtn.classList.remove('hidden');
    }

    // Show success message
    if (statusEl) {
      statusEl.textContent = 'Photo updated successfully!';
      statusEl.className = 'text-xs mt-2 text-green-600';
      setTimeout(() => {
        statusEl.classList.add('hidden');
      }, 3000);
    }

    console.log('Profile photo uploaded successfully');
  } catch (error) {
    console.error('Error uploading photo:', error);
    if (statusEl) {
      statusEl.textContent = error.message || 'Failed to upload photo';
      statusEl.className = 'text-xs mt-2 text-red-600';
    }
  }
}

/**
 * Remove profile photo from Supabase storage
 */
async function removeProfilePhoto() {
  const statusEl = document.getElementById('uploadStatus');
  const modalPhoto = document.getElementById('modalProfilePhoto');
  const modalInitials = document.getElementById('modalUserInitials');
  const removeBtn = document.getElementById('removePhotoBtn');
  
  try {
    // Show loading state
    if (statusEl) {
      statusEl.textContent = 'Removing...';
      statusEl.className = 'text-xs mt-2 text-blue-600';
      statusEl.classList.remove('hidden');
    }

    // Get current user
    const result = await getCurrentUser();
    if (!result.user) {
      throw new Error('You must be logged in to remove a photo');
    }

    const userId = result.user.id;

    // List all files for this user
    const { data: files, error: listError } = await window.supabaseClient.storage
      .from('profile-photo')
      .list('', {
        search: userId
      });

    if (listError) throw listError;

    // Delete all matching files
    if (files && files.length > 0) {
      const filePaths = files.map(f => f.name);
      const { error: deleteError } = await window.supabaseClient.storage
        .from('profile-photo')
        .remove(filePaths);

      if (deleteError) throw deleteError;
    }

    // Restore initials display
    if (modalPhoto && modalInitials) {
      const initials = modalInitials.textContent;
      modalPhoto.innerHTML = `<span id="modalUserInitials">${initials}</span>`;
    }

    // Restore sidebar avatar
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) {
      const initials = result.user.email
        .split('@')[0]
        .split('.')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      sidebarAvatar.textContent = initials;
    }

    // Hide remove button
    if (removeBtn) {
      removeBtn.classList.add('hidden');
    }

    // Show success message
    if (statusEl) {
      statusEl.textContent = 'Photo removed successfully!';
      statusEl.className = 'text-xs mt-2 text-green-600';
      setTimeout(() => {
        statusEl.classList.add('hidden');
      }, 3000);
    }

    console.log('Profile photo removed successfully');
  } catch (error) {
    console.error('Error removing photo:', error);
    if (statusEl) {
      statusEl.textContent = error.message || 'Failed to remove photo';
      statusEl.className = 'text-xs mt-2 text-red-600';
    }
  }
}
