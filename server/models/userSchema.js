const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    projects: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }],
        default: []
    },
    forkedProjects: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }],
        default: []
    },
    commits: {
        type: Array,
        required: true
    },
    occupations: {
        type: Array,
        default: ['amateur']
    },
    password: {
        type: String
    },
    profileImage: {
        type: String,
        default: './public/userDisplayImages/default-profile-image.png',
        required: false
    },
    location: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    phNumber: {
        type: Number,
        required: false
    },
    Likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        default: []
    }
})

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next()
        }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(this.password, salt)
        this.password = hash
        next()
    }
    catch (error) {
        next(error)
    }
})
const user = mongoose.model('user', userSchema)
module.exports = user