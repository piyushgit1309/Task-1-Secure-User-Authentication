const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// General protected route: User Dashboard Overview
router.get('/dashboard', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to your private dashboard! You have successfully accessed a protected route.',
    data: {
      accountType: req.user.role.toUpperCase(),
      sessionStatus: 'Active & Verified',
      loginTimestamp: new Date().toISOString(),
      user: req.user,
      privateVaultAccess: true,
      featuresEnabled: [
        'Secure JWT Session Validation',
        'Bcrypt Password Encryption',
        'Role-Based Authorization',
        'Confidential Data Encryption'
      ]
    }
  });
});

// Protected route: User Settings / Profile Activity
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    profile: {
      id: req.user.id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      memberSince: req.user.createdAt,
      lastLogin: new Date().toISOString()
    }
  });
});

module.exports = router;
