const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken.js");
const { signupSchema, loginSchema } = require("../validators/authValidation.js");
const asyncHandler = require("../middlewares/asyncHandler.js")

const ApiError = require("../utils/ApiError.js")



const signup = asyncHandler(async function signup(req, res){
        const { name, email, password } = req.body;

        const result = signupSchema.safeParse(req.body);
        if(!result.success){
            throw new ApiError(400, result.error.issues[0].message)
        }

        const existingUser = await User.findOne({
            email
        })
        if(existingUser){
            throw new ApiError(400, "User already exists")
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
            throw new ApiError(400, result.error.issues[0].message)
        }

        const user = await User.findOne({
            email
        })
        if(!user){
            throw new ApiError(400, "Invalid credentials")
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        )
        if(!isMatch){
            throw new ApiError(400, "Invalid credentials")
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
    