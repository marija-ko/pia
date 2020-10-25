const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

//User Schema

let userSchema = mongoose.Schema({
    name : { type : String, required: true },
    surname: { type : String, required: true },
    username: { type : String, required: true, unique: true },
    password: { type : String, required: true },
    photo: { type : String, default: 'default_profile' },
    birthdate: { type : Date, required: true },
    city: { type : String, required: true },
    country: { type : String, required: true },
    email: { type : String, required: true, unique: true },
    status: { type: String, default: 'pending' },
    lastSeen: { type: Date },
    saltSecret: String
 });
 
 userSchema.plugin(uniqueValidator);

 userSchema.pre('save', function(next)
 {
     bcrypt.genSalt(10, (err, salt) => {
         bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
         });
         if (err) console.log("Error while generating salt");
          else console.log(`Finished with generating salt.`)

     });
 });


module.exports = mongoose.model('User', userSchema, 'users');

//User schema

