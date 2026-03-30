import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import useChat from "./useChat"
import MessageBox from "./Messages/MessageBox"
import Messages from "./Messages/Messages"

function Chat() {
    const { roomID, userName } = useParams()
    const { messages, sendMessage, activities } = useChat(userName, roomID)
    const navigate = useNavigate()

    if (userName == "") {
        navigate(-1)
        toast.alert("UserName cant be empty!")
    }

    return (
        <div className="bg-gray-100 px-10 py-8">
            <h1 className="text-4xl text-slate-800 font-bold">Welcome</h1>
            <hr className="my-3" />
            <p className="text-[12px] text-slate-500 mb-5">Welcome to our chat rooms! Connect with others in real-time discussions, share ideas, and engage in lively conversations on topics that matter to you. Whether you're here to meet new people, seek advice, or simply unwind, our chat rooms offer a friendly space to interact and connect. Join the conversation and make new connections today!</p>
            <Messages messages={messages} />
            <MessageBox sendMessage={sendMessage} userName={userName} activities={activities} />
        </div>
    )
}

export default Chat
