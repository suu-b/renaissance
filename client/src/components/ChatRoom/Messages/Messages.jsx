import { useEffect, useRef } from "react"
function Messages({ messages }) {
    const messageEndRef = useRef()

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])
    return (
        <div>
            {messages && messages.map((message, index) => (
                <div key={index} className="w-[50vw] bg-white rounded m-3 border border-gray-200 shadow">
                    <p className={`rounded text-base font-bold  pl-5 py-1.5 ${message.userName == 'Bot' ? 'bg-[#3F5F4F] text-white' : 'bg-[#97D4A6] text-slate-800'}`}>{message.userName}</p>
                    <p className={`py-3 px-5 text-sm text-slate-800  ${message.userName == 'Bot' ? 'bg-[#97D4A6] text-[#3F5F4F]' : 'text-slate-800'}`}>{message.message}</p>
                </div>
            ))}
            <div ref={messageEndRef} />
        </div>
    )
}

export default Messages
