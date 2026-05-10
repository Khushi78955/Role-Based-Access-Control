require("dotenv").config();

const express = require("express");
const app = express();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
connectDB()

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", function(req, res){
    res.json("Server running")
})

app.listen(process.env.PORT, ()=>{
    console.log("Server started")
})