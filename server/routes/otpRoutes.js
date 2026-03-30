const express = require('express')
const Router = express.Router()
const { sendOTP, verifyOTP } = require('../controllers/otpController')

Router.post('/send-otp', sendOTP)
Router.post('/verify-otp', verifyOTP)
module.exports = Router