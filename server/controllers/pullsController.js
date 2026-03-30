const userModel = require('../models/userSchema.js')
const pullModel = require('../models/pullSchema.js')
const projectModel = require('../models/projectSchema.js')
const pullStruc = require('../validation/pullValidation.js')
const checkValidation = require('../validation/checkValidation.js')

const setpull = async (req, res) => {
    const newpull = new pullModel({
        projectID: req.body.projectID,
        timestamp: req.body.timestamp,
        userID: req.body.userID,
        contributerName: req.body.contributerName,
        projectName: req.body.projectName,
        contributerID: req.body.contributerID,
        updatedChapter: req.body.updatedChapter,
        message: req.body.message != null ? req.body.message : "Message not provided"
    })
    if (!checkValidation(req.body, pullStruc)) {
        return res.status(400).json({ message: "Validation Failed" })
    }
    try {
        const pulledPost = await newpull.save()
        await userModel.findByIdAndUpdate(req.body.userID, { $push: { pulls: pulledPost._id } })
        res.status(201).json(pulledPost)
    }
    catch (error) {
        await newpull.deleteOne()
        console.log('Error pulling data: ', error.message)
        res.status(500).json({ message: "Failed to pull. Could not pull data" })
    }
}

const getApprovalRequests = async (req, res) => {
    try {
        const userID = req.params.userID
        const requests = await pullModel.find({ userID: userID })
        if (!requests || requests.length === 0) {
            return res.status(404).json({ message: "No requests for now" })
        }
        res.status(200).json(requests)
    }
    catch (error) {
        console.log("Error fetching requests: ", error)
        res.status(500).json({ message: "Failed to fetch Requests. Could not fetch Requests" })
    }
}

const getOnepull = async (req, res) => {
    try {
        const pullID = req.params.pullID
        const pull = await pullModel.findById(pullID)
        if (!pull) {
            console.log("pull not found")
            return res.status(404).json({ message: "pull not found" })
        }
        res.status(200).json(pull)
    }
    catch (error) {
        console.log('Error fetching pull: ', error.message)
        res.status(500).json({ message: "Failed to fetch. Could not find pull" })
    }
}

const clearpull = async (req, res) => {
    try {
        const pullID = req.params.pullID
        const pullToClear = await pullModel.findByIdAndDelete(pullID)
        if (!pullToClear) {
            console.log("pull does not exist")
            return res.status(404).json({ message: "pull not found. Check the id" })
        }
        const projectID = pullToClear.projectID
        const updatedChapter = pullToClear.updatedChapter
        const contributorID = pullToClear.contributerID
        await projectModel.updateOne({ _id: projectID }, { $push: { chapters: updatedChapter, contributors: contributorID } })
        await userModel.updateMany({ pulls: pullID }, { $pull: { pulls: pullID } })
            .catch(async error => {
                console.log("Error clearing pull from user's account:", error)
                await pullModel.findByIdAndUpdate(pullID, { $set: { deleted: false } })
                res.status(500).json({ message: "pull failed. Try again later." })
            })
        console.log("pull cleared successfully")
        res.status(200).json({ message: "pull cleared successfully" })

    }
    catch (error) {
        await pullModel.findByIdAndUpdate(pullID, { $set: { deleted: false } })
        console.log(error)
        res.status(500).json({ message: "pull failed. Try again later." })
    }
}


module.exports = { setpull, getApprovalRequests, getOnepull, clearpull }