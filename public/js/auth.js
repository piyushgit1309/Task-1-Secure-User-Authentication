/**
 * Authentication Module
 * Handles login, registration, validation, password strength, and toast alerts.
 */
const auth = {
  // Toast Notification System
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><div>${message}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Password Visibility Toggle
  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    } else {
      input.type = 'password';
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }
  },

  // Real-time Password Strength Meter
  checkPasswordStrength(password) {
    const fill = document.getElementById('strength-fill');
    const text = document.getElementById('strength-text');
    if (!fill || !text) return;

    if (!password) {
      fill.style.width = '0%';
      text.innerText = 'Password strength';
      text.style.color = 'var(--text-secondary)';
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      fill.style.width = '25%';
      fill.style.backgroundColor = 'var(--danger)';
      text.innerText = 'Weak (Needs 8+ chars, mix of letters/numbers)';
      text.style.color = 'var(--danger)';
    } else if (score === 2 || score === 3) {
      fill.style.width = '65%';
      fill.style.backgroundColor = 'var(--warning)';
      text.innerText = 'Medium (Good, consider adding symbols)';
      text.style.color = 'var(--warning)';
    } else {
      fill.style.width = '100%';
      fill.style.backgroundColor = 'var(--success)';
      text.innerText = 'Strong (Cryptographically resilient)';
      text.style.color = 'var(--success)';
    }
  },

  // Quick fill helper
  fillForm(type, email, password) {
    if (type === 'login') {
      const emailInput = document.getElementById('login-email');
      const pwInput = document.getElementById('login-password');
      if (emailInput) emailInput.value = email;
      if (pwInput) pwInput.value = password;
      this.showToast(`Autofilled demo credentials for ${email}`, 'info');
    }
  },

  // One-click instant login for evaluators
  async prefillAndLogin(email, password) {
    this.showToast(`Authenticating demo user: ${email}...`, 'info');
    const res = await api.login(email, password);
    if (res.ok && res.data.success) {
      api.setSession(res.data.token, res.data.user);
      this.showToast(res.data.message || 'Authenticated successfully!', 'success');
      app.updateNavigation();
      if (res.data.user.role === 'admin') {
        app.navigate('admin');
      } else {
        app.navigate('dashboard');
      }
    } else {
      this.showToast(res.data.message || 'Login failed', 'error');
    }
  },

  // Form Submit: Login
  async handleLogin(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-login-submit');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      this.showToast('Please provide both email and password.', 'warning');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = '<span>Verifying credentials...</span>';

      const res = await api.login(email, password);

      if (res.ok && res.data.success) {
        api.setSession(res.data.token, res.data.user);
        this.showToast(res.data.message, 'success');
        document.getElementById('login-form').reset();
        app.updateNavigation();
        if (res.data.user.role === 'admin') {
          app.navigate('admin');
        } else {
          app.navigate('dashboard');
        }
      } else {
        this.showToast(res.data.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      this.showToast('An unexpected error occurred during login.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>Sign In</span>';
    }
  },

  // Form Submit: Register
  async handleRegister(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-reg-submit');
    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const role = document.getElementById('reg-role').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-password-confirm').value;

    if (!fullName || !email || !password) {
      this.showToast('Please fill out all required fields.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      this.showToast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 8) {
      this.showToast('Password must be at least 8 characters long.', 'warning');
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = '<span>Creating secure account...</span>';

      const res = await api.register(fullName, email, password, role);

      if (res.ok && res.data.success) {
        api.setSession(res.data.token, res.data.user);
        this.showToast('Account registered successfully! Welcome aboard.', 'success');
        document.getElementById('register-form').reset();
        this.checkPasswordStrength('');
        app.updateNavigation();
        if (res.data.user.role === 'admin') {
          app.navigate('admin');
        } else {
          app.navigate('dashboard');
        }
      } else {
        this.showToast(res.data.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      this.showToast('An error occurred during registration.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>Complete Registration</span>';
    }
  },

  // Logout
  async logout() {
    await api.logout();
    api.clearSession();
    this.showToast('You have been securely signed out.', 'info');
    app.updateNavigation();
    app.navigate('home');
  }
};
