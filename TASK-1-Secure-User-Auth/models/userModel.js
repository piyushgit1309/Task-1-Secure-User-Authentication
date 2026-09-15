const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/config');

// Safe loader for bcryptjs with built-in crypto fallback
let bcrypt = null;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  bcrypt = null;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const DEFAULT_USERS = [
  {
    id: 'usr_admin_001',
    fullName: 'Admin User',
    email: 'admin@prodigy.com',
    password: 'pbkdf2$0edcb40d9f50ee35e36ea5baca41a0d0$9b8c91c722a90a5148518e95e6c525f6764803a75fcb02b3eb0275728b66980d2798baf8891ef4965a154d775f427c9fa9fd21805ca67890bdcbc323f180f025',
    role: 'admin',
    createdAt: '2026-09-11T16:01:38.874Z',
    updatedAt: '2026-09-11T16:01:38.874Z'
  },
  {
    id: 'usr_member_002',
    fullName: 'Demo Member',
    email: 'user@prodigy.com',
    password: 'pbkdf2$7e39385ad48d5b3f845e509dbd0470f1$6b3a8ac7411a9c3d29889cfdf55f3951626fbb0e2f8a5750cca187ff1d4bdd191db182ad732c627f9e3c91174d81d3825763968b2fcbd2c3f8b0f3631f0c667d',
    role: 'user',
    createdAt: '2026-09-11T16:01:38.884Z',
    updatedAt: '2026-09-11T16:01:38.884Z'
  }
];

// Helper to hash password
function hashPassword(plainPassword) {
  if (bcrypt) {
    return bcrypt.hashSync(plainPassword, config.bcryptSaltRounds);
  } else {
    // Fallback using PBKDF2
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(plainPassword, salt, 10000, 64, 'sha512').toString('hex');
    return `pbkdf2$${salt}$${hash}`;
  }
}

// Helper to verify password
function verifyPassword(plainPassword, storedHash) {
  if (bcrypt && !storedHash.startsWith('pbkdf2$')) {
    return bcrypt.compareSync(plainPassword, storedHash);
  }
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    const salt = parts[1];
    const originalHash = parts[2];
    const testHash = crypto.pbkdf2Sync(plainPassword, salt, 10000, 64, 'sha512').toString('hex');
    return testHash === originalHash;
  }
  return false;
}

class UserModel {
  constructor() {
    try {
      this.ensureStorage();
    } catch (error) {
      console.error('User storage unavailable at startup; demo accounts remain available:', error.message);
    }
  }

  ensureStorage() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      this.initDefaultData();
    } else {
      try {
        const raw = fs.readFileSync(USERS_FILE, 'utf8');
        JSON.parse(raw);
      } catch (err) {
        this.initDefaultData();
      }
    }
  }

  initDefaultData() {
    fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_USERS, null, 2), 'utf8');
  }

  getAll() {
    try {
      this.ensureStorage();
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(raw || '[]');
    } catch (error) {
      console.error('User storage unavailable; using demo accounts:', error.message);
      return DEFAULT_USERS.map(user => ({ ...user }));
    }
  }

  saveAll(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  }

  findByEmail(email) {
    if (!email) return null;
    const users = this.getAll();
    return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  findById(id) {
    if (!id) return null;
    const users = this.getAll();
    return users.find(u => u.id === id) || null;
  }

  create({ fullName, email, password, role = 'user' }) {
    const users = this.getAll();
    const normalizedEmail = email.trim().toLowerCase();

    if (this.findByEmail(normalizedEmail)) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashPassword(password),
      role: role === 'admin' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveAll(users);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  updateRole(userId, newRole) {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    users[index].role = newRole === 'admin' ? 'admin' : 'user';
    users[index].updatedAt = new Date().toISOString();
    this.saveAll(users);

    const { password: _, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  }

  delete(userId) {
    const users = this.getAll();
    const filtered = users.filter(u => u.id !== userId);
    if (filtered.length === users.length) return false;

    this.saveAll(filtered);
    return true;
  }

  comparePassword(plainPassword, storedHash) {
    return verifyPassword(plainPassword, storedHash);
  }
}

module.exports = new UserModel();
