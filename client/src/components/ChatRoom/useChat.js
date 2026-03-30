import { useEffect, useState, useRef } from "react"
import { getRoomName } from '../../utils/apiUtils'
import socketIOClient from "socket.io-client"

const useChat = (userName, roomID) => {
    const socketRef = useRef(null)
    const [roomName, setRoomName] = useState(null)
    const [messages, setMessages] = useState([])
    const [activities, setActivities] = useState([])

    useEffect(() => {
        getRoomName(roomID)
            .then(result => {
                setRoomName(result.data.roomName)
            })
            .catch(error => {
                console.log("Error getting the room name:", error)
            })
    }, [roomID])

    useEffect(() => {
        if (!roomName) return

        socketRef.current = socketIOClient(import.meta.env.VITE_SOCKET_SERVER)

        socketRef.current.on("MostRecentMessages", mostRecentMessages => {
            setMessages(mostRecentMessages)
        })

        socketRef.current.on('newMessage', ({ userName, message, room }) => {
            setMessages(prevMessages => [...prevMessages, { userName, message }])
        })

        socketRef.current.emit("enterRoom", { userName, room: roomName })

        return () => {
            if (socketRef.current) socketRef.current.disconnect()
        }
    }, [roomName, userName])

    const sendMessage = (messageObj) => {
        socketRef.current.emit("newMessage", messageObj)
    }
    return { messages, sendMessage, activities }
}

export default useChat
