const express = require("express");

const router = express.Router();

const { signup, login,  refreshAccessToken, logout, forgotPassword, resetPassword, verifyEmail, sendOTP, verifyOTP } = require("../controllers/authController")

const authMiddleware = require("../middlewares/authMiddleware")


router.post("/signup", signup)
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout)
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.post("/verify-email", verifyEmail)
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP)

router.get("/profile", authMiddleware, function(req, res){
    return res.status(200).json({
        message: "Profile fetched",
        user: req.user
    })
})


module.exports = router;