const projectModel = require('../models/projectSchema')
const userModel = require('../models/userSchema')
const chapterModel = require('../models/chapterSchema')
const pullModel = require('../models/pullSchema')
const forkModel = require('../models/forkSchema')
const checkValidation = require('../validation/checkValidation')
const projectStruc = require('../validation/projectValidation')

const getData = async (req, res) => {
    try {
        const data = await projectModel.find()
        res.status(200).json(data)
    }
    catch (error) {
        console.log('Error fetching data: ', error.message)
        res.status(500).json({ message: "Failed to fetch. Could not find data" })
    }

}

const getOneData = async (req, res) => {
    try {
        const dataID = req.params.dataID
        const data = await projectModel.findById(dataID)
        if (!data) {
            console.log("Project not found")
            return res.status(404).json({ message: "Project not found" })
        }
        res.status(200).json(data)
    }
    catch (error) {
        console.log('Error fetching data: ', error.message)
        res.status(500).json({ message: "Failed to fetch. Could not find data" })
    }

}

const postData = async (req, res) => {
    const newPost = new projectModel({
        title: req.body.title,
        dateCreated: req.body.dateCreated,
        description: req.body.description,
        tags: req.body.tags,
        contributors: req.body.contributors,
        status: req.body.status,
        projectOwner: req.body.projectOwner,
        projectOwnerName: req.body.projectOwnerName
    })
    if (!checkValidation(req.body, projectStruc)) {
        return res.status(400).json({ message: "Validation Failed" })
    }
    try {
        const savedPost = await newPost.save()
        await userModel.findByIdAndUpdate(req.body.projectOwner, { $push: { projects: savedPost._id } })
        res.status(201).json(savedPost)
    }
    catch (error) {
        await newPost.deleteOne()
        console.log('Error Posting data: ', error.message)
        res.status(500).json({ message: "Failed to Post. Could not Post data" })
    }
}

const deleteData = async (req, res) => {
    try {
        const projectID = req.params.id
        const projectToDelete = await projectModel.findById(projectID);
        if (!projectToDelete) {
            console.log("Project does not exist")
            return res.status(404).json({ message: "Project not found. Check the id" })
        }
        const chapters = projectToDelete.chapters
        for (const chapterID of chapters) {
            await chapterModel.findByIdAndDelete(chapterID)
        }
        const forksToDelete = await forkModel.find({ projectID })
        for (const fork of forksToDelete) {
            await userModel.updateMany(
                { forkedProjects: fork._id },
                { $pull: { forkedProjects: fork._id } }
            )
            await forkModel.findByIdAndDelete(fork._id)
        }
        await pullModel.deleteMany({ projectID: projectID })
        await chapterModel.deleteMany({ projectID: projectID })
        await projectModel.findByIdAndDelete(projectID)
        console.log("Project deleted successfully")
        res.status(204).send()
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Deletion failed. Try again later." })
    }
}

const updateData = async (req, res) => {
    const projectID = req.params.id
    try {
        const project = await projectModel.findById(projectID)
        if (!project) return res.status(404).json({ message: "Project Not Found" })
        if (req.body.title) project.title = req.body.title
        if (req.body.description) project.description = req.body.description
        await project.save()
        res.status(200).json(project)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Updation failed. Try again later." })
    }
}

const getLatestData = async (req, res) => {
    const userID = req.params.userID
    try {
        const latest = await projectModel.find({ projectOwner: userID }).sort({ dateCreated: -1 }).limit(3).exec();
        res.status(200).json(latest);
    } catch (error) {
        console.log("Error fetching the latest items", error);
        res.status(500).json({ message: "Failed to Fetch Data" });
    }
};

const getContributorsList = async (req, res) => {
    const projectID = req.params.projectID
    try {
        const project = await projectModel.findById(projectID)
        if (!project) return res.status(404).json({ message: "No Project Found" })
        const contributorsIDs = project.contributors
        const contributors = await userModel.find({ _id: { $in: contributorsIDs } }, 'username')
        res.status(200).json(contributors)
    }
    catch (error) {
        console.log("Error getting the contributers:", error)
        res.status(500).json({ message: "Error fetching contributers. Try again later." })
    }
}

module.exports = { getData, getOneData, postData, deleteData, getLatestData, getContributorsList, updateData }