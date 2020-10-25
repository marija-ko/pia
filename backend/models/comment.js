const mongoose = require('mongoose');
var Schema = mongoose.Schema;

let commentSchema = mongoose.Schema({
    userId: {type: String, required: true},
    username: {type: String, required: true},
    bookId: {type: String, required: true},
    body: {type: String,},
    rating: {type: Number, required: true},
    bookTitle: {type: String, required: true},
    bookAuthors: {type: [String], required: true}

 });



 module.exports = mongoose.model('Comment', commentSchema, 'comments');
