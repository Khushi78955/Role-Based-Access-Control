const ApiError = require("../utils/ApiError");

function notFound(req, res, next){
    next(
        ApiError(404, `Route not found - ${req.originalUrl}`)
    )
}

module.exports = notFound;