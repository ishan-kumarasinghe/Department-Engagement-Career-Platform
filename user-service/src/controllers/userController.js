const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-passwordHash -__v');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update allowed fields
            user.name = req.body.name || user.name;
            user.headline = req.body.headline || user.headline;
            user.about = req.body.about || user.about;
            user.profilePicUrl = req.body.profilePicUrl || user.profilePicUrl;
            user.coverPicUrl = req.body.coverPicUrl || user.coverPicUrl;
            user.batchYear = req.body.batchYear || user.batchYear;
            user.graduationYear = req.body.graduationYear || user.graduationYear;

            if (req.body.skills) {
                user.skills = Array.isArray(req.body.skills) ? req.body.skills : [req.body.skills];
            }

            if (req.body.links) {
                user.links = Array.isArray(req.body.links) ? req.body.links : [req.body.links];
            }

            // Password update requires separate logic or check
            if (req.body.password) {
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                user.passwordHash = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                headline: updatedUser.headline,
                // send other necessary fields..
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users (with optional filtering like role)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;

        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$text = { $search: search };
        }

        const users = await User.find(query)
            .select('-passwordHash -__v')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed completely' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getUsers,
    deleteUser
};
