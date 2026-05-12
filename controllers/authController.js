const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken.js");
const generateRefreshToken = require("../utils/generateRefreshToken");
const generateResetToken = require("../utils/generateResetToken");
const generateVerificationToken = require("../utils/generateVerificationToken.js");
const generateOTP = require("../utils/generateOTP");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");



const { signupSchema, loginSchema } = require("../validators/authValidation.js");
const asyncHandler = require("../middlewares/asyncHandler.js")
const jwt = require("jsonwebtoken")


const ApiError = require("../utils/ApiError.js");


const signup = asyncHandler(async function signup(req, res){
        const { name, email, password } = req.body;

        const result = signupSchema.safeParse(req.body);
        if(!result.success){
            throw new ApiError(400, result.error.issues[0].message)
        }

        const existingUser = await User.findOne({
            email
        })
        if(existingUser){
            throw new ApiError(400, "User already exists")
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = generateVerificationToken()

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken
        })

        return res.status(201).json({
            message: "Signup successful",
            user
        })  
});


const login = asyncHandler(async function login(req, res){
        const {email, password} = req.body;

        const result = loginSchema.safeParse(req.body);
        if(!result.success){
            throw new ApiError(400, result.error.issues[0].message)
        }

        const user = await User.findOne({
            email
        })
        if(!user){
            throw new ApiError(400, "Invalid credentials")
        }

        if(user.authProvider == "google"){
            throw new ApiError(400, "Please login using google")
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        )
        if(!isMatch){
            throw new ApiError(400, "Invalid credentials")
        }

        if(user.isTwoFactorEnabled){
            return res.status(200).json({
                message: "2FA verification required",
                requiresTwoFactor: true
            })
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user)

        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false
        })

        return res.status(200).json({
            message: "Login successful",
            token
            
        })
});

const verifyLoginTwoFactor = asyncHandler(async function(req, res){
    const {email, token} = req.body;
    const user = await User.findOne({
        email
    })
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token
    });
    if(!verified){
        throw new ApiError(400, "Invalid 2FA token")
    }

    const accessToken = generateToken(user);
    res.cookie("token", accessToken, {
        httpOnly: true,
        secure: false
    })
    return res.status(200).json({
        message: "2FA login successful",
        accessToken
    })



})

const verifyEmail = asyncHandler(async function(req, res){
    const { token } = req.body;

    const user = await User.findOne({
        verificationToken: token
    })
    if(!user){
        throw new ApiError(400, "Invalid verification token")
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    return res.status(200).json({
        message: "Email verified successfully"
    })
})


const sendOTP = asyncHandler(async function(req, res){
    const { email } = req.body;
    const user = await User.findOne({email});
    if(!user){
        throw newApiError(404, "User not found")
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    return res.status(200).json({
        message: "OTP generated successfully"
    })
})

const verifyOTP = asyncHandler(async function(req, res){
    const { email, otp } = req.body;
    const user = await User.findOne({
        email, 
        otp,
        otpExpires: {$gt: Date.now()}
    })
    if(!user){
        throw new ApiError(404, "Invalid or expired OTP");
    }

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();
    return res.status(400).json({
        message: "OTP verified successfully"
    })
})

const refreshAccessToken = asyncHandler(async function(req, res){
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        throw new ApiError(404, "Refresh token missing")
    }
    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
    )

    const user = await User.findById(decoded.id);
    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }

    const newAccessToken = generateToken(user);

    res.cookie("token", newAccessToken, {
        httpOnly: true,
        secure: false
    })

    return res.status(200).json({
        message: "Access token refreshed"
    })

})


const forgotPassword = asyncHandler(async function(req, res){
    const { email } = req.body;

    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(404, "User not found")
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;

    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;        
    await user.save();

    return res.status(200).json({
        message: "Password reset token generated",
        resetToken
    })

})


const resetPassword = asyncHandler(async function(req, res){
    const { token, newPassword } = req.body

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    })
    if(!user){
        throw new ApiError(400, "Invalid or expired token")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).json({
        message: "Password reset successful"
    })

})


const logout = asyncHandler(async function logout(req, res){
        res.clearCookie("token");
        return res.status(200).json({
            message: "Logout successful"
        })
});


const enableTwoFactor = asyncHandler(async function(req, res){
    const user = await User.findById(req.user.id);
    const secret = speakeasy.generateSecret({ name: `RoleBasedAuth (${user.email})` });
    user.twoFactorSecret = secret.base32;
    await user.save();
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    return res.status(200).json({
        message: "2FA setup initiated",
        qrCode
    })

})


const verifyTwoFactor = asyncHandler(async function(req, res){
    const {token} = req.body;
    const user = await User.findById(req.user.id);
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token
    })   
    if(!verified){
        throw new ApiError(400, "Invalid 2FA token")
    } 

    user.isTwoFactorEnabled = true;
    await user.save();
    return res.status(200).json({
        message: "2FA enabled successfully"
    })
})
module.exports = {
    signup,
    login,
    refreshAccessToken,
    logout, 
    forgotPassword,
    resetPassword,
    verifyEmail,
    sendOTP,
    verifyOTP,
    enableTwoFactor,
    verifyTwoFactor,
    verifyLoginTwoFactor
}
    