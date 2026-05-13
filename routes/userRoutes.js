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


router.post("/upload-avatar", authMiddleware, adminMiddleware, upload.single("avatar"), async function(req, res){
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        const search = req.query.search || "";
        const totalUsers = await User.countDocuments({
            name:{
                $regex: search,
                $options: "i"
            }
        });
        const totalPages = Math.ceil(totalUsers / limit);

        

        const users = await User.find({
            name: {
                $regex: search,
                $options: "i"
            }
        })
        .skip(skip)
        .limit(limit)

        return res.status(200).json({
            currentPage: page,
            totalPages,
            totalUsers,
            users
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
        res.clearCookie("refreshToken");
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