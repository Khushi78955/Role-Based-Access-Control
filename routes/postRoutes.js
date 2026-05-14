const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const Post = require("../models/Post");
 
const {redisClient } = require("../config/redis")


router.post("/create", authMiddleware, async function(req, res){
    try{
        const {title, content} = req.body;
        const post = await Post.create({
            title,
            content,
            user: req.user.id
        })
        
        await redisClient.del("posts");

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
        return res.status(200).json({
            posts
        })
    } catch(err){
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
    
})

router.get("/posts", async function(req, res){
    const cachedPosts = await redisClient.get("posts");
    if(cachedPosts){
        return res.json({
            source: "redis cache",
            posts: JSON.parse(cachedPosts),

        })
    }

    const posts = await Post.find();
    await redisClient.set(
        "posts", 
        JSON.stringify(posts),
        {
            EX: 60
        }
    );

    return res.json({
        source: "mongodb",
        posts
    })

})

router.get("/rate-limit-test", async function(req, res){
    const ip = req.ip;
    const requests = await redisClient.get(ip);
    if(requests>5){
        return res.status(429).json({
            message: "Too many requests"
        })
    }
    await redisClient.set(
        ip,
        Number(requests || 0) + 1,
        {
            EX : 60
        }
    )
    return res.json({
        message: "Request allowed"
    })
})

module.exports = router;