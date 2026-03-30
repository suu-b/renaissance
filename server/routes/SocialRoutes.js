const express = require('express')
const Router = express.Router()
const { getNumberOfLikesForProject, getNumberOfLikesForUser, likeProject, checkIfLiked } = require('../controllers/SocialController')

Router.get('/likes-for-project/:projectID', getNumberOfLikesForProject)
Router.get('/likes-for-user/:userID', getNumberOfLikesForUser)
Router.post('/likes-project/:projectID/:userID', likeProject)
Router.get('/check-liked/:projectID/:userID', checkIfLiked)

module.exports = Router