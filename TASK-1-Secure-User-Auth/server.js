const path = require('path');
const fs = require('fs');

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

// Normalization middleware for serverless/proxy environments
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '') || '/';
  }
  next();
});

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Request logging (development friendly)
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoints
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Prodigy InfoTech - Secure User Authentication System',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// API Routes - Mounted with and without /api prefix for maximum serverless compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/protected', protectedRoutes);
app.use('/protected', protectedRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Dedicated JSON 404 for unhandled API calls
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl || req.url}' was not found on this server.`
  });
});

// Catch-all route to serve the frontend single-page application for GET requests
app.get('*', (req, res) => {
  const localIndex = path.join(__dirname, 'public', 'index.html');
  const rootIndex = path.join(__dirname, '..', 'public', 'index.html');
  if (fs.existsSync(localIndex)) {
    return res.sendFile(localIndex);
  }
  if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  res.status(404).send('Frontend index.html not found.');
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