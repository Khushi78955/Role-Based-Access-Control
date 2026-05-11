const jwt = require("jsonwebtoken");

function generateRefreshToken(user){
    const refreshToken = jwt.sign(
        {
            id: user._id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    )
    return refreshToken
}


module.exports = generateRefreshToken;