const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    try{    
        const token = req.headers.authorization.split(" ")[1]; //first word is Bearer
        const decodedToken = jwt.verify(token, "very_very_very_long_key_that_should_be_longer");
        req.userData = { role: decodedToken.role, username: decodedToken.username, userId: decodedToken.userId };
        next();
    }
    catch {
        res.status(401).json({
            message: "Auth failed"
        })
    }


}