const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware")

router.get(
    "/me",
    authMiddleware,
    async function(req, res){
        return res.status(200).json({
            user: req.user
        })
    }
)

module.exports = router