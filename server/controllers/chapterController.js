const chapterModel = require('../models/chapterSchema')
const projectModel = require('../models/projectSchema')
const forkModel = require('../models/forkSchema')
const chapterStruc = require('../validation/chapterValidation')
const checkValidation = require('../validation/checkValidation')

const getAllChaptersForProject = async (req, res) => {
    try {
        const projectID = req.params.projectID
        const project = await projectModel.findById(projectID)
        if (!project) return res.status(404).json({ message: "Project does not exist" })
        const chapters = await chapterModel.find({ _id: { $in: project.chapters }, isApproved: true })
        res.status(200).json(chapters)
    }
    catch (error) {
        console.log("Failed to fetch chapters:", error)
        res.status(500).json({ message: "Failed to fetch. Try again later" })
    }
}

const getAllChaptersForForkedProject = async (req, res) => {
    try {
        const forkID = req.params.forkID
        const userID = req.params.userID
        const project = await forkModel.findById(forkID)
        if (!project) return res.status(404).json({ message: "Project does not exist" })
        const chapters = await chapterModel.find({ _id: { $in: project.chapters }, userID: userID })
        res.status(200).json(chapters)
    }
    catch (error) {
        console.log("Failed to fetch chapters:", error)
        res.status(500).json({ message: "Failed to fetch. Try again later" })
    }

}

const getChapter = async (req, res) => {
    try {
        const chapterID = req.params.chapterID
        const chapter = await chapterModel.findById(chapterID)
        if (!chapter) return res.status(404).json({ message: "Chapter does not exist" })
        res.status(200).json(chapter)
    }
    catch (error) {
        console.log("Failed to fetch the chapter:", error)
        res.status(500).json({ message: "Failed to fetch. Try again later." })
    }
}

const addNewChapter = async (req, res) => {
    const newChapter = new chapterModel({
        projectID : req.params.projectID,
        title: req.body.title,
        content: req.body.content,
        dateCreated: req.body.dateCreated,
        userID: req.body.userID
    })
    console.log(newChapter)
    if (!checkValidation(req.body, chapterStruc)) {
        return res.status(400).json({ message: "Validation Failed" })
    }
    const forkID = req.params.forkID
    console.log(forkID)
    try {
        const project = await forkModel.findById(forkID)
        if (!project) return res.status(404).json({ message: "Project does not exist. Check again later" })
        const savedChapter = await newChapter.save()
        await forkModel.findByIdAndUpdate(forkID, { $push: { chapters: savedChapter._id } })
        res.status(201).json(savedChapter)
    }
    catch (error) {
        await newChapter.remove()
        console.log("Failed to post chapter:", error)
        res.status(500).json({ message: "Failed to post chapter. Try again later" })
    }

}

const updateChapter = async (req, res) => {
    try {
        if (!checkValidation(req.body, chapterStruc)) {
            console.log("Data Failed the validation")
            return res.status(400).json({ message: "Data validation failed. Please add data as per the norms" })
        }
        const chapterID = req.params.chapterID;
        delete req.body.dateCreated
        const updatedChapter = await chapterModel.findByIdAndUpdate(chapterID, req.body, { new: true })
        if (!updatedChapter) {
            console.log("Chapter doesn't exist")
            return res.status(404).json({ message: "Chapter doesn't exist" })
        }
        res.status(200).json(updatedChapter)
    }
    catch (error) {
        console.log("Updation failed:", error)
        res.status(500).json({ message: "Updation failed. Try again later" })
    }
}

const deleteChapter = async (req, res) => {
    try {
        const chapterID = req.params.chapterID
        const projects = await projectModel.find({ chapters: chapterID })
        const findChapter = await chapterModel.findById(chapterID)
        if (!findChapter) return res.status(404).json({ message: "Chapter not found" })
        for (const project of projects) {
            const indexOfChapter = project.chapters.indexOf(chapterID)
            if (indexOfChapter != -1) {
                project.chapters.splice(indexOfChapter, 1)
                await project.save()
            }
        }
        const deletedChapter = await chapterModel.findByIdAndDelete(chapterID)
        res.status(200).json({ message: "Chapter deleted successfully!" })
    }
    catch (error) {
        console.log("Failed to delete the chapter", error)
        res.status(500).json({ message: "Failed to to delete the chapter. Try again later " })
    }
}

const approveChapter = async (req, res) => {
    const chapterID = req.params.chapterID
    try {
        const chapter = await chapterModel.findById(chapterID)
        if (!chapter) return res.status(404).json({ message: "No Chapter Found" })
        chapter.isApproved = true
        const savedChapter = await chapter.save()
        res.status(200).json(savedChapter)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error approving chapter. Try again later" })
    }
}

const postChapterByOwner = async (req, res) => {
    const newChapter = new chapterModel({
        title: req.body.title,
        content: req.body.content,
        dateCreated: req.body.dateCreated,
        userID: req.body.userID,
        isApproved : true
    })
    if (!checkValidation(req.body, chapterStruc)) {
        return res.status(400).json({ message: "Validation Failed" })
    }
    const projectID = req.params.projectID
    try {
        const project = await projectModel.findById(projectID)
        if (!project) return res.status(404).json({ message: "Project does not exist. Check again later" })
        const savedChapter = await newChapter.save()
        await projectModel.findByIdAndUpdate(projectID, { $push: { chapters: savedChapter._id } })
        res.status(201).json(savedChapter)
    }
    catch (error) {
        console.log("Failed to post chapter:", error)
        res.status(500).json({ message: "Failed to post chapter. Try again later" })
    }
}

module.exports = { getAllChaptersForProject, getAllChaptersForForkedProject, getChapter, addNewChapter, updateChapter, deleteChapter, approveChapter, postChapterByOwner }