import { toast } from "react-toastify"
import { useState, useEffect, useRef } from "react"

function MessageBox({ sendMessage, userName, activities }) {
    const [text, setText] = useState("")
    

    const sendMsgClick = (e) => {
        if (e) {
            e.preventDefault()
        }

        if (text.trim() == '') {
            toast.warning("Cannot send something empty")
            return
        }
        const msgObject = { userName: userName, message: text }
        setText('')
        sendMessage(msgObject)
    }
    return (
        <div className="fixed bottom-0 left-0 w-full">
            <div>{activities && activities.map(activity => {
                <i>{activity} is typing..</i>
            })}</div>

            <form className="flex justify-between items-center w-[100vw] shadow-xl border">
                <input type='text' placeholder="✒  Send something..." value={text} onChange={(e) => setText(e.target.value)} className="bg-white w-[90%] border py-2 px-5" />
                <button onClick={(e) => sendMsgClick(e)} className="bg-[#3F5F4F] w-[10%] text-white px-3 py-2 rounded">Send</button>
            </form>
        </div>
    )
}

export default MessageBox
