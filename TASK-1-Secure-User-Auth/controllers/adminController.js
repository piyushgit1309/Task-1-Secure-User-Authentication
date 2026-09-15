const userModel = require('../models/userModel');

// Get System & User Statistics (Protected Admin Route)
exports.getStats = (req, res) => {
  try {
    const users = userModel.getAll();
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const regularUserCount = users.filter(u => u.role === 'user').length;

    const safeRecent = users
      .slice(-5)
      .reverse()
      .map(({ password, ...u }) => u);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        adminCount,
        regularUserCount,
        recentRegistrations: safeRecent
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin stats.'
    });
  }
};

// Get All Users (Protected Admin Route)
exports.getAllUsers = (req, res) => {
  try {
    const users = userModel.getAll();
    const safeUsers = users.map(({ password, ...u }) => u);

    return res.status(200).json({
      success: true,
      count: safeUsers.length,
      users: safeUsers
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users list.'
    });
  }
};

// Update User Role (Protected Admin Route)
exports.updateUserRole = (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be "user" or "admin".'
      });
    }

    // Safety check: Prevent modifying self
    if (req.user.id === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote your own admin account.'
      });
    }

    const updatedUser = userModel.updateRole(id, role);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `User role successfully updated to "${role}".`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.'
    });
  }
};

// Delete User (Protected Admin Route)
exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    // Safety check: Prevent deleting self
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account while logged in.'
      });
    }

    const deleted = userModel.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User successfully removed from system.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.'
    });
  }
};
