import { useParams } from 'react-router-dom'
import { fetchChapters, fetchProject, forkProject, checkForkDone, getContributors } from '../../utils/apiUtils'
import { Link } from 'react-router-dom'
import emilySearchDoodle from '../../assets/emily-doodle.jpeg'
import deBonaparte from '../../assets/deBonaparte.jpg'
import { useEffect, useState } from 'react'
import Loader from '../Loaders/Loader'
import { toast } from 'react-toastify'
import getDate from '../../utils/getDate'
import getUserDetails from '../../utils/getUserDetails'
import forkIcon from '../../assets/fork-icon.png'
import forkedIcon from '../../assets/forked.png'
import UserInfoCard from '../UserInfoCard'
import { showProfileImage } from '../../utils/getProfileImage'

function ProjectInterface() {
    const [project, setProject] = useState(null)
    const [projOwnerImg, setProjOwnerImg] = useState(null)
    const [chapters, setChapters] = useState([])
    const [contributers, setContributers] = useState(null)
    const [fork, setFork] = useState(false)
    const { projectID } = useParams()
    const userID = getUserDetails("userID")

    useEffect(() => {
        const username = getUserDetails('userName')
        fetchProject(projectID)
            .then(response => {
                setProject(response.data)
                showProfileImage(response.data.projectOwner, setProjOwnerImg)
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
        fetchChapters(projectID)
            .then(response => {
                setChapters(response.data)
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
        getContributors(projectID)
            .then(response => setContributers(response.data))
            .catch(error => {
                console.log("Error fetching the contributors list:", error)
                toast.error("Could not fetch Contributors. Try again later.")
            })
        const checkForkedHelper = async () => {
            const forked = await checkForked(projectID);
            setFork(forked);
        };
        checkForkedHelper();
    }, [])

    const handleFork = () => {
        const currDate = getDate()
        const chapters = project.chapters
        const data = {
            dateCreated: currDate,
            chapters: chapters
        }
        forkProject(userID, projectID, data)
            .then(response => {
                setFork(true)
                toast.success("Forked!")
                console.log(response.data)
            })
            .catch(error => {
                toast.error("Failed to fork. Try some time later")
                console.log(error)
            })
    }

    const checkForked = async (projectID) => {
        const userID = getUserDetails("userID")
        if (fork == true) {
            return true
        }
        try {
            const response = await checkForkDone(projectID, userID)
            if (response.status === 200) {
                return true
            }
            else if (response.status === 404) {
                return false
            }
        }
        catch (error) {
            console.log("Not forked")
            return false
        }
    }

    return (
        project ?
            <>
                <header className="sticky top-0 w-full flex justify-between bg-[#3F5F4F] p-3 lg:p-5 items-center shadow-lg">
                    <div className="text-white flex justify-center items-center">
                        {/* <img src={projOwnerImg && projOwnerImg} alt="" className='w-14 lg:w-[60px] lg:h-[60px] rounded-full' /> */}
                        <h3 className='lg:block hidden ml-1.5 lg:ml-5 lg:text-base text-sm '>{project.projectOwnerName} / </h3>
                        <h3 className='lg:text-base text-[12px] lg:ml-0 ml-3'>{project.title}</h3>
                    </div>
                    <div className="text-white lg:text-base text-[12px] ">
                        <Link to={`/userAccount/${userID}`}><UserInfoCard /></Link>
                    </div>
                </header>
                <div className='py-8 px-10'>
                    <div className='lg:flex items-center justify-between'>
                        <div className='lg:flex items-center'>
                            <h1 className='text-2xl font-bold text-slate-800 mr-3'>{project && project.title}</h1>
                            <button className='bg-[#97D4A6] py-1.5 px-3 mr-5 rounded text-[12px] lg:text-sm lg:mt-0 mt-3'>6 Branches</button>
                            <div className='text-[12px] lg:mt-0 mt-3 lg:block flex items-center'>
                                {project.tags && project.tags.map(tag => <button key={tag} className="bg-gray-200 py-1.5 px-1.5 lg:px-3 rounded text-gray-900 lg:text-sm mr-5">{tag}</button>)}
                            </div>
                            <button className='bg-[#3F5F4F] py-1.5 px-3 rounded text-gray-100 text-[12px] lg:text-sm lg:mt-0 mt-3'>{project.status}</button>
                        </div>
                        <button>
                            {fork ?
                                <button className='flex items-center justify-between border bg-gray-100 py-1.5 px-3 rounded lg:mt-0 mt-3' disable>
                                    <p className='text-[12px] lg:text-[15px] lg:mt-0 text-semibold text-[#3F5F4F] mr-1.5'>Forked</p>
                                    <img className="w-[15px] lg:w-[25px]" src={forkedIcon} alt="forked" />
                                </button>
                                :
                                <button className='flex border bg-gray-100 py-1.5 px-3 rounded lg:mt-0 mt-3' onClick={() => handleFork()}>
                                    <p className='text-[12px] lg:text-[15px] lg:mt-0 text-semibold text-[#3F5F4F] mr-1.5'>Fork</p>
                                    <img className="w-[15px] lg:w-[25px]" src={forkIcon} alt="fork_it" />
                                </button>}
                        </button>
                    </div>
                    <div className='flex items-center py-3 px-5 lg:py-5 lg:px-8 bg-[#97D4A6] mt-8 text-slate-900 text-[13px] lg:text-sm rounded '>Shubham Thakur updated 8 months ago</div>
                    <div className='lg:flex mt-3 justify-between'>
                        <div className='w-full'>
                            {project.chapters.length > 0 ?
                                <div>
                                    {chapters.map((chapter, index) => (
                                        <Link to={`/chapter/${project.title}/${chapter._id}`}>
                                            <div className='flex items-center py-3 px-3 lg:py-5 lg:px-8 bg-gray-100 border border-gray-300 mt-3 w-full text-slate-900 text-[13px] lg:text-sm rounded'>
                                                <p className='mr-8'>{index + 1}.</p>
                                                <p>{chapter.title}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                :
                                <div className='flex justify-center items-center flex-col text-center text-gray-700 mt-10'>
                                    <img src={emilySearchDoodle} alt="No Chapters yet" className='w-[200px] rounded' />
                                    <p className='mt-5'>No Chapters yet!</p>
                                </div>
                            }
                        </div>
                        <div className='lg:w-[40vw]'>
                            <div className='h-fit bg-[#97D4A6] rounded p-3 lg:p-5 lg:m-3 mt-3'>
                                <h3 className='font-bold text-sm lg:text-lg'>About</h3>
                                <p className='text-[13px] lg:text-sm rounded mt-1.5 lg:mt-3'>{project.description && project.description}</p>
                            </div>
                            <div className='h-fit bg-gray-100 border border-gray-300 rounded p-3 lg:p-5 lg:m-3 mt-3'>
                                <h3 className='font-bold text-sm lg:text-lg'>Contributors</h3>
                                <p className='text-[13px] lg:text-sm rounded mt-3 text-slate-600' title="View Profile ->">{contributers && contributers.map(contributer => <div className='hover:underline cursor-pointer'>{contributer.username}</div>)}</p>
                            </div>
                        </div>
                    </div>
                    <hr className='mt-8 mb-1.5 text-justify' />
                    <p className='text-[11px] lg:text-[13px] text-gray-500 text-center'>You can fork the project using the button on the top right. Start contributing and produce some memorable pieces here at Renaissance!</p>
                </div>
            </>

            : <Loader />
    )
}

export default ProjectInterface
