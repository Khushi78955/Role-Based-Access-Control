const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    resetPasswordToken: {
        type: String
    }, 
    resetPasswordExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }, 
    otp: {
        type: String
    }, 
    otpExpires: {
        type: Date
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema)
module.exports = User