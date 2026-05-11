const rateLimiter = require("express-rate-limit");

const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
})

module.exports = limiter;