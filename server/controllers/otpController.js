const otpGenerator = require('otp-generator')
const otpModel = require('../models/otpSchema')
const userModel = require('../models/userSchema')

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body
        const findUser = await userModel.findOne({ email: email })
        console.log(findUser)
        if (findUser) return res.status(401).json({ message: "User already exists" })
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            digits: true,
        })
        let maxAttempts = 5;
        let attempts = 0;
        let result = await otpModel.findOne({ otp: otp })
        while (result && attempts < maxAttempts) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
                digits: true,
            })
            result = await otpModel.findOne({ otp: otp })
            attempts++;
        }
        const otpPayLoad = new otpModel({ email, otp })
        await otpPayLoad.save()
        res.status(200).json({ otp: otp })
    }
    catch (error) {
        console.log("Error occurred sending the otp:", error)
        return res.status(500).json({ message: "Failed to generate OTP" })
    }
}

const verifyOTP = async (req, res) => {
    try {
        const otp = req.body.otp
        const email = req.body.email
        if (!otp || !email) {
            return res.status(400).json({ message: "Email and OTP are both required" })
        }
        const latest = await otpModel.find({ email }).sort({ createdAt: -1 }).limit(1)
        const expTime = new Date(latest[0].createdAt.getTime() + (10 * 60 * 1000))
        const currTime = new Date()
        if (currTime > expTime) {
            return res.status(401).json({ message: "OTP has expired" })
        }
        if (!latest || latest[0].otp !== otp) {
            console.log("OTP is invalid");
            return res.status(400).json({ message: "The OTP is invalid" });
        }
        return res.status(200).json({ message: "Success!" })
    }
    catch (error) {
        console.log("Error verifying OTP:", error)
        return res.status(500).json({ message: "Failed to verify otp" })
    }
}

module.exports = { sendOTP, verifyOTP }