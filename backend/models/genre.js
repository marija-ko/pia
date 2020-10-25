const mongoose = require('mongoose');

let genreSchema = mongoose.Schema({
    name: {type: String, required: true},
 });


 module.exports = mongoose.model('Genre', genreSchema, 'genres');
