const projectModel = require('../models/projectSchema')
const forkModel = require('../models/forkSchema')
const userModel = require('../models/userSchema')
const checkValidation = require('../validation/checkValidation')
const forkStruc = require('../validation/forkValidation')

const forkProject = async (req, res) => {
    const projectID = req.params.projectID
    const userID = req.params.userID
    const newForkProject = new forkModel({
        dateCreated: req.body.dateCreated,
        userID: userID,
        projectID: projectID,
        chapters: req.body.chapters
    })
    if (!checkValidation(req.body, forkStruc)) {
        return res.status(400).json({ message: "Validation Failed" })
    }
    try {
        const forkedProject = await newForkProject.save()
        await userModel.findByIdAndUpdate(userID, { $push: { forkedProjects: forkedProject._id } })
        res.status(201).json(forkedProject)
    }
    catch (error) {
        console.log("Error forking project", error)
        res.status(500).json({ message: "Failed to fork Project. Try again later." })
    }
}

const getOneFork = async (req, res) => {
    try {
        const dataID = req.params.dataID
        const data = await forkModel.findById(dataID)
        if (!data) {
            console.log("Fork not found")
            return res.status(404).json({ message: "Fork not found" })
        }
        res.status(200).json(data)
    }
    catch (error) {
        console.log('Error fetching data: ', error.message)
        res.status(500).json({ message: "Failed to fetch. Could not find data" })
    }
}

const checkForked = async (req, res) => {
    try {
        const userID = req.params.userID
        const projectID = req.params.projectID
        const isForked = await forkModel.findOne({ userID: userID, projectID: projectID })
        console.log(isForked)
        if (!isForked) {
            return res.status(404).json({ message: "Not Forked" })
        }
        res.status(200).json({ message: "Already forked" })
    }
    catch (error) {
        console.log('Error checking data: ', error.message)
        res.status(500).json({ message: "Failed to check. Could not check" })
    }
}

module.exports = { forkProject, getOneFork, checkForked }