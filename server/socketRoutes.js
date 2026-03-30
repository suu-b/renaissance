const charUserModel = require('./models/chatUserSchema.js')
const messageModel = require('./models/messageSchema.js')

const initChat = (io) => {
    io.on('connection', socket => {
        socket.on('enterRoom', async ({ userName, room }) => {
            try {
                const user = await activateUser({ socketID: socket.id, userName, room })
                socket.join(user.room)
                socket.to(user.room).emit('newMessage', await buildTempMessage('Bot', `${userName} has joined the room`, room))
                const recentMessages = await getRecentMessages(room)
                socket.emit("MostRecentMessages", recentMessages.reverse())
            }
            catch (error) {
                console.log("Error entering room", error)
            }
        })
        socket.on('newMessage', async (data) => {
            try {
                const findUser = await getUser(socket.id)
                const room = findUser.room
                const message = await buildPermMessage(data.userName, data.message, room)
                io.to(room).emit('newMessage', message)

            }
            catch (error) {
                console.log("Error emitting the message:", error)
            }
        })
        socket.on('disconnect', async () => {
            try {
                const user = await deactivateUser(socket.id)
                if (user) {
                    socket.to(user.room).emit('newMessage', await buildTempMessage("Bot", `${user.userName} left the room`, user.room))
                }
            }
            catch (error) {
                console.log("Error disconnecting the user:", Error)
            }
        })
    })
}

const getRecentMessages = async (room) => {
    try {
        const recentMessages = await Message.find({ room: room }).sort({ _id: -1 }).limit(10)
        return recentMessages
    }
    catch (error) {
        console.log("Error getting the recent messages", error)
        return []
    }
}

const buildPermMessage = async (userName, text, room) => {
    try {
        const message = new messageModel({ userName: userName, message: text, room: room, timeStamp: Date.now() })
        await message.save()
        return message
    }
    catch (error) {
        console.log("Error building permanent message:", error)
    }
}

const buildTempMessage = (userName, text, room) => {
    try {
        const message = { userName: userName, message: text, room: room, timeStamp: Date.now() }
        return message
    }
    catch (error) {
        console.log("Error building temporary message:", error)
    }
}

const activateUser = async ({ socketID, userName, room }) => {
    try {
        const user = new charUserModel({ socketID: socketID, userName: userName, room: room })
        await user.save()
        return user
    }
    catch (error) {
        console.log("Error activating the user:", error)
    }
}

const deactivateUser = async (socketID) => {
    try {
        const deleteUser = await charUserModel.findOneAndDelete({ socketID: socketID })
        return deleteUser
    }
    catch (error) {
        console.log("Error deactivating the user:", error)
    }
}

const getUser = async (socketID) => {
    try {
        const findUser = await charUserModel.findOne({ socketID: socketID })
        return findUser
    }
    catch (error) {
        console.log("Error finding the user:", error)
    }
}

module.exports = initChat
