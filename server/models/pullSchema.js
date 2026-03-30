const mongoose = require('mongoose')

const pullSchema = mongoose.Schema({
    projectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contributerName: {
        type: String,
        required: true
    },
    contributerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    updatedChapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: true
    },
    message: {
        type: String,
        default: "No message provided",
        required: false
    }
})

const pulls = mongoose.model('pull', pullSchema)
module.exports = pulls
