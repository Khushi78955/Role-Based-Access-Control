require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const connectDB = require("./config/db");
connectDB();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", function(req, res){
    res.json("Server running")
})

app.listen(process.env.PORT, ()=>{
    console.log("Server started")
})