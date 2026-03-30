import { useParams, useNavigate } from "react-router-dom"
import { getOneUser, getRequest, fetchChapter, clearPull, approveChapter } from "../../utils/apiUtils"
import { showProfileImage } from "../../utils/getProfileImage"
import ReactHtmlParser from 'html-react-parser'
import { useEffect, useState } from "react"
import { toast } from 'react-toastify'
import getDateFromISO from "../../utils/getDateFromISO"

function RequestInterface() {
    const navigate = useNavigate()
    const { requestID } = useParams()
    const [request, setRequest] = useState(null)
    const [chapter, setChapter] = useState(null)
    const [imgURL, setImgURL] = useState(null)
    const [contributer, setContributer] = useState(null)

    const showChapter = (chapterID) => {
        fetchChapter(chapterID)
            .then(response => setChapter(response.data))
            .catch(error => console.log(error))
    }

    const mergeRequest = (chapterID, requestID) => {
        clearPull(requestID)
            .then(response => {
                console.log("Pull:", response.data)
                return approveChapter(chapterID)
            })
            .then(response => {
                console.log(response.data)
                toast.success("Merged!")
                navigate(-1)
            })
            .catch(error => {
                console.log(error)
                toast.error("Failed to merge. Try again later")
            })
    }

    useEffect(() => {
        getRequest(requestID)
            .then(response => {
                setRequest(response.data)
                showChapter(response.data.updatedChapter)
                console.log(response)
                return response.data.contributerID
            })
            .then(contributerID => {
                showProfileImage(contributerID, setImgURL)
                return getOneUser(contributerID)
            })
            .then(response => {
                setContributer(response.data)
            })
            .then(response => {
                console.log(response)
            })
            .catch(error => console.log(error))
    }, [])

    return (
        <div className="py-8 px-8 lg:px-10 bg-gray-100">
            <h1 className="text-2xl lg:text-3xl text-slate-700 font-bold">Merge Request(s)</h1>
            <p className="text-[12px] lg:text-[13.5px] mb-5 mt-1.5 text-slate-600 mt-1.5">Review the contributed material here. Review, discuss and Merge requests.</p>
            <div>
                <div className="bg-white rounded px-10 py-8 shadow border border-gray-300">
                    <h1 className="text-2xl lg:text-3xl text-slate-700 font-bold">{request && request.projectName}</h1>
                    <p className="text-slate-500 text-[12px] lg:text-sm mb-5">Made on <span>{request && getDateFromISO(request.timestamp)}</span></p>
                    <div className="flex items-center">
                        <img src={imgURL} alt="profile-image" className="w-16 rounded-full" />
                        <h1 className="text-base lg:text-lg text-slate-700 font-bold ml-3"><span className="text-[#3F5F4F]">{request && request.contributerName}</span> wants to merge the request</h1>
                    </div>
                    <hr className="my-5" />
                    <div className="text-[14px] mt-5 pl-0 pr-0 pb-3 pt-0 bg-white rounded border border-gray-300">
                        <div className="bg-[#abe0ba] text-slate-600 m-0 py-2 pr-3">
                            <span className="font-semibold text-black ml-5 text-[13px] lg:text-base">{request && request.contributerName}</span> requested
                        </div>
                        <div className="py-5 px-5 text-sm lg:text-base text-slate-700">
                            {request && ReactHtmlParser(request.message)}
                        </div>
                    </div>
                    <p className="text-[13.5px] text-base lg:text-lg mt-8 font-bold">Review the contribution:</p>
                    <div className="text-[14px] mt-5 pl-0 pr-0 pb-3 pt-0 bg-white rounded border border-gray-300">
                        <div className="bg-[#abe0ba] text-slate-600 m-0 py-2 pr-3">
                            <span className="font-semibold text-black ml-5">{chapter && chapter.title}</span>
                        </div>
                        <div className="py-5 px-5 text-slate-700">
                            {chapter && ReactHtmlParser(chapter.content)}
                        </div>
                    </div>
                    <button className="bg-[#3F5F4F] border text-white border-[#3F5F4F] rounded text-[12px] lg:text-sm px-2 lg:px-3 py-1.5 rounded mt-5" onClick={() => { mergeRequest(chapter._id, request._id) }}>Merge Request</button>
                    <button className="bg-red-100 border border-red-400 text-[12px] lg:text-sm text-red-400 ml-3 lg:ml-5 px-2 lg:px-3 py-1.5 rounded lg:mt-8">Reject Request</button>
                </div>

            </div>
        </div>
    )
}
export default RequestInterface
