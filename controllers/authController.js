const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken.js");
const { signupSchema, loginSchema } = require("../validators/authValidation.js");
const asyncHandler = require("../middlewares/asyncHandler.js")



const signup = asyncHandler(async function signup(req, res){
        const { name, email, password } = req.body;

        const result = signupSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message: result.error.issues[0].message
            })
        }

        const existingUser = await User.findOne({
            email
        })
        if(existingUser){
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        return res.status(201).json({
            message: "Signup successful",
            user
        })  
});



const login = asyncHandler(async function login(req, res){
        const {email, password} = req.body;

        const result = loginSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message: result.error.issues[0].message
            })
        }

        const user = await User.findOne({
            email
        })
        if(!user){
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        )
        if(!isMatch){
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        })

        return res.status(200).json({
            message: "Login successful",
            token
            
        })
});


const logout = asyncHandler(async function logout(req, res){
        res.clearCookie("token");
        return res.status(200).json({
            message: "Logout successful"
        })
});

module.exports = {
    signup,
    login,
    logout
}
    