const mongoose = require('mongoose');

let eventCommentEventSchema = mongoose.Schema({
    userId: {type: String, required: true},
    username: {type: String, required: true},
    eventId: {type: String, required: true},
    body: {type: String, required: true},
 });



 module.exports = mongoose.model('EventComment', eventCommentEventSchema);