const multer = require('multer')
const express = require('express')
const { updateProfileImage } = require('../controllers/fileController')
const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./public/userDisplayImages")
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "-" + file.originalname)
    }
})

const uploadStorage = multer({ storage: storage })
router.patch('/set-profile-image/:userID', uploadStorage.single('profile-image'), updateProfileImage)

module.exports = router

