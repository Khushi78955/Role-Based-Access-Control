const jwt = require("jsonwebtoken");

function generateToken(user){
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    )
    return token
}


module.exports = generateToken;