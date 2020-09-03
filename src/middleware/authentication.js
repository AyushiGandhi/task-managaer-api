const jsonwt = require('jsonwebtoken');
const userModel = require('../Schema/userSchema');

const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jsonwt.verify(token, process.env.JWT_SECRET_KEY);  //{ _id: '5f4deeb7ef999345544f03c9', iat: 1599019648 }
    const currentUser = await userModel.findOne({_id: decoded._id, 'tokens.token': token});
    if (!currentUser) {
      throw new Error()
    }
    req.authUser = currentUser;
    req.AuthUserToken = token;
    next();
  } catch (e) {
    res.status(401).send('{ Error401 , Please Authenticate , Invalid User Entry }');
  }
};


module.exports = auth;
