import ChapterEditor from '../Text-Editor/ChapterEditor'
import deBonaparte from '../../assets/deBonaparte.jpg'
import getDate from '../../utils/getDate'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { postChapter } from '../../utils/apiUtils'
import { toast } from 'react-toastify'
import getUserDetails from '../../utils/getUserDetails'
import { postChapterByOwner } from '../../utils/apiUtils'
import { Link } from 'react-router-dom'
import UserInfoCard from '../UserInfoCard'

function NewChapter() {
    const [chapterName, setChapterName] = useState("New Chapter")
    const [currentDate, setCurrentDate] = useState("")
    const [userName, setUserName] = useState(null)
    const [userID, setUserId] = useState(null)
    const navigate = useNavigate()
    const [content, setContent] = useState("")
    const { projectName, forkID, projectID, isPermit } = useParams()
    useEffect(() => {
        setCurrentDate(getDate())
    }, [])

    const handleSubmit = (e) => {
        const userID = getUserDetails('userID')
        const username = getUserDetails('userName')
        setUserName(username)
        setUserId(userID)
    
        e.preventDefault()
        const data = { title: chapterName, content: content, dateCreated: currentDate, userID: userID }
        console.log(data)
        if (isPermit === 'true') {
            console.log("hi")
            postChapterByOwner(projectID, data)
                .then(response => {
                    console.log("Response", response.data)
                    navigate(-1)
                    toast.success("Chapter posted!")
                })
                .catch(error => {
                    console.log(error.response)
                    toast.error("Something wrong happened. Try again later")
                })
        } else {
            console.log("Hey")
            postChapter(forkID, projectID, data)
                .then(response => {
                    console.log("Response", response.data)
                    navigate(-1)
                    toast.success("Chapter Added!")
                })
                .catch(error => {
                    console.log(error.response)
                    toast.error("Something wrong happened. Try again later")
                })
        }
    }
    return (
        <>
            <header className="sticky top-0 w-full flex justify-between bg-[#3F5F4F] p-3 lg:p-5 items-center shadow-lg">
                <div className="text-white flex justify-center items-center">
                    {/* <img src={deBonaparte} alt="" className='w-14 lg:w-[60px] lg:h-[60px] rounded-full' /> */}
                    <h3 className='lg:block hidden ml-1.5 lg:ml-5 lg:text-base text-sm '>{userName} / </h3>
                    <h3 className='lg:text-base text-[12px] lg:ml-0 ml-3'>{projectName}</h3>
                </div>
                <div className="text-white lg:text-base text-[12px] ">
                    <Link to={`/userAccount/${userID}`}><UserInfoCard /></Link>
                </div>
            </header>
            <form className='py-8 px-8 lg:px-10'
                onSubmit={(e) => handleSubmit(e)}>
                <div className='lg:flex justify-between'>
                    <div>
                        <h1 className='text-3xl lg:text-4xl text-slate-800 font-bold mb-5'>Add A New Chapter</h1>
                        <div className="mt-8">
                            <h1 className='text-lg lg:text-xl text-slate-800 font-bold'>Enter Name</h1>
                            <p className="text-[11px] lg:text-[13.5px] mb-5 mt-1.5 text-slate-600">Enter the name for the project below (in case you wish to change. Otherwise it would remain intact)</p>
                            <input
                                type="text"
                                className='text-sm lg:text-base text-left border border-1.5 bg-gray-100 border-gray-300 rounded py-1.5 px-3 font-semibold text-gray-600'
                                placeholder="New Chapter"
                                value={chapterName}
                                onChange={(e) => setChapterName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className='lg:mt-0 mt-5'>
                        <button className="border-solid border-[#3F5F4F] lg:my-5 lg:ml-3 rounded text-[#3F5F4F] border py-1.5 px-3 text-sm lg:text-base" type='submit'>Commit Locally</button>
                        <button className="bg-[#3F5F4F] text-slate-100 border-solid border-[#3F5F4F] lg:my-5 ml-3 rounded border-2 py-1.5 px-3 text-sm lg:text-base">Push to the project</button>
                    </div>
                </div>
                <hr className='my-5' />
                <div>
                    <h1 className='text-lg lg:text-xl text-slate-800 font-bold'>New Project</h1>
                    <p className="text-[11px] lg:text-[13.5px] mb-5 mt-1.5 text-slate-600">Start writing from here: (in case you wish to change. Otherwise it would remain intact)</p>
                    <div><ChapterEditor setContent={setContent} /></div>
                </div>
            </form>
        </>
    )
}

export default NewChapter
