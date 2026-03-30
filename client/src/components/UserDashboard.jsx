import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { fetchUserProjects, fetchLatestProjects, fetchProjects, getForkedProject, fetchProject, getFork } from '../utils/apiUtils'
import { Link } from 'react-router-dom'
import { getDisplayPicture } from '../utils/getAccountDP'
import searchIcon from '../assets/search-icon.png'
import deVanGoghDoodle from '../assets/van-gogh.png'
import keatsDoodle from '../assets/keats-doodle.jpeg'
import Loader from './Loaders/Loader'
import getUserDetails from '../utils/getUserDetails'
import SocialBar from './SocialBar'
import UserStats from './UserStats'
import { showProfileImage } from '../utils/getProfileImage'
import menu from '../assets/menu.png'
import Sidebar from './Sidebar'
import { ClipLoader } from 'react-spinners'

function UserDashboard() {
    const [userProjects, setUserProjects] = useState([])
    const [latestProjects, setLatestProjects] = useState([])
    const [forkedProjects, setForkedProjects] = useState([])
    const [userImg, setUserImg] = useState(null)
    const [projects, setProjects] = useState(null)
    const [allTags, setTags] = useState([])
    const [username, setUserName] = useState("")
    const exploreRef = useRef()
    const [filter, setFilter] = useState({ filterVal: "All", filteredProjects: [] })
    const [isExpand, setIsExpand] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [projectImages, setProjectImages] = useState({});



    useEffect(() => {
        const userID = getUserDetails('userID')
        setUserName(getUserDetails("userName"))
        showProfileImage(userID, setUserImg)
        fetchLatestProjects(userID)
            .then(response => {
                console.log(response.data)
                setLatestProjects(response.data)
            })
            .catch(error => {
                if (error.response) {
                    console.log(error.response.data)
                }
                else {
                    console.log("Some error occurred. Try Again Later", error)
                }
            })

        fetchUserProjects(userID)
            .then(response => {
                setUserProjects(response.data)
                console.log("Fetched Data: ", response.data)
            })
            .catch(error => {
                if (error.response) {
                    console.log(error.response.data)
                }
                else {
                    console.log("Some error occurred. Try Again Later", error)
                }
            })

        getForkedProject(userID)
            .then(async response => {
                const arr = []
                console.log(response.data)
                for (const forkID of response.data) {
                    try {
                        let resp = await getFork(forkID)
                        resp = await fetchProject(resp.data.projectID)
                        console.log("forks", resp.data)
                        arr.push({ title: resp.data.title, id: forkID })
                    }
                    catch (error) {
                        console.log(error)
                    }
                }
                setForkedProjects(arr)
            })
            .catch(error => {
                console.log(error)
            })

        fetchProjects()
            .then(response => {
                setFilter(prevFilter => ({
                    ...prevFilter,
                    filteredProjects: response.data
                }))
                setProjects(response.data)
                extractAllTags(response.data)
                console.log("Fetched Data: ", response.data)
            })
            .catch(error => {
                if (error.response) {
                    console.log(error.response.data)
                }
                else {
                    console.log("Some error occurred. Try Again Later", error)
                }
            })

        if (window.innerWidth <= 768) setIsMobile(true)
        else setIsExpand(true)
    }, [])

    useEffect(() => {
        const fetchImages = async () => {
            const imageMap = {}
            for (const project of projects) {
                const url = await getDisplayPicture(project.projectOwner)
                imageMap[project.projectOwner] = url
            }
            setProjectImages(imageMap)
        }
        fetchImages()
    }, [projects])

    const filterProjects = useMemo(() => {
        if (filter.filterVal === "All") {
            return projects
        }
        else {
            return projects.filter(project => project.tags.includes(filter.filterVal))
        }
    }, [filter.filterVal])

    useEffect(() => {
        setFilter(prevFilter => ({
            ...prevFilter,
            filteredProjects: filterProjects
        }))
    }, [filterProjects])

    const extractAllTags = useCallback((projects) => {
        const setOfTags = new Set()
        projects.forEach(project => {
            project.tags.forEach(tag => setOfTags.add(tag))
        })
        setTags(Array.from(setOfTags))
    }, [])

    const scrollToExplore = () => {
        exploreRef.current.scrollIntoView({ behavior: "smooth" })
    }

    return (
        projects ?
            <>
                {isExpand && isMobile && <div className='fixed top-0 left-0 w-full h-full bg-black opacity-60 z-[80] shadow-xl' />}
                <div className={'lg:flex'}>
                    <div className='fixed lg:static lg:hidden block p-3 top-[10px] rounded-full left-[10px] bg-slate-800 z-50 cursor-pointer' onClick={() => setIsExpand(!isExpand)}>
                        <img src={menu} alt="open-sidebar" className='w-[28px]' />
                    </div>
                    <Sidebar setExpand={setIsExpand} isExpand={isExpand} username={username} userProjects={userProjects} forkedProjects={forkedProjects} />
                    <div className='bg-[#F4F4F4] w-full m-0 xl:w-[81%] lg:w-[75%] xl:ml-[19%] lg:ml-[25%] p-0 px-10 pt-20'>
                        <form className='lg:shadow-xl pt-3'>
                            <input type="text" placeholder="Search Here" className="lg:my-0 lg:pl-[80px] px-3 py-1.5 lg:pl-3 lg:py-1.5 text-[15px] w-[70vw] lg:w-[400px] lg:absolute left-[280px] rounded-3xl border-transparent" />
                            <button className="z-[10] absolute bg-[#3F5F4F] border-solid border-[#3F5F4F] border-2 py-1.5 px-3 left-[70vw] lg:left-[650px] rounded-3xl rounded-l-none" ><img src={searchIcon} className='w-[16.5px]' /></button>
                        </form>
                        <h1 className='font-bold text-3xl lg:mt-[70px] mt-[30px]'>Dashboard</h1>
                        <p className='mt-1.5 text-sm'>Explore new projects and create your own too!</p>

                        <div className='bg-[#97D4A6] mt-5 w-full h-[120px] lg:h-[150px] rounded relative py-3 px-3 lg:py-5 lg:px-5'>
                            <h1 className='text-base lg:text-3xl font-bold'>Hey! Let's see your <span className='text-[#3F5F4F]'> Stats</span></h1>
                            <UserStats />
                            <img src={deVanGoghDoodle} alt="van-gogh" className='lg:block hidden w-[200px] absolute right-0 top-[-50px]' />
                            <div className='lg:block hidden  bg-white bg-opacity-70 xl:w-[300px] lg:w-[270px] absolute right-[160px] lg:top-[45%] xl:top-[10%] rounded lg:text-[10px] xl:text-sm text-slate-700 lg:py-1.5 xl:py-3 px-5'>Great things are not done by impulse, but by a series of small things brought together. <div className='mt-3'>- Vincent Van Gogh </div></div>
                        </div>
                        <hr className="mt-5" />
                        <h1 className='font-bold text-xl lg:text-2xl mt-3 lg:mt-8'>Your Latest Projects</h1>
                        <Link to={'/NewProject'}><button className="bg-[#3F5F4F] text-slate-100 text-[12px] xl:text-sm border-solid border-[#3F5F4F] my-5 rounded border-2 py-1.5 px-3" >Add a new Project</button></Link>
                        <button className="text-[#3F5F4F] font-semibold text-[12px] xl:text-sm border-solid border-[#3F5F4F] mx-3 my-5 rounded border py-1.5 px-3" onClick={scrollToExplore}>Contribute</button>
                        <div className='flex flex-wrap'>
                            {latestProjects.length ? latestProjects.map(project => (
                                <div className='bg-white m-1.5 xl:m-3 rounded-xl xl:w-[30%] lg:w-[32%] lg:w-[30%] xl:px-5 px-3 py-3 lg:py-5 xl:py-8 shadow-lg flex flex-col justify-center'>
                                    <div className='flex'>
                                        <img src={userImg && userImg} alt="user-image" className='rounded-full w-[80px] h-[80px] xl:w-20 lg:w-14  lg:h-14 xl:h-20 shadow-lg' />
                                        <div className='p-3'>
                                            <h1 className='font-bold text-[12px] xl:text-lg'>{username}</h1>
                                            <p className='text-slate-700 text-[10px] xl:text-[12px]'>Creative Writer, Author, Director</p>
                                        </div>
                                    </div>
                                    <h1 className='text-sm lg:text-base font-bold mt-5'>{project.title}</h1>
                                    <p className='text-[12px] lg:text-sm text-slate-700'>{project.description}</p>
                                </div>
                            ))
                                :
                                <div className='m-auto'><img src={keatsDoodle} alt="AddSomeProjects" className='w-[200px] rounded' /> <p className='text-sm mt-5'>There are no projects to show!</p></div>}

                        </div>
                        <hr className="mt-5" />
                        <div className='flex justify-between items-center mt-8 mb-5' ref={exploreRef}>
                            <h1 className='font-bold text-2xl'>Explore</h1>
                            <div className='flex'>
                                <select className='lg:py-0.5 lg:px-3 p-1.5 rounded h-fitlg:text-base text-[11px]' onChange={(e) => setFilter(prevFilter => ({
                                    ...prevFilter, filterVal: e.target.value
                                }))}>
                                    <option value='All'>All</option>
                                    {allTags.map(tag => <option className="lg:text-base text-[11px]" value={tag}>{tag}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            {filter.filteredProjects && filter.filteredProjects.map(project => (
                                <div className='bg-white m-3 rounded-xl px-5 py-8 shadow-lg flex lg:flex-row flex-col lg:w-auto w-[80vw] items-start justify-between'>
                                    <div>
                                        <div className='flex'>
                                            {projectImages[project.projectOwner] ? <img src={projectImages[project.projectOwner]} alt="profile-picture" className='rounded-full w-20 h-20 shadow-lg' /> : <ClipLoader size={20} className='m-auto' />}
                                            <div className='p-3'>
                                                <h1 className='font-bold text-[14px] xl:text-lg'>{project.projectOwnerName}</h1>
                                                <p className='text-slate-700 text-[10px] xl:text-[12px]'>Creative Writer, Author, Director</p>
                                            </div>
                                            {project.tags.map(tag => (
                                                <button className='hidden lg:block bg-gray-100 w-fit text-[12px] xl:text-[14px] lg:px-1.5 xl:px-3 py-0.5 rounded xl:ml-3 lg:ml-[1.5] h-fit mt-1.5'>{tag}</button>
                                            ))}
                                            <button className='lg:block hidden bg-[#3F5F4F] w-fit h-fit text-[12px] text-[14px] px-3 py-0.5 rounded ml-3 mt-1.5 text-white'>{project.status}</button>
                                        </div>
                                        <button className='block lg:hidden bg-[#3F5F4F] w-fit h-fit text-[12px] text-[12px] px-3 py-0.5 rounded mt-5 mt-3 text-white'>{project.status}</button>
                                        <h1 className='font-bold text-[12px] xl:text-lg mt-1.5 lg:mt-5'>{project.title}</h1>
                                        <p className='text-slate-700 text-[10px] xl:text-[12px]'>{project.description}</p>
                                        <div>
                                            <Link to={`/project/${project._id}`}><button className='bg-[#3F5F4F] w-fit h-fit text-[12px] lg:text-[13px] py-1.5 px-2 lg:px-3 lg:py-1.5 rounded mt-2 text-white' >View Project</button></Link>
                                            <Link to={`/userAccount/${project.projectOwner}`}><button className='text-[#3F5F4F] font-semibold border border-[1.5px] border-[#3F5F4F] text-[12px] lg:text-[13px] py-1.5 px-2 lg:px-3 lg:py-1.5 rounded mt-2 ml-0.5 lg:ml-1.5'>About organisation</button></Link>
                                        </div>
                                    </div>
                                    <SocialBar projectID={project._id} />
                                </div>
                            ))
                            }
                        </div>
                    </div>
                </div></>
            : <Loader />
    )
}
export default UserDashboard

