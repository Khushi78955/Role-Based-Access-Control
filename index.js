require("dotenv").config();

const express = require("express");
const app = express();
const passport = require("passport");
require("./config/passport");
const helmet = require("helmet");
const limiter = require("./middlewares/rateLimiter");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
connectDB();
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const notFound = require("./middlewares/notFound");
const errorMiddleware = require("./middlewares/errorMiddleware");
const session = require("express-session");
const {connectRedis} = require("./config/redis")

app.use(express.json());
app.use(helmet())
app.use(limiter);
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
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


