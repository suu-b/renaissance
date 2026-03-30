const roomModel = require('../models/roomSchema')

const getName = async (req, res) => {
    try {
        const roomID = req.params.roomID
        const room = await roomModel.findById(roomID)
        if (!room) {
            return res.status(404).json({ message: "Room not found!" })
        }
        res.status(200).json({ roomName: room.roomName })
    }
    catch (error) {
        console.log("Error while fetching the name for the room", error)
        res.status(500).json({ message: "Failed to fetch the room name" })
    }
}


const postRoom = async (req, res) => {
    try {
        const roomName = req.body.roomName
        const room = await roomModel.findOne({ roomName: roomName })
        if (room) {
            return res.status(409).json({ message: "Room already exists!" })
        }
        const newRoom = new roomModel({roomName : roomName})
        await newRoom.save()
        res.status(201).json({ message: "Room created!", roomID : newRoom._id })
    }
    catch (error) {
        console.log("Error creating the room", error)
        res.status(500).json({ message: "Failed to create the room" })
    }
}

module.exports = { getName, postRoom }