const express = require('express')
const router = express.Router()
const { forkProject, getOneFork, checkForked } = require('../controllers/forkController')

router.get('/get-fork/:dataID', getOneFork)
router.get('/check-fork/:userID/:projectID', checkForked)
router.post('/fork-project/:userID/:projectID', forkProject)

module.exports = router