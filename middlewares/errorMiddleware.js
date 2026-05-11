function errorMiddleware(err, req, res, next){
    const statusCode = err.statusCode || 500
    return res.status(statusCode).json({
        message: err.message || "Internal Server Error"
    })
}

module.exports = errorMiddleware;