const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUsers, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public or basic authenticated routes
router.route('/profile')
    .get(protect, getProfile);

router.route('/')
    .get(protect, getUsers);

// Admin / specific user routes
router.route('/:id')
    .put(protect, updateProfile)
    .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
