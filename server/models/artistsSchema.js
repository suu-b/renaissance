const mongoose = require('mongoose')

const artistsSchema = mongoose.Schema({
    artistName: {
        type: String,
        required: true
    },
    artistImageSrc: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    birth: {
        type: String,
        required: true
    },
    artistBio: {
        type: String,
        required: true
    },
    artistWorks: {
        type: Array,
        required: true
    }
})

const artistModel = mongoose.model('artist', artistsSchema)

module.exports = artistModel
