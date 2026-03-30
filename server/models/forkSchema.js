const mongoose = require('mongoose')

const forkSchema = mongoose.Schema({
    dateCreated : {
        type : Date,
        required : true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    projectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    chapters :{
        type : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Chapter'
        }],
        default : []
    }
})

const forks = mongoose.model('fork', forkSchema)
module.exports = forks
