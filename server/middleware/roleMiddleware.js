const roleMiddleware = (role) => {
  try{
    return (req, res, next) => {
      if (req.user.role !== role) {
        return res.status(403).json({ message: `Access denied : ${role} only` });
      }
      next();
    };
  }catch(err){
    return res.status(500).json({message : "server error while role check" , error : err.message})
  }
};

module.exports = { roleMiddleware };
