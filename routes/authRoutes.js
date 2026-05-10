const express = require("express");

const router = express.Router();

const { signup, login, logout } = require("../controllers/authController")

const authMiddleware = require("../middlewares/authMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware");

router.post("/signup", signup)
router.post("/login", login);
router.post("/logout", logout)
router.get("/profile", authMiddleware, function(req, res){
    return res.status(200).json({
        message: "Profile fetched",
        user: req.user
    })
})


module.exports = router;