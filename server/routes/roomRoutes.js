const express = require('express')
const router = express.Router()
const { getName, postRoom} = require('../controllers/roomController')

router.get('/room-name/:roomID', getName)
router.post('/post-room', postRoom)

module.exports = router
