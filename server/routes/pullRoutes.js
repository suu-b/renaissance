const express = require('express')
const router = express.Router()
const { setpull, getApprovalRequests, getOnepull, clearpull } = require('../controllers/pullsController')

router.get('/get-pull/:pullID', getOnepull)
router.get('/requests/:userID', getApprovalRequests)
router.post('/pull', setpull)
router.delete('/clear-pull/:pullID', clearpull)

module.exports = router
