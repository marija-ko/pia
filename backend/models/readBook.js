const mongoose = require('mongoose');

let readBookSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    bookId: {type: mongoose.Schema.Types.ObjectId, ref:"Book", required: true},
    bookTitle: {type: String, required: true},
    bookAuthors: {type: [String], required: true},
    genres: {type: [String], required: true},
    pagesRead: {type: Number, required: true},
    pagesTotal: {type: Number, required: true}
 });



 module.exports = mongoose.model('ReadBook', readBookSchema);
