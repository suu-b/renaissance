const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userSchema')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const router = express.Router()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const SERVER_URI = process.env.SERVER_URI
const CLIENT_URI = process.env.CLIENT_URI
const SECRET = process.env.SECRET

passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: `${SERVER_URI}/google-auth/google/callback`,
    scope: ['profile','email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { email, name } = profile._json
        let user = await userModel.findOne({ email })
        if (!user) {
            user = new userModel({ username: name, email })
            await user.save()
        }
        return done(null, user)
    } catch (err) {
        console.log("Authentication error:", err)
        return done(err, null)
    }
}))

passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }))

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err || !user) {
            console.log("Auth error or no user:", err || info)
            return res.redirect(`${CLIENT_URI}/register?error=${encodeURIComponent(err?.message || "User not authenticated")}`)
        }

        const token = jwt.sign({
            userID: user._id,
            userName: user.username,
            email: user.email
        }, SECRET, { expiresIn: '6h' })

        res.redirect(`${CLIENT_URI}/success?token=${token}`)
    })(req, res, next)
})

module.exports = router
