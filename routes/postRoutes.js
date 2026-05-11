const express = require("express");

const router = express.router();

const authMiddleware = require("../middlewares/authMiddleware");

const Post = require("../models/Post");


router.post("/create", authMiddleware, async function(req, res){
    try{
        const {title, content} = req.body;
        const post = await Post.create({
            title,
            content,
            user: req.user.id
        })
        return res.status(201).json({
            message: "Post created",
            post
        })
    } catch(err){
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
})


router.get("/all", async function(req, res){
    try{
        const posts = await Post.find().populate("user", "name email avatar");
        return res.status(200).json({
            posts
        })
    } catch(err){
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
    
})

router.get("/my-posts", authMiddleware, async function(req, res){
    try{
        const posts = await Post.find({
            user: req.user.id
        });
        return res.status(200).json([
            posts
        ])
    } catch(err){
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
    
})



module.exports = router;