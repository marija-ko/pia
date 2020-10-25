const mongoose = require('mongoose');

let eventSchema = mongoose.Schema({
    name: {type: String, required: true},
    start: {type: Date, required: true},
    end: {type: Date},
    caption: {type: String, required: true},
    userId: {type: String, required: true},
    username: {type: String, required: true},
    status: {type: String, required: true},
    participants: {type: [String], required: true}

 });

 module.exports = mongoose.model('Event', eventSchema, 'events');