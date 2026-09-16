/**
 * Main Application Controller
 * Handles SPA navigation, route protection, dashboard data loading,
 * interactive API route testing, and admin operations.
 */
const app = {
  currentView: 'home',

  init() {
    this.updateNavigation();
    this.verifyCurrentSession();

    // Browser back/forward button handling
    window.addEventListener('popstate', (e) => {
      const view = (e.state && e.state.view) || 'home';
      this.navigate(view, false);
    });

    // Default route
    this.navigate('home', false);
  },

  // Verify stored session with backend
  async verifyCurrentSession() {
    if (api.isAuthenticated()) {
      const res = await api.getMe();
      if (res.ok && res.data.success) {
        api.setSession(api.getToken(), res.data.user);
        this.updateNavigation();
      } else {
        // Token invalid or expired
        api.clearSession();
        this.updateNavigation();
        if (['dashboard', 'admin'].includes(this.currentView)) {
          this.navigate('login');
          auth.showToast('Session expired. Please sign in again.', 'warning');
        }
      }
    }
  },

  // View Navigation & Route Guarding
  navigate(viewName, pushState = true) {
    const user = api.getUser();
    const isAuth = api.isAuthenticated();

    // Route Guard 1: Protect User Dashboard
    if (viewName === 'dashboard' && !isAuth) {
      auth.showToast('Access Denied: Please log in to view the dashboard.', 'warning');
      this.navigate('login');
      return;
    }

    // Route Guard 2: Protect Admin Panel with RBAC
    if (viewName === 'admin') {
      if (!isAuth) {
        auth.showToast('Access Denied: Administrative authentication required.', 'warning');
        this.navigate('login');
        return;
      }
      if (!user || user.role !== 'admin') {
        auth.showToast('Forbidden (403): You do not have Administrator permissions.', 'error');
        this.navigate('dashboard');
        return;
      }
    }

    // If logged in, redirect away from login/register to dashboard
    if (isAuth && (viewName === 'login' || viewName === 'register')) {
      this.navigate('dashboard');
      return;
    }

    // Switch visible view
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
      this.currentView = viewName;
    }

    // Update nav link active states
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    if (pushState) {
      window.history.pushState({ view: viewName }, '', `#${viewName}`);
    }

    // Execute view-specific loaders
    if (viewName === 'dashboard') this.loadDashboardData();
    if (viewName === 'admin') this.loadAdminData();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Update Navbar UI depending on auth state
  updateNavigation() {
    const isAuth = api.isAuthenticated();
    const user = api.getUser();

    const guestNav = document.getElementById('guest-nav-links');
    const userNav = document.getElementById('user-nav-links');
    const adminLink = document.getElementById('admin-nav-link');

    if (isAuth && user) {
      guestNav.classList.add('hidden');
      userNav.classList.remove('hidden');

      document.getElementById('nav-user-avatar').innerText = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
      document.getElementById('nav-user-name').innerText = user.fullName || 'User';
      
      const roleBadge = document.getElementById('nav-user-role');
      roleBadge.innerText = user.role;
      roleBadge.className = `user-role-badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`;

      // Show Admin Panel nav item only for Admin role
      if (user.role === 'admin') {
        adminLink.classList.remove('hidden');
      } else {
        adminLink.classList.add('hidden');
      }
    } else {
      guestNav.classList.remove('hidden');
      userNav.classList.add('hidden');
      adminLink.classList.add('hidden');
    }
  },

  // Populate User Dashboard
  async loadDashboardData() {
    const user = api.getUser();
    if (!user) return;

    document.getElementById('dash-welcome').innerText = `Welcome back, ${user.fullName}!`;
    document.getElementById('dash-email').innerText = user.email;
    document.getElementById('dash-avatar').innerText = user.fullName.charAt(0).toUpperCase();

    document.getElementById('dash-uid').innerText = user.id;
    document.getElementById('dash-name').innerText = user.fullName;
    document.getElementById('dash-email-val').innerText = user.email;
    document.getElementById('dash-created').innerText = new Date(user.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const roleBadge = document.getElementById('dash-role-badge');
    roleBadge.innerText = user.role.toUpperCase();
    roleBadge.className = `badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`;

    document.getElementById('dash-privilege-desc').innerText = user.role === 'admin' 
      ? 'Full Administrative & Management Control' 
      : 'Standard Authenticated Route Access';
  },

  // Interactive Route Tester
  async testRoute(endpoint) {
    const terminalTitle = document.getElementById('terminal-title');
    const terminalBadge = document.getElementById('terminal-badge');
    const terminalOutput = document.getElementById('terminal-output');

    terminalTitle.innerText = `Testing: GET ${endpoint}`;
    terminalBadge.innerText = 'Sending...';
    terminalBadge.style.color = 'var(--warning)';
    terminalBadge.style.backgroundColor = 'var(--warning-light)';
    terminalOutput.innerText = `// Sending authenticated request with Authorization: Bearer <JWT_TOKEN>...`;

    const res = await api.request(endpoint);

    terminalBadge.innerText = `${res.status} ${res.ok ? 'OK' : (res.status === 403 ? 'FORBIDDEN' : 'UNAUTHORIZED')}`;
    if (res.ok) {
      terminalBadge.style.color = 'var(--success)';
      terminalBadge.style.backgroundColor = 'var(--success-light)';
      terminalOutput.style.color = '#34d399';
    } else {
      terminalBadge.style.color = 'var(--danger)';
      terminalBadge.style.backgroundColor = 'var(--danger-light)';
      terminalOutput.style.color = '#f87171';
    }

    terminalOutput.innerText = JSON.stringify(res.data, null, 2);
  },

  // Load Admin Data (RBAC)
  async loadAdminData() {
    const statsRes = await api.getAdminStats();
    if (statsRes.ok && statsRes.data.stats) {
      const s = statsRes.data.stats;
      document.getElementById('stat-total-users').innerText = s.totalUsers;
      document.getElementById('stat-admins').innerText = s.adminCount;
      document.getElementById('stat-members').innerText = s.regularUserCount;
    }

    const usersRes = await api.getAdminUsers();
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    if (usersRes.ok && usersRes.data.users) {
      const users = usersRes.data.users;
      const currentUser = api.getUser();

      if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No users registered in system.</td></tr>`;
        return;
      }

      tableBody.innerHTML = users.map(u => {
        const isMe = currentUser && currentUser.id === u.id;
        const roleBadgeClass = u.role === 'admin' ? 'badge-admin' : 'badge-user';
        const formattedDate = new Date(u.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 10px;">
                <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.85rem;">
                  ${u.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>${u.fullName}</strong>
                  ${isMe ? '<small style="color: #818cf8; margin-left: 6px;">(You)</small>' : ''}
                </div>
              </div>
            </td>
            <td><code>${u.email}</code></td>
            <td><span class="badge ${roleBadgeClass}">${u.role.toUpperCase()}</span></td>
            <td>${formattedDate}</td>
            <td class="text-right">
              ${isMe ? '<span style="color: var(--text-muted); font-size: 0.8rem;">Current Session</span>' : `
                <button class="btn btn-sm btn-outline" style="margin-right: 6px;" onclick="app.toggleUserRole('${u.id}', '${u.role}')">
                  Make ${u.role === 'admin' ? 'User' : 'Admin'}
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="app.deleteUser('${u.id}', '${u.fullName}')">
                  Delete
                </button>
              `}
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Failed to load user directory.</td></tr>`;
    }
  },

  // Toggle user role (Promote / Demote)
  async toggleUserRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = `Are you sure you want to change this user's role to "${newRole}"?`;
    if (!confirm(confirmMsg)) return;

    auth.showToast('Updating user role...', 'info');
    const res = await api.updateUserRole(userId, newRole);
    if (res.ok && res.data.success) {
      auth.showToast(res.data.message, 'success');
      this.loadAdminData();
    } else {
      auth.showToast(res.data.message || 'Failed to update role', 'error');
    }
  },

  // Delete user
  async deleteUser(userId, userName) {
    const confirmMsg = `Are you sure you want to delete user "${userName}"? This action cannot be undone.`;
    if (!confirm(confirmMsg)) return;

    auth.showToast('Deleting user...', 'info');
    const res = await api.deleteUser(userId);
    if (res.ok && res.data.success) {
      auth.showToast(res.data.message, 'success');
      this.loadAdminData();
    } else {
      auth.showToast(res.data.message || 'Failed to delete user', 'error');
    }
  }
};

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
