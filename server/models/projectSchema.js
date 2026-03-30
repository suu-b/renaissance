const mongoose = require('mongoose')

const projectSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    dateCreated : {
        type : Date,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    tags : {
        type : Array,
        required : true
    },
    contributors :{
        type : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }],
        default : []
    },
    status : {
        type : String,
        required : true
    },
    projectOwner : {
        type : String,
        required : true
    },
    projectOwnerName : {
        type : String,
        required : true
    },
    chapters :{
        type : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Chapter'
        }],
        default : []
    },
    Likes :{
        type : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'project'
        }],
        default : []
    }
})

const projects = mongoose.model('project', projectSchema)

module.exports = projects
