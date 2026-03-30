const artistModel = require('../models/artistsSchema.js')

const getArtists = async (req, res) => {
    try {
        const data = await artistModel.find()
        res.status(200).json(data)
    }
    catch (error) {
        console.log('Error fetching all artists: ', error.message)
        res.status(500).json({ message: "Failed to fetch. Could not find artists" })
    }

}

const getArtistsOne = async (req, res) => {
    try {
        const artist = await artistModel.findById({ _id: req.params.id })
        if (!artist) {
            return res.status(404).json({ message: "Artist not found" })
        }
        res.status(200).json(artist)
    }
    catch (error) {
        console.log('Error fetching the artist: ', error.message)
        res.status(500).json({ message: "Failed to fetch. Could not find the artist" })
    }

}

const postArtistOne = async (req, res) => {
    const newArtist = new artistModel({
        artistName: req.body.artistName,
        artistImageSrc: req.body.artistImageSrc,
        title: req.body.title,
        birth: req.body.birth,
        artistBio: req.body.artistBio,
        artistWorks: req.body.artistWorks,
    })
    try {
        const savedArtist = await newArtist.save()
        res.json(savedArtist)
    }
    catch (error) {
        console.log('Error Posting Artist: ', error.message)
        res.status(500).json({ message: "Failed to Post. Could not Post Artist" })
    }
}

module.exports = { getArtists, getArtistsOne, postArtistOne }