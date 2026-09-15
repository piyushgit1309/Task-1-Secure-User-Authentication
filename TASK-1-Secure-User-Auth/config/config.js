try {
  require('dotenv').config();
} catch (e) {
  // dotenv not loaded; fallback to environment or defaults
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('JWT_SECRET must be configured in production'); })()
    : 'prodigy_task01_secure_jwt_secret_2026'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  cookieName: process.env.SESSION_COOKIE_NAME || 'prodigy_auth_token',
  bcryptSaltRounds: 10
};
