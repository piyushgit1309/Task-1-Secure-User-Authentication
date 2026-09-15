const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes require authentication and 'admin' role
router.use(verifyToken, requireRole('admin'));

// Admin Dashboard stats
router.get('/stats', adminController.getStats);

// List all registered users
router.get('/users', adminController.getAllUsers);

// Update user role
router.patch('/users/:id/role', adminController.updateUserRole);

// Delete user account
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
