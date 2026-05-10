const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware")
const { signup, login } = require("../controllers/authController")
router.post("/signup", signup)
router.post("/login", login);
router.get("/profile", authMiddleware, function(req, res){
    return res.status(200).json({
        message: "Profile fetched",
        user: req.user
    })
})



module.exports = router;