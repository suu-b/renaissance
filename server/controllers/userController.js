const bcrypt = require('bcrypt')
const userModel = require('../models/userSchema')
const projectModel = require('../models/projectSchema')
const checkValidation = require('../validation/checkValidation')
const userStruc = require('../validation/userValidation')
const otpModel = require('../models/otpSchema')
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config();

const SECRET = process.env.SECRET

const registerUser = async (req, res) => {
    const findUser = await userModel.findOne({ email: req.body.email })
    if (findUser) {
        console.log("User already Exists")
        return res.status(409).json({ message: "User already exists" })
    }
    if (!checkValidation(req.body, userStruc)) {
        console.log("Data Failed the validation")
        return res.status(400).json({ message: "Data validation failed. Please add data as per the norms" })
    }
    try {
        const newUser = new userModel({
            username: req.body.username,
            email: req.body.email,
            occupations: req.body.occupations,
            password: req.body.password,
        })
        const user = await newUser.save()
        res.status(201).json(user)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Registration Failed" })
    }
}

const getOneUser = async (req, res) => {
    const userID = req.params.userID
    try {
        const findUser = await userModel.findById(userID)
        if (!findUser) {
            console.log("User not found")
            return res.status(404).json({ message: "User not found" })
        }
        const userdata = { email: findUser.email, projects: findUser.projects, occupations: findUser.occupations, username: findUser.username, profileImage: findUser.profileImage, phNumber: findUser.phNumber, location: findUser.location, bio: findUser.bio }
        res.status(200).json(userdata)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to find user. Try again later." })
    }

}

const updateUser = async (req, res) => {
    try {
        const userID = req.params.userID
        const findUser = await userModel.findById(userID)
        if (!findUser) {
            console.log("User doesn't exist")
            return res.status(404).json({ message: "User doesn't exist" })
        }
        if (req.body.username) findUser.username = req.body.username
        if (req.body.email) findUser.email = req.body.email
        if (req.body.occupations) findUser.occupations = req.body.occupations
        if (req.body.password) findUser.password = req.body.password
        if (req.body.location) findUser.location = req.body.location
        if (req.body.bio) findUser.bio = req.body.bio
        if (req.body.phNumber) findUser.phNumber = req.body.phNumber

        await findUser.save()
        res.status(200).json(findUser)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Updation failed. Try again later" })
    }
}

const deleteUser = async (req, res) => {
    try {
        const userMail = req.params.mail
        const userToDelete = await userModel.deleteOne({ email: userMail })
        if (userToDelete.deletedCount == 0) {
            console.log("User does not exist")
            return res.status(404).json({ message: "User not found. Check mail" })
        }
        console.log("User deleted successfully")
        res.status(200).json({ message: "User deleted successfully" })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Deletion failed. Try again later." })
    }
}

const getUserProjects = async (req, res) => {
    try {
        const userId = req.params.id
        const userProjects = await projectModel.find({ projectOwner: userId })
        if (!userProjects || userProjects.length == 0) {
            return res.status(404).json({ message: "There are no projects" })
        }
        res.status(200).json(userProjects)
    }
    catch (error) {
        console.log("Error finding projects:", error)
        res.status(500).json({ message: "Trouble finding the projects. Try again later." })
    }
}

const loginUser = async (req, res) => {
    try {
        const findUser = await userModel.findOne({ email: req.body.email })
        if (!findUser) {
            console.log("User not found")
            return res.status(404).json({ message: "User not found" })
        }
        const isMatch = await bcrypt.compare(req.body.password, findUser.password)
        if (!isMatch) {
            console.log("Wrong credentials.")
            return res.status(401).json({ message: "The credentials you added were wrong." })
        }
        const accessToken = jwt.sign({ userID: findUser._id, userName: findUser.username, email: findUser.email }, SECRET, { expiresIn: '6h' })
        res.status(200).json({ message: "Login Sucessfull", accessToken: accessToken })
    }
    catch (error) {
        console.log(error)
        res.status(401).json({ message: "Login Failed" })
    }
}

const getForkedProjects = async (req, res) => {
    const userID = req.params.userID
    try {
        const findUser = await userModel.findById(userID)
        if (!findUser) {
            console.log("User not found")
            return res.status(404).json({ message: "User not found" })
        }
        const forkedProjects = findUser.forkedProjects
        res.status(200).json(forkedProjects)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to find forked projects. Try again later." })
    }

}

const getProfileImage = async (req, res) => {
    const userID = req.params.userID
    try {
        const findUser = await userModel.findById(userID)
        if (!findUser) return res.status(404).json({ message: "User not found" })
        const filePath = path.join(__dirname, '..', '..', 'server', findUser.profileImage)
        res.sendFile(filePath)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching the profile image. Try again later." })
    }
}

const logoutUser = async (req, res) => {
    const token = req.cookies.accessToken
    const sessionID = req.cookies['connect.sid']
    if (!token) return res.status(401).json({ message: "No token provided" })
    try {
        jwt.verify(token, SECRET)
        res.clearCookie('accessToken')
        if (sessionID) res.clearCookie('connect.sid')
        res.status(200).json({ message: "Logout Successful!" })
    }
    catch (error) {
        console.log("Error logging out:", error)
        res.status(401).json({ message: "Logout failed!" })
    }

}

module.exports = { registerUser, updateUser, deleteUser, loginUser, getUserProjects, getForkedProjects, getOneUser, getProfileImage, logoutUser }