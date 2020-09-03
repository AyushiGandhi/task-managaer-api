const express = require('express');
const router = new express.Router();
let multer = require('multer');

const email = require('../Emails/user_account');
const auth = require('../middleware/authentication');
const userModel = require('../Schema/userSchema');





/* ---------------//POST METHOD FOR USERS--------//CREATE NEW USER------------------------------------*/
router.post('/users', async (req, res) => {
  try {
    let newUser = await userModel.create(req.body);
    email.sendWelcomeEmail(newUser.email,newUser.name);
    res.status(200).send(newUser)
  } catch (error) {
    res.status(400).send(error)
  }
});
router.post('/users/login', async (req, res) => {
  try {
    let currentUser = await userModel.LOGINCredentials(req.body.email, req.body.password);
    let token = await currentUser.generateAuthToken();
    res.status(200).send({currentUser, token})
  } catch (error) {
    res.status(400).send('Unable to login')
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.authUser.tokens = req.authUser.tokens.filter(data => data.token !== req.AuthUserToken);
    await req.authUser.save();
    res.send(req.authUser)
  } catch (e) {

  }
});

router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.authUser.tokens = [];
    await req.authUser.save();
    res.send(req.authUser)
  } catch (e) {

  }
});

/* -----------// GET METHOD FOR USERS-----------//DISPLAY USERS---------------------*/
router.get('/users', async (req, res) => {
  try {
    let result = await userModel.find({});
    res.send(result);
  } catch (e) {
    res.status(500).send('Error 500 , Server Side Error ')
  }
});

router.get('/users/myself', auth, async (req, res) => {
  try {
    // let result = await userModel.find({});
    res.send(req.authUser);
  } catch (e) {
    res.status(500).send('Error 500 , Server Side Error ')
  }
});


/*-------------------------//PATCH METHOD FOR USERS--------------------------------------------*/
router.patch('/users/myself', auth, async (req, res) => {
  let updates = Object.keys(req.body);
  let allowedUpdates = ['name', 'email', 'password', 'age'];
  let isValid = updates.every(keys => allowedUpdates.includes(keys));
  if (!isValid) {
    return res.status(400).send('Check The Keys of Object which is used to update')
  }

  try {
    updates.forEach(keys => req.authUser[keys] = req.body[keys]);
    await req.authUser.save();
    res.send(req.authUser)
  } catch (e) {
    res.status(500).send(e)
  }
});

/* -------------------------//DELETE METHOD FOR USERS--------------------------------------------*/
router.delete('/users/myself', auth, async (req, res) => {
  try {
    await req.authUser.remove();
    email.sendCancelationEmail(req.authUser.email,req.authUser.name);
    res.send(req.authUser)
  } catch (e) {
    res.status(400).send(e)
  }
});


/* ---------------// FILE UPLOADS---------------------------*/

let upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    let regEx = /\.(doc|docx|pdf|jpg|jpeg|png)$/;
    if (!file.originalname.match(regEx)) return cb(new Error('File Must be in PDF Format '));
    cb(undefined, true);
  }
});

router.post('/users/myself/profile', auth , upload.single('profile'), async (req, res) => {
  req.authUser.profile = req.file.buffer ;
  await req.authUser.save();
  res.status(200).send(req.authUser)
}, (error, req, res, next) => {
  res.status(400).send({error: 'Error 400 Bad Request !'})
});

router.delete('/users/myself/profile', auth , upload.single('profile'), async (req, res) => {
  req.authUser.profile = undefined ;
  await req.authUser.save();
  res.status(200).send(req.authUser)
}, (error, req, res, next) => {
  res.status(400).send({error: 'Error 400 Bad Request !'})
});

router.get('/users/:id/profile',async (req,res)=>{
  try{
    const currentUser = await userModel.findById( req.params.id );
    if (!currentUser || !currentUser.profile){console.log('User not found')}
    res.set('Content-Type','image/png');
    res.send(currentUser.profile)
  }catch (e) {
    res.status(400).send('Not Working')
  }
});

module.exports = router;
