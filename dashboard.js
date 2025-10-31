// Dashboard logic for AMP Calibration
// Handles sidebar navigation, role-based menu items, and user interactions

// Configuration for external links (to be updated with actual URLs)
const EXTERNAL_LINKS = {
  technician: {
    ampcalOS: 'https://ampcalos.example.com' // Update with actual URL
  },
  customer: {
    vault: 'https://thevault.example.com' // Update with actual URL
  }
};

// Menu configuration based on roles
const MENU_ITEMS = {
  technician: [
    {
      title: 'ampcalOS',
      href: EXTERNAL_LINKS.technician.ampcalOS,
      icon: '⚡',
      external: true
    }
  ],
  customer: [
    {
      title: 'The Vault',
      href: EXTERNAL_LINKS.customer.vault,
      icon: '📦',
      external: true
    }
  ],
  admin: [
    {
      title: 'ampcalOS',
      href: EXTERNAL_LINKS.technician.ampcalOS,
      icon: '⚡',
      external: true
    },
    {
      title: 'The Vault',
      href: EXTERNAL_LINKS.customer.vault,
      icon: '📦',
      external: true
    }
  ]
};

let currentUser = null;
let currentRole = null;

/**
 * Initialize dashboard
 */
async function initDashboard() {
  // Hide loading spinner after a short delay
  setTimeout(() => {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
  }, 500);

  // Check authentication
  const authResult = await requireAuth((userData) => {
    currentUser = userData.user;
    currentRole = userData.role || localStorage.getItem('userRole');
    
    // Update UI with user info
    updateUserInfo(userData);
    
    // Setup menu based on role
    setupMenu(currentRole);
    
    // Setup quick links
    setupQuickLinks(currentRole);
  });

  if (!authResult || authResult.error) {
    // Will be redirected to login by requireAuth
    return;
  }

  // Setup event listeners
  setupEventListeners();
}

/**
 * Update user info in sidebar footer
 */
function updateUserInfo(userData) {
  const userEmailEl = document.getElementById('userEmail');
  const userRoleEl = document.getElementById('userRole');

  if (userEmailEl && userData.user) {
    userEmailEl.textContent = userData.user.email || 'User';
  }

  if (userRoleEl && userData.role) {
    userRoleEl.textContent = `${userData.role}`;
  }
}

/**
 * Setup menu items based on user role
 */
function setupMenu(role) {
  const menuItemsContainer = document.getElementById('menuItems');
  if (!menuItemsContainer) return;

  const items = MENU_ITEMS[role] || MENU_ITEMS.customer;

  if (items.length === 0) {
    menuItemsContainer.innerHTML = `
      <div class="text-white/60 text-sm font-arp-light p-3">
        No menu items available
      </div>
    `;
    return;
  }

  menuItemsContainer.innerHTML = items.map(item => `
    <a
      href="${item.href}"
      ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
      class="sidebar-menu-item group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
    >
      <span class="text-xl">${item.icon || '•'}</span>
      <span class="font-medium font-benzin">${item.title}</span>
      ${item.external ? '<span class="ml-auto text-xs opacity-60">↗</span>' : ''}
    </a>
  `).join('');
}

/**
 * Setup quick links section
 */
function setupQuickLinks(role) {
  const quickLinksContainer = document.getElementById('quickLinks');
  if (!quickLinksContainer) return;

  const items = MENU_ITEMS[role] || MENU_ITEMS.customer;

  if (items.length === 0) {
    quickLinksContainer.innerHTML = `
      <div class="col-span-full text-center text-gray-500 font-arp-light p-6">
        No quick links available
      </div>
    `;
    return;
  }

  quickLinksContainer.innerHTML = items.map(item => `
    <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div class="flex items-center gap-4 mb-4">
        <span class="text-3xl">${item.icon || '•'}</span>
        <h3 class="text-xl font-bold text-gray-900 font-benzin">${item.title}</h3>
      </div>
      <p class="text-gray-600 mb-4 font-arp-light">
        ${role === 'technician' ? 'Access the technician dashboard and tools.' : 'Access your customer portal and projects.'}
      </p>
      <a
        href="${item.href}"
        ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
        class="inline-block border-2 border-green text-green px-6 py-2 rounded-full hover:bg-green hover:text-white transition-colors font-medium font-benzin"
      >
        OPEN ${item.title.toUpperCase()}
      </a>
    </div>
  `).join('');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
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

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle && sidebar && sidebarOverlay) {
    sidebarToggle.addEventListener('click', () => {
      // Toggle sidebar visibility on mobile
      sidebar.classList.toggle('-translate-x-full');
      sidebarOverlay.classList.toggle('hidden');
      document.body.classList.toggle('overflow-hidden');
    });

    sidebarOverlay.addEventListener('click', () => {
      // Hide sidebar when overlay is clicked
      sidebar.classList.add('-translate-x-full');
      sidebarOverlay.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
  }

  // Close sidebar when clicking outside on mobile
  if (window.innerWidth < 768) {
    document.addEventListener('click', (e) => {
      if (sidebar && sidebarToggle) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          if (!sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
          }
        }
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

