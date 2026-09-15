const path = require('path');

// Verify dependencies are installed
try {
  require('express');
} catch (e) {
  console.error('\n======================================================');
  console.error('ERROR: Required dependencies are missing!');
  console.error('Please run:');
  console.error('   npm install');
  console.error('before starting the server.');
  console.error('======================================================\n');
  process.exit(1);
}

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('./config/config');

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Request logging (development friendly)
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Prodigy InfoTech - Secure User Authentication System',
    timestamp: new Date().toISOString()
  });
});

// Catch-all route to serve the frontend single-page application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;

// Start a local server only when running this file directly.
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`Server running in ${config.nodeEnv} mode at http://localhost:${PORT}`);
  });
}