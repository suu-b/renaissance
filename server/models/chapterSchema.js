const mongoose = require('mongoose')

const chapterSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: "My first chapter!"
    },
    dateCreated: {
        type: Date,
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    projectID : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required : false
    }
})

const chapters = mongoose.model('Chapter', chapterSchema)

module.exports = chapters