const User = require("../models/User.js");
const bcrypt = require("bcrypt");

async function signup(req, res){
    try{
        const { name, email, password } = req.body;

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

    } catch(err){
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}


module.exports = {
    signup
}
    