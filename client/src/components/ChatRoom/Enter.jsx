import { useState } from "react"
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"

function Enter() {
    const { roomID } = useParams()
    const [userName, setUserName] = useState("")
    return (
        <>
            <form className="bg-[#3F5F4F] w-[100vw] h-[100vh] flex flex-col justify-center items-center px-8 py-5">
                <h1 className='text-6xl text-white font-bold mb-5 '>JOIN A CHAT ROOM</h1>
                <input type="text" placeholder="Enter your name here" onChange={(e) => setUserName(e.target.value)} required className="px-3 py-1.5 bg-white border rounded w-[30vw] text-center" />
                <Link to={`/Chats/${roomID}/${userName}`}><button className="mt-5 rounded text-slate-800 text-sm bg-gray-100 px-3 py-1.5 rounded">Enter the room</button></Link>
            </form>
        </>
    )
}

export default Enter
