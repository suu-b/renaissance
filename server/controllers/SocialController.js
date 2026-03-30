const userModel = require('../models/userSchema')
const projectModel = require('../models/projectSchema')

const getNumberOfLikesForProject = async (req, res) => {
    const projectID = req.params.projectID
    try {
        const project = await projectModel.findById(projectID)
        if (!project) return res.status(400).json({ message: "Project Not Found" })
        res.status(200).json({ likes: project.Likes.length })
    }
    catch (error) {
        console.log("Error fetching the likes for the project:", error)
        res.status(500).json({ message: "Error fetching Likes. Try again later" })
    }
}

const getNumberOfLikesForUser = async (req, res) => {
    const userID = req.params.userID
    try {
        const user = await userModel.findById(userID)
        if (!user) return res.status(400).json({ message: "User Not Found" })
        res.status(200).json({ likes: user.Likes.length })
    }
    catch (error) {
        console.log("Error fetching the likes for the user:", error)
        res.status(500).json({ message: "Error fetching Likes. Try again later" })
    }
}

const likeProject = async (req, res) => {
    const {projectID, userID} = req.params
    try {
        const project = await projectModel.findById(projectID)
        if (!project) return res.status(404).json({ message: "Project Not Found" })

        const user = await userModel.findById(userID)
        if (!user) return res.status(404).json({ message: "User Not Found" })

        const projectOwnerID = project.projectOwner        
        const projectOwner = await userModel.findById(projectOwnerID)
        if (!projectOwner) return res.status(404).json({ message: "No Project Owner Found" })
        
        if(project.Likes.includes(userID)) return res.status(409).json({message : "Project Already liked"})

        await projectModel.findByIdAndUpdate(projectID, { $push: { Likes: user._id } })
        await userModel.findByIdAndUpdate(projectOwnerID, { $push: { Likes: user._id } })

        const updatedProject = await projectModel.findById(projectID)
        res.status(200).json({ likes: updatedProject.Likes.length })
    }
    catch (error) {
        console.log("Error liking the project:", error)
        res.status(500).json({ message: "Error liking the project. Try again later" })
    }
}

const checkIfLiked = async (req, res) => {
    const {projectID, userID} = req.params
    try {
        const project = await projectModel.findById(projectID)
        if (!project) return res.status(404).json({ message: "Project Not Found" })

        const user = await userModel.findById(userID)
        if (!user) return res.status(404).json({ message: "User Not Found" })
        
        if(project.Likes.includes(userID)) return res.status(409).json({message : "Project Already liked"})
        return res.status(200).json({message : "User can like the project"})
    }
    catch (error) {
        console.log("Error checking the project:", error)
        res.status(500).json({ message: "Error checking the project. Try again later" })
    }
}

module.exports = { getNumberOfLikesForProject, getNumberOfLikesForUser, likeProject, checkIfLiked}