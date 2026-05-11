require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());

const helmet = require("helmet");
const limiter = require("./middlewares/rateLimiter");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

app.use(helmet)
app.use(limiter);
app.use(cookieParser());

connectDB();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

const notFound = require("./middlewares/notFound");
const errorMiddleware = require("./middlewares/errorMiddleware");



app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.get("/", function(req, res){
    res.json("Server running")
})


app.use(notFound);
app.use(errorMiddleware)


app.listen(process.env.PORT, ()=>{
    console.log("Server started")
})


