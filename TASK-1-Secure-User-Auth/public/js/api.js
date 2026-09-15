/**
 * API Service Wrapper for Prodigy InfoTech Task-01
 * Manages JWT storage, authentication headers, and network calls.
 */
const api = {
  TOKEN_KEY: 'prodigy_auth_token',
  USER_KEY: 'prodigy_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setSession(token, user) {
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
    if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const res = await fetch(endpoint, config);
      const data = await res.json().catch(() => ({}));
      return {
        ok: res.ok,
        status: res.status,
        data
      };
    } catch (err) {
      console.error(`API request error on ${endpoint}:`, err);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Network or server connection failed.' }
      };
    }
  },

  // Auth Endpoints
  async register(fullName, email, password, role) {
    return await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, role })
    });
  },

  async login(email, password) {
    return await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async logout() {
    return await this.request('/api/auth/logout', { method: 'POST' });
  },

  async getMe() {
    return await this.request('/api/auth/me');
  },

  // Protected Routes
  async getDashboardData() {
    return await this.request('/api/protected/dashboard');
  },

  async getProfileData() {
    return await this.request('/api/protected/profile');
  },

  // Admin Routes (RBAC)
  async getAdminStats() {
    return await this.request('/api/admin/stats');
  },

  async getAdminUsers() {
    return await this.request('/api/admin/users');
  },

  async updateUserRole(userId, newRole) {
    return await this.request(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole })
    });
  },

  async deleteUser(userId) {
    return await this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }
};
