const express = require("express");
const router = express.Router()

const adminMiddleware = require("../middlewares/adminMiddleware")
const authMiddleware = require("../middlewares/authMiddleware")

router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    function(req, res){
        return res.status(200).json({
            message: "Welcome admin"
        })
    }
)


module.exports = router;