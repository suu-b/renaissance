import getDate from "../../utils/getDate"
import { useState } from "react"
import { toast } from 'react-toastify'
import { pullChapter } from "../../utils/apiUtils"
import RequestEditor from "../Text-Editor/RequestEditor"
import getUserDetails from "../../utils/getUserDetails"

function UploadChapter({ projectID, chapterID, userID, setUploadChapter, contributerName, projectName }) {
    const [message, setMessage] = useState(null)
    const setPullRequest = () => {
        const date = getDate()
        const contributerID = getUserDetails('userID')
        const data = { projectID: projectID, timestamp: date, userID: userID, updatedChapter: chapterID, message: message, contributerName: contributerName, projectName: projectName, contributerID: contributerID }
        console.log(data)
        pullChapter(data)
            .then(response => {
                console.log(response.data)
                setUploadChapter(false)
                toast.success("Request made successfully")
            })
            .catch(error => {
                console.log(error)
                toast.error("Failed to make any request")
            })
    }
    return (
        <>
            <div className="fixed bottom-0 left-0 w-[100vw] h-[100vh] bg-black opacity-10"></div>
            <div className="fixed top-[20%] lg:top-[10%] xl:top-[30%] left-[10%] lg:left-[30%] bg-gray-100 border border-gray-300 rounded p-5 lg:py-10 lg:px-8 w-[80%] lg:w-[40%]">
                <h1 className='font-bold text-lg lg:text-2xl'>Upload the chapter to Original Project</h1>
                <p className="text-gray-500 text-[11px] lg:text-[12px]">Once the owner of the project approves your submission, your work would be saved in the main project</p>
                <hr />
                <h1 className='lg:text-base mt-5 text-sm'>for&nbsp;<span className="font-bold">{projectName}</span></h1>
                <p className="text-gray-500 text-[11px] lg:text-[12px] mb-5">Your progress in the chapter shall be sent as a request to merge in the original project</p>
                <RequestEditor setMessage={setMessage} className="w-full border placeholder-gray-500 text-sm" />
                <button onClick={() => setPullRequest()} className="bg-[#3F5F4F] text-[12px] lg:text-sm text-white px-3 py-1.5 rounded lg:mt-8">Send a Request</button>
                <button onClick={() => setUploadChapter(false)} className="bg-red-100 border border-red-400 text-[12px] lg:text-sm text-red-400 px-3 lg:ml-5 py-1.5 rounded mt-3 ml-3 lg:mt-8">I'll do it later</button>
            </div></>
    )
}

export default UploadChapter