const passport = require("passport");
const localStrategy = require('passport-local');
const mongoose = require('mongoose');

var User = mongoose.model('User');

passport.use(
    new localStrategy( { usernameField: 'username' },
    (username, password, done) => {
        User.findOne( {} 
            
        );

    } )
);