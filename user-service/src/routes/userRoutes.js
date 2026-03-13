const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUsers, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public or basic authenticated routes
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

router.route('/')
    .get(protect, getUsers);

// Admin only routes
router.route('/:id')
    .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
