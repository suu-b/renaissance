const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        requried: true
    },
    room: {
        type: String,
        requried: true
    },
    timeStamp: {
        type: String,
        required: true
    }
})

module.exports =  mongoose.model('Message', messageSchema)