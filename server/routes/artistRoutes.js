const express = require('express')
const router = express.Router()
const {getArtists, getArtistsOne, postArtistOne} = require('../controllers/artistController')

router.get('/', getArtists)
router.get('/find-artist/:id', getArtistsOne)
router.post('/add-artist', postArtistOne)

module.exports = router