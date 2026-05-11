require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());


const cookieParser = require("cookie-parser")
app.use(cookieParser());

const connectDB = require("./config/db");
connectDB();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const notFound = require("./middlewares/notFound");
const errorMiddleware = require("./middlewares/errorMiddleware")



app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.get("/", function(req, res){
    res.json("Server running")
})


app.use(notFound);
app.use(errorMiddleware)


app.listen(process.env.PORT, ()=>{
    console.log("Server started")
})


