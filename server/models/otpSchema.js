const mongoose = require('mongoose')
const mailSender = require('../utils/mailSender')

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 10
    }
})

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email,
            "Renaissance: Verification Mail",
            `<p>To authenticate, please use the following One Time Password (OTP): </p>
            <h3>${otp} </h3>
            <p>It will expire in <strong>10 mins</strong>.</p>
            <p>Don't share it with anyone. Ignore, in case you didn't request it.</p>
            `
        )
        console.log("Email Sent successfully!", mailResponse)
    }
    catch (error) {
        console.log("Error sending the mail:", error)
        throw error
    }
}


otpSchema.pre('save', async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp)
    }
    next()
})

module.exports = mongoose.model('otp', otpSchema)