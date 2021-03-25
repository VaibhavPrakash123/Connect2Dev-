const jwt = require('jsonwebtoken');
const secret = require('config');

//verify token
module.exports = function(req,res, next){
    
    //get token from header
    const token = req.header('x-auth-token');
    if(!token){
        return res.status(401).json({'msg' : 'Token not available, authentication failed!'});
    }
    //Decode token to match 
    try{
    const decode = jwt.verify(token,secret.get('jwtSecret'));
    req.user = decode.user;

    next();
    }catch(err){
        res.status(401).json({'msg':'Token is not valid'});
    }
    
};
