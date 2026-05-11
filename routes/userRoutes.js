const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");

router.get("/me", authMiddleware, async function(req, res){
    return res.status(200).json({
        user: req.user
    })
})


router.put("/update-profile", authMiddleware, async function(req, res){
    try{
        const { name, email } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                name, 
                email
            }, 
            {
                new: true
            }
        )
        return res.status(200).json({
            message: "Profile Updated",
            updatedUser
        })
    } catch(err){
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
})


router.delete("/delete-account", authMiddleware, async function(req, res){
    try{
        await User.findByIdAndDelete(req.user.id)
        res.clearCookie("token");
        return res.status(200).json({
            message: "Account deleted permanently"
        })
    } catch(err){
        return res.status(500).json({
            message: "Something went wrong"
        })
    }  
})

module.exports = router;