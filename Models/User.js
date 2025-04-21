const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // For password hashing
let userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        maxLength: 30,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    profilePicture: {
        type: String,
        required: false,  // Optional field for profile picture
    },
    password:{
        type:String,
        required:true
    },
    role: {
        type: String,
        required: true,
        enum: ['Standard User', 'Organizer', 'System Admin'],  // Ensures only valid roles are allowed
        default: 'Standard User',  // Default role is "Standard User"
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Automatically sets the creation timestamp
    },
    resetOtp: {
        type: Number,
    },
    resetOtpExpires: {
        type: Date,
    },

});

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);  // Hash the password before saving
    }
    next();
});

// Method to compare password (for authentication)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);  // Compare entered password with hashed password
};




// Create the User model
const User = mongoose.model('User', userSchema);
// Export the User model
module.exports = User;