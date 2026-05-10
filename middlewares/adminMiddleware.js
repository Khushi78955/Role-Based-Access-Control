function adminMiddleware(req, res, next){
    if(req.user.role !== "admin"){
        return res.status(403).json({
            message: "Access Denied, admins only"
        })   
    }
    next();
}

module.exports = adminMiddleware