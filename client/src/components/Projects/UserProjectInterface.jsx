import UserInfoCard from '../UserInfoCard'
import { fetchChapters, getContributors, fetchProject, deleteProject, updateProject } from '../../utils/apiUtils'
import emilySearchDoodle from '../../assets/emily-doodle.jpeg'
import deBonaparte from '../../assets/deBonaparte.jpg'
import Loader from '../Loaders/Loader'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { showProfileImage } from '../../utils/getProfileImage'
import getUserDetails from '../../utils/getUserDetails'

function UserProjectInterface() {
    const { projectID } = useParams()
    const [userID, setUserID] = useState(null)
    const [projOwnerImg, setProjOwnerImg] = useState(null)
    const [project, setProject] = useState(null)
    const [contributers, setContributers] = useState(null)
    const [chapters, setChapters] = useState(null)
    const [isUpdate, setIsUpdate] = useState(false)
    const [changes, setChanges] = useState({ title: "", description: "" })
    useEffect(() => {
        const userID = getUserDetails('userID')
        setUserID(userID)
        fetchProject(projectID)
            .then(response => {
                setProject(response.data)
                showProfileImage(response.data.projectOwner, setProjOwnerImg)
                return fetchChapters(response.data._id)
            })
            .then(response => {
                setChapters(response.data)
            })
            .catch(error => console.log(error))
        getContributors(projectID)
            .then(response => setContributers(response.data))
            .catch(error => {
                console.log("Error fetching the contributors list:", error)
                toast.error("Could not fetch Contributors. Try again later.")
            })
    }, [])

    const isAnyFieldNotEmpty = (object) => {
        return Object.keys(object).some(key => object[key] !== '');
    }

    const handleDeleteProject = () => {
        deleteProject(projectID)
            .then(response => {
                toast.success("Project Deleted.")
            })
            .catch(error => {
                console.log(error)
                toast.error("Something wrong happened. Try again later")
            })
    }

    const handleUpdate = () => {
        const data = changes;
        if (!isAnyFieldNotEmpty(data)) {
            toast.error("Fill all fields")
            return;
        }
        updateProject(projectID, data)
            .then(response => {
                toast.success("Project Updated.")
            })
            .catch(error => {
                console.log(error)
                toast.error("Something wrong happened. Try again later")
            })
    }
    return (
        project && chapters ?
            <div>
                <header className="sticky top-0 w-full flex justify-between bg-[#3F5F4F] p-3 lg:p-5 items-center shadow-lg">
                    <div className="text-white flex justify-center items-center">
                        <img src={projOwnerImg && projOwnerImg} alt="" className='w-14 lg:w-[60px] lg:h-[60px] rounded-full' />
                        <h3 className='lg:block hidden ml-1.5 lg:ml-5 lg:text-base text-sm '>{project.projectOwnerName} / </h3>
                        <h3 className='lg:text-base text-[12px] lg:ml-0 ml-3'>{project.title}</h3>
                    </div>
                    <div className="text-white lg:text-base text-[12px] ">
                        <Link to={`/userAccount/${userID}`}><UserInfoCard /></Link>
                    </div>
                </header>
                <div className='py-8 px-8 lg:px-10'>
                    <div className='lg:flex items-center justify-between'>
                        <div className='lg:flex items-center'>
                            <h1 className='text-2xl font-bold text-slate-800 mr-3'>{project && project.title}</h1>
                            <button className='bg-[#97D4A6] py-1.5 px-3 mr-5 rounded text-[12px] lg:text-sm lg:mt-0 mt-3'>6 Branches</button>
                            <div className='text-[12px] lg:mt-0 mt-3 lg:block flex items-center'>
                                {project.tags && project.tags.map(tag => <button key={tag} className="bg-gray-200 py-1.5 px-1.5 lg:px-3 rounded text-gray-900 lg:text-sm mr-5">{tag}</button>)}
                            </div>
                            <button className='bg-[#3F5F4F] py-1.5 px-3 rounded text-gray-100 text-[12px] lg:text-sm lg:mt-0 mt-3'>{project.status}</button>
                        </div>
                    </div>
                    <div className='flex items-center py-3 px-5 lg:py-5 lg:px-8 bg-[#97D4A6] mt-8 text-slate-900 text-[13px] lg:text-sm rounded '>Shubham Thakur updated 8 months ago</div>
                    <div className='lg:flex mt-3 justify-between'>
                        <div className='w-full'>
                            <div className='lg:flex justify-between items-center mt-5'>
                                <input type="text" className='border border-gray-300 rounded px-2 py-1.5 h-fit text-sm mr-5 bg-gray-100 w-full lg:w-[400px] xl:w-[500px]' placeholder='Search chapter here' />
                                <div className='flex'>
                                    <Link to={`/newChapter/${project.title}/${null}/${project._id}/true`}>`<button className="bg-[#3F5F4F] text-[12px] xl:text-sm text-white lg:mt-0 mt-3 px-2 xl:px-3 py-1.5 rounded mr-1.5">Add Chapter</button>`</Link>
                                    <button className="border border-[#3F5F4F] text-[12px] xl:text-sm text-[#3F5F4F] px-2 xl:px-3 py-1.5 rounded lg:mt-0 mt-3 ">Create Branch</button>
                                </div>
                            </div>
                            {project.chapters.length ?
                                <div className='mt-5 lg:mt-0'>
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
                        <div className='w-full lg:w-[40vw]'>
                            <div className='flex mt-5 lg:ml-3'>
                                <button className="bg-[#3F5F4F] border border-[#3F5F4F] h-fit text-[12px] xl:text-sm text-white px-2 xl:px-3 py-1.5 rounded" onClick={() => setIsUpdate(!isUpdate)}>Update Project</button>
                                <button className="bg-red-200 h-fit text-[12px] xl:text-sm border border-red-500 text-sm text-red-700 px-2 xl:px-3 py-1.5 rounded ml-5" onClick={() => handleDeleteProject()}>Delete Project</button>
                            </div>
                            {isUpdate &&
                                <div className='h-fit bg-gray-100 border border-gray-300 rounded p-5 mt-3 lg:m-3'>
                                    <h3 className='text-lg font-bold text-slate-700 lg:ml-3 mb-5'>Update Title & Description</h3>
                                    <input className='py-1.5 px-5 w-full rounded text-sm mb-3 border' onChange={(e) => setChanges(prevChanges => ({ ...prevChanges, title: e.target.value }))} placeholder="Enter new title" />
                                    <textarea className='py-1.5 px-5 w-full rounded text-sm border' onChange={(e) => setChanges(prevChanges => ({ ...prevChanges, description: e.target.value }))} placeholder="Enter new description" />
                                    <button type="button" className="bg-slate-700 text-[12px] px-5 py-1.5 mt-3 rounded text-slate-100" onClick={() => handleUpdate()}>Save Changes</button>
                                </div>}
                            <div className='h-fit bg-[#97D4A6] rounded p-5 mt-3 lg:m-3'>
                                <h3 className='font-bold text-lg'>About</h3>
                                <p className='text-sm rounded mt-3'>{project.description && project.description}</p>
                            </div>
                            <div className='h-fit bg-gray-100 border border-gray-300 rounded p-5 mt-3 lg:m-3'>
                                <h3 className='font-bold text-lg'>Contributors</h3>
                                <p className='text-[12px] lg:text-sm rounded mt-3 text-slate-600' title="View Profile ->">{contributers && contributers.map(contributer => <div className='hover:underline cursor-pointer'>{contributer.username}</div>)}</p>
                            </div>
                        </div>
                    </div>
                    <hr className='mt-8 mb-1.5 text-justify' />
                    <p className='text-[12px] lg:text-[13px] text-gray-500'>Hope you're having fun at our website. Just a tiny bit of information that this project is your own. You possess the power to add or update chapters here. If you select it to be open then many other contributers would be able to contribute to it. Once they're done they can send you a request to merge their chapters here. You can accept or reject the requests in your profile section. Cheers!</p>
                </div>
            </div>
            : <Loader />
    )
}

export default UserProjectInterface
