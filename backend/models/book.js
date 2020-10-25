const mongoose = require('mongoose');

let bookSchema = mongoose.Schema({
    name: {type: String, required: true},
    cover: {type: String, default: 'http://localhost:3000/assets/default_cover.png'},
    authors: {type: [String], required: true,
        validate: [authorLimit, '{PATH} can not be empty']},
    published: {type: Date, required: true},
    genres: {type: [String], required: true,
        validate: [genreLimit, '{PATH} exceeds the limit of 3']},
    summary: {type: String, required: true},
    rating: {type: Number, required: true},
    pages: {type: Number, required: true},
    numberOfRatings:{type: Number, required: true},
    sumOfRatings:{type: Number, required: true},
    status: {type: String, default:"pending"}
 });

 function genreLimit(val) {
    return (val.length <= 3 &&  val.length> 0);
  }
  function authorLimit(val) {
    return (val.length> 0);
  }

 module.exports = mongoose.model('Book', bookSchema, 'books');
