const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatUserSchema = new Schema({
    socketID: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    room: {
        type: String,
        requried: true
    }
})

module.exports = mongoose.model('chatUser', chatUserSchema)