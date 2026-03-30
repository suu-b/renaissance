import { useParams } from 'react-router-dom'
import { fetchProject, fetchUserChapters, getFork, fetchChapters } from '../../utils/apiUtils'
import { Link } from 'react-router-dom'
import emilySearchDoodle from '../../assets/emily-doodle.jpeg'
import deBonaparte from '../../assets/deBonaparte.jpg'
import upload from '../../assets/upload.png'
import { useCallback, useEffect, useState } from 'react'
import Loader from '../Loaders/Loader'
import getUserDetails from '../../utils/getUserDetails'
import UploadChapter from '../Chapters/UploadChapter'
import { showProfileImage } from '../../utils/getProfileImage'
import UserInfoCard from '../UserInfoCard'

function ForkedProjectInterface() {
    const { forkID } = useParams()
    const [projectID, setProjectID] = useState()
    const [forkedProject, setForkedProject] = useState(null)
    const [projOwnerImg, setProjOwnerImg] = useState(null)
    const [originalProject, setOriginalProject] = useState(null)
    const [chapters, setChapters] = useState(null)
    const [originalChapters, setOriginalChapters] = useState(null)
    const [isUploadChapter, setUploadChapter] = useState(false)
    const username = getUserDetails('userName')

    const fetchDataForThePage = useCallback(() => {
        const userID = getUserDetails('userID')
        if (projectID) {
            fetchProject(projectID)
                .then(response => {
                    setOriginalProject(response.data)
                    showProfileImage(response.data.projectOwner, setProjOwnerImg)
                })
                .catch(error => {
                    console.log("Error fetching the original project", error)
                })
            fetchChapters(projectID)
                .then(response => {
                    setOriginalChapters(response.data)
                })
                .catch(error => {
                    if (error.response) {
                        toast.error("Some error occurred fetching the project. Try again later.")
                    }
                    else {
                        console.log("Some error occurred. Try Again Later", error)
                        toast.error("Some error occurred fetching the project. Try again later.")
                    }
                })
            fetchUserChapters(forkID, userID)
                .then(response => {
                    setChapters(response.data)
                })
                .catch(error => {
                    if (error.response) {
                        console.log("Error fetching data", error.response.data)
                    }
                    else {
                        console.log("Some error occurred. Try Again Later", error)
                    }
                })
        }
    }, [projectID, forkID]
    )

    useEffect(() => {
        getFork(forkID)
            .then(response => {
                setProjectID(response.data.projectID)
                setForkedProject(response.data)
            })
            .catch(error => {
                console.log("Error fetching the fork", error)
            })
    }, [])

    useEffect(() => {
        fetchDataForThePage()
    }, [fetchDataForThePage])

    return (
        originalProject ?
            <>
                <header className="sticky top-0 w-full flex justify-between bg-[#3F5F4F] p-3 lg:p-5 items-center shadow-lg">
                    <div className="text-white flex justify-center items-center">
                        <img src={projOwnerImg && projOwnerImg} alt="" className='w-14 lg:w-[60px] lg:h-[60px] rounded-full' />
                        <h3 className='lg:block hidden ml-1.5 lg:ml-5 lg:text-base text-sm'>{originalProject.projectOwnerName} / </h3>
                        <h3 className='lg:text-base text-[12px] lg:ml-0 ml-3'>{originalProject.title}</h3>
                    </div>
                    <div className="text-white"><UserInfoCard /></div>
                </header>
                <div className='py-8 px-10'>
                    <div className='lg:flex items-center justify-between'>
                        <div className='lg:flex items-center'>
                            <h1 className='text-2xl font-bold text-slate-800 mr-3'>{originalProject && originalProject.title}</h1>
                            <button className='bg-[#97D4A6] py-1.5 px-3 mr-5 rounded text-[12px] lg:text-sm lg:mt-0 mt-3'>6 Branches</button>
                            <div className='text-[12px] lg:mt-0 mt-3 lg:block flex items-center'>
                                {originalProject.tags && originalProject.tags.map(tag => <button key={tag} className="bg-gray-200 py-1.5 px-1.5 lg:px-3 rounded text-gray-900 lg:text-sm mr-5">{tag}</button>)}
                            </div>
                            <button className='bg-[#3F5F4F] py-1.5 px-3 rounded text-gray-100 text-[12px] lg:text-sm lg:mt-0 mt-3'>{originalProject.status}</button>
                        </div>
                    </div>
                    <div className='flex items-center py-3 px-5 lg:py-5 lg:px-8 bg-[#97D4A6] mt-8 text-slate-900 text-[13px] lg:text-sm rounded '>Shubham Thakur updated 8 months ago</div>
                    <div className='lg:flex mt-3 justify-between'>
                        <div className='w-full'>
                            <div className='lg:flex justify-between items-center mt-5'>
                                <input type="text" className='border border-gray-300 rounded px-2 py-1.5 h-fit text-sm mr-5 bg-gray-100 w-full lg:w-[300px] xl:w-[500px]' placeholder='Search chapter here' />
                                <div className='flex lg:mt-0 mt-3 '>
                                    <Link to={`/newChapter/${originalProject.title}/${forkID}/${originalProject._id}/false`}>`<button className="bg-[#3F5F4F] text-[12px] xl:text-sm text-white px-2 xl:px-3 py-1.5 rounded mr-1.5 ">Add Chapter</button>`</Link>
                                    <button className="border border-[#3F5F4F] text-[12px] xl:text-sm text-[#3F5F4F] px-2 xl:px-3 py-1.5 rounded">Create Branch</button>
                                </div>
                            </div>
                            {originalChapters &&
                                <div className='lg:mt-0 mt-8'>
                                    {originalChapters && originalChapters.map((chapter, index) => (
                                        <div className={`flex items-center justify-between py-3 px-3 lg:py-5 lg:px-8 mt-3 w-full text-slate-900 text-sm rounded ${chapter.isApproved ? 'border border-gray-300 bg-gray-100' : 'bg-[#c5e8ce] border border-[#97D4A6]'}`}>
                                            <div className='flex items-center'>
                                                <p className='mr-8'>{index + 1}.</p>
                                                <Link to={`/chapter/${originalProject.title}/${chapter._id}`}><p>{chapter.title}</p></Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>}
                            {forkedProject.chapters && forkedProject.chapters.length ?
                                <div>
                                    {chapters && chapters.map((chapter, index) => (
                                        !chapter.isApproved &&
                                        <div className={`flex items-center justify-between py-3 px-3 lg:py-5 lg:px-8 mt-3 w-full text-slate-900 text-sm rounded ${chapter.isApproved ? 'border border-gray-300 bg-gray-100' : 'bg-[#c5e8ce] border border-[#97D4A6]'}`}>
                                            <div className='flex items-center'>
                                                <p className='mr-8'>{index + 1}.</p>
                                                <Link to={`/chapter/${originalProject.title}/${chapter._id}`}><p>{chapter.title}</p></Link>
                                            </div>
                                            <div>
                                                <img src={upload} alt="" className='w-[25px] cursor-pointer' onClick={() => setUploadChapter(true)} />
                                                {isUploadChapter && <UploadChapter projectID={projectID} chapterID={chapter._id} userID={originalProject.projectOwner} contributerName={username} projectName={originalProject.title} setUploadChapter={setUploadChapter} />}
                                            </div>
                                        </div>

                                    ))}
                                </div>
                                :
                                <div className='flex justify-center items-center flex-col text-center text-gray-700 mt-10'>
                                    <img src={emilySearchDoodle} alt="No Chapters yet" className='w-[200px] rounded' />
                                    <p className='mt-5'>No Chapters yet!</p>
                                </div>
                            }
                        </div>
                        <div className='w-full lg:w-[500px] h-fit bg-[#97D4A6] rounded p-5 lg:p-8 mt-3 lg:m-3'>
                            <h3 className='font-bold text-sm lg:text-lg'>About</h3>
                            <p className='text-[13px] lg:text-sm rounded mt-3'>{originalProject.description && originalProject.description}</p>
                        </div>
                    </div>
                    <hr className='mt-8 mb-1.5 text-justify' />
                    <p className='text-[11px] lg:text-[13px] text-gray-500 text-center'>Don't keep forking it. Just dive in and contribute to produce something great!</p>
                </div>
            </>
            : <Loader />
    )
}

export default ForkedProjectInterface
