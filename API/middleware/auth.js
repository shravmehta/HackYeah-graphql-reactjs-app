const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]; //spliting the bearer keyword
    if(!token || token ==''){
        req.isAuth = false;
        return next();
    }
    let decode;
    try{
        decode = jwt.verify(token, 'secretkey');
    }catch(err){
        req.isAuth = false;
        return next();
    }
    if(!decode){
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decode.userId;
    next();
}