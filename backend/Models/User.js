const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
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
    otp: String,
    otpExpires: Date,

    isVerified: {
        type: Boolean,
        default: false
    },
});




const User = mongoose.model('User', userSchema);
// Export the User model
module.exports = User;