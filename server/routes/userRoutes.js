const express = require('express')
const router = express.Router()
const { registerUser, updateUser, deleteUser, getUserProjects, logoutUser, loginUser, getForkedProjects, getOneUser, getProfileImage } = require('../controllers/userController')

router.post('/register', registerUser)
router.patch('/update/:userID', updateUser)
router.delete('/delete/:mail', deleteUser)
router.post('/login', loginUser)
router.get('/user-project/:id', getUserProjects)
router.get('/forkedProjects/:userID', getForkedProjects)
router.get('/getUser/:userID', getOneUser)
router.get('/get-profile-image/:userID', getProfileImage)
router.post('/logout', logoutUser)

module.exports = router