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

/* REQ.AuthorizedUser => { _id: 5f4deeb7ef999345544f03c9,
  name: 'penny',
  email: 'Penny@gmail.com',
  password:
   '$2a$08$1JiW8VON645WkNV/9Sx64O10VzU4PVzFIwLbDLdEvZYELEkZ0sYo6',
  age: 29,
  __v: 14,
  tokens:
   [ { _id: 5f4e46e8e5d799221afd17f2,
       token:'eyJhbGIkpXVCJ9.eyJfaOjE1OTg5NjU0ODB9.5kB7bh53HNocBPlsJE' }]
*/


/* REQ.AuthorizedUserToken => eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjRkZWViN2VmO*/

module.exports = auth;
