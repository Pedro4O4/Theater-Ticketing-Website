const User = require('../Models/User');

class UserController {
    // Get all users - Admin only
     async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password');
            return res.status(200).json({ success: true, data: users });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // Get single user by ID - Admin only
     async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // Update user role - Admin only
     async updateUserRole(req, res) {
        try {
            const { role } = req.body;

            if (!role) {
                return res.status(400).json({ message: "Role is required" });
            }

            // Validate role is one of the allowed types
            const allowedRoles = ['standard', 'organizer', 'admin'];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            const user = await User.findByIdAndUpdate(
                req.params.id,
                { role },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({
                success: true,
                message: "User role updated successfully",
                data: user
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }


}

module.exports = UserController;