const express = require("express");

const router = express.Router();

const { signup, login,  refreshAccessToken, logout, forgotPassword, resetPassword, verifyEmail, sendOTP, verifyOTP, enableTwoFactor, verifyTwoFactor } = require("../controllers/authController")

const authMiddleware = require("../middlewares/authMiddleware")
const passport = require("passport")


router.post("/signup", signup)
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout)
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post("/verify-email", verifyEmail)
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/enable-2fa", authMiddleware, enableTwoFactor);
router.post("/verify-2fa", authMiddleware, verifyTwoFactor)

const generateToken = require("../utils/generateToken")

router.get("/profile", authMiddleware, function(req, res){
    return res.status(200).json({
        message: "Profile fetched",
        user: req.user
    })
})


router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}))


router.get("/google/callback", 
    passport.authenticate("google", {failureRedirect: "/login"}), 
    async function(req, res){
        const token = generateToken(req.user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        }) 
        return res.status(200).json({
            message: "Google login successful",
            token,
            user: req.user
        })
})




router.get("/github", passport.authenticate("github", {
    scope: ["user:email"]
}))


router.get("/github/callback", 
    passport.authenticate("github", {failureRedirect: "/login"}), 
    async function(req, res){
        const token = generateToken(req.user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        }) 
        return res.status(200).json({
            message: "Github login successful",
            token,
            user: req.user
        })
})




router.get("/discord", passport.authenticate("discord", {
    scope: ["identify", "email"]
}))


router.get("/discord/callback", 
    passport.authenticate("discord", {failureRedirect: "/login"}), 
    async function(req, res){
        const token = generateToken(req.user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        }) 
        return res.status(200).json({
            message: "discord login successful",
            token,
            user: req.user
        })
})




module.exports = router;