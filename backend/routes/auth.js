const express = require('express')
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user');

const checkAuth = require('../middleware/auth-check');

const ctrlCaptcha = require('../controllers/recaptchaController');

const MIME_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpeg'
  }

storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const isValid = MIME_TYPE[file.mimetype];
      let error = new Error("Invalid mime type");
      if(isValid) error = null;
      cb(error, "assets")
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('_');
        const ext = MIME_TYPE[file.mimetype];
        cb(null, name+'_'+Date.now()+'.'+ext);
    }
    
  })

router.post('/register', multer({storage: storage}).single("photo"), (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    var user = new User( {
        name : req.body.name,
        surname : req.body.surname,
        username : req.body.username,
        password : req.body.password,
        birthdate : new Date(req.body.birthdate),
        city : req.body.city,
        country : req.body.country,
        email : req.body.email,
        status: 'pending',
        lastSeen: null
      });
    if(req.file) user.photo = url + "/assets/" + req.file.filename;
    else user.photo = url + "/assets/" + "default_profile.png";
      
    //console.log(`Registering a new user request: ${user.username}.`)
    user.save().then(createdUser => {
        res.status(201).json({
            message: "User added successfully!",
            user:{
                ...createdUser
            }
        })
    
        
    }).catch (error => {
      User.findOne({username: req.body.username}). then((user) =>{
        if(user){
          res.status(500).json({message:`Username is taken`});
        }
      })
      User.findOne({email: req.body.email}). then((user) =>{
        if(user){
          res.status(500).json({message:`Email is taken`});
        }
      })        
        res.status(500).json({message:`Error while registering. Try again.${error}`});
      })
});

router.post('/token_validate', ctrlCaptcha.recaptcha);

router.post('/login', (req, res, next) => {
  let foundUser;
  //console.log(`Searching for username ${req.body.username}`)
    User.findOne({ username: req.body.username, status: {$ne: "pending"} })
      .then( user =>{
      if(!user){
        //console.log("Username not found")
        return res.status(400).json({
          message: "Username not registered"
        })
      }
      //console.log(user)
      foundUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
        if(!result){
          //console.log('Not found')
          return res.status(400).json({
            message: "Incorrect password"
          })
        }
        if(foundUser)
        {const token = jwt.sign({
          username: foundUser.username,
          userId: foundUser._id,
          role: foundUser.status
        },
        'very_very_very_long_key_that_should_be_longer',
        { expiresIn: "1h" });
         return res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: foundUser._id,
          role: foundUser.status,
          username: foundUser.username
        })}
    }).catch(err => {
          //console.log("Error while searching")
          //console.log(err)
    })
})

router.put("/password/:id", checkAuth, (req, res, next) => {
    //console.log('Changing password')
    let foundUser;
    let newPassword;
    let saltSecret;
    User.findById(req.params.id).then(user => {
        foundUser = user;
        return bcrypt.compare(req.body.oldPassword, user.password);
    }).then(result => {
      if(!result){
        return res.status(401).json({
          message: "Incorrect password"
        })
      }
      

        bcrypt.hash(req.body.newPassword, 10).then((hash)=>{
           newPassword = hash;
           User.updateOne(
            { _id: req.params.id},
            {$set:         {password : newPassword},
            }
          ).then(result => {
            if (result.nModified > 0) {
              res.status(200).json({ message: "Update successful!" });
            } else {
              res.status(401).json({ message: "Not authorized to change password!" });
            }
          });
        })
    })   
  }
);

router.get('/username/:username', (req, res, next) => {
  let foundUser;
  //console.log(`Searching for username ${req.params.username}`)
    User.findOne({ username: req.params.username })
      .then( user =>{
      if(!user){
        //console.log("Username not found")
        return res.status(200).json({
          data:{
            ok: true,
            message: "Username not registered"
          }
        })
      }
      else {
        //console.log("Username taken")
        return res.status(200).json({
          data:{
            ok: false,
            message: "Username taken"
          }
        })
      }
    }).catch(err => {
          //console.log("Error while searching")
          //console.log(err)
    })
})

router.get('/email/:email', (req, res, next) => {
  let foundUser;
  //console.log(`Searching for email ${req.params.email}`)
    User.findOne({ email: req.params.email })
      .then( user =>{
      if(!user){
        //console.log("email not found")
        return res.status(200).json({
          data:{
            ok: true,
            message: "email not registered"}
        })
      }
      else {
        //console.log("email taken")
        return res.status(200).json({
          data:{
            ok: false,
            message: "email taken"}
        })
      }
    }).catch(err => {
          //console.log("Error while searching")
          //console.log(err)
    })
})

router.put('/:id', multer({storage: storage}).single("photo"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  let photo = req.body.photo;
  if(req.file) photo = url + "/assets/" + req.file.filename;
  //console.log(req.body.status)

  User.updateOne(
    { _id: req.params.id},
    {$set: {
      name : req.body.name,
      surname : req.body.surname,
      birthdate : new Date(req.body.birthdate),
      city : req.body.city,
      country : req.body.country,
      email : req.body.email,
      lastSeen: req.body.lastSeen,
      status: req.body.status,
      photo:photo
    },
    }).then(result => {
     // console.log(result)
      if (result.nModified > 0) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Not authorized to user!" });
      }
    });

});

module.exports = router;