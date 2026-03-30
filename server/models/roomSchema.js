const mongoose = require('mongoose')

const Schema = mongoose.Schema

const roomSchema = new Schema({
    roomName: {
        type: "String",
        required: true
    }
})

module.exports = mongoose.model('room', roomSchema)