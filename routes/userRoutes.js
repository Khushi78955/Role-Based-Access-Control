const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");
const upload = require("../middlewares/uploadMiddleware");
const cloudinary = require("../config/cloudinary");
const adminMiddleware = require("../middlewares/adminMiddleware");

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


router.post("/upload-avatar", authMiddleware, async function(req, res){
    try{
        const result = await cloudinary.uploader.upload(req.file.path);
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                avatar: result.secure_url
            },
            {
                new: true
            }
        )
        
        return res.status(200).json({
            message: "Avatar uploaded successfully",
            avatar: updatedUser.avatar
        })
    } catch(err){
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
    
})


router.get("/all-users", authMiddleware, adminMiddleware, async function(req, res){
    try{
        const users = await User.find();
        return res.status(200).json({
            users
        })
    } catch(err){
        message: "Something went wrong"
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