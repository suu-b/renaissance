import React, { useEffect } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOneUser, fetchUserProjects } from '../../utils/apiUtils'
import Requests from './Requests'
import MyProfile from './MyProfile'
import { showProfileImage } from '../../utils/getProfileImage'
import UserStats from '../UserStats'
import getUserDetails from '../../utils/getUserDetails'
import { Link } from 'react-router-dom'
function Account({ setLogin, isLogin }) {
    const [isOverview, setIsOverview] = useState(true)
    const [isProjects, setIsProjects] = useState(false)
    const [isContacts, setIsContacts] = useState(false)
    const [isRequests, setIsRequests] = useState(false)
    const [isProfile, setIsProfile] = useState(false)
    const [userProjects, setUserProject] = useState([])
    const [imgURL, setImgURL] = useState("")
    const [userData, setUserData] = useState([])
    const { userID } = useParams()
    const loggedUserID = getUserDetails('userID')
    const toggleModal = (setter) => {
        setIsOverview(false)
        setIsContacts(false)
        setIsProjects(false)
        setIsRequests(false)
        setIsProfile(false)
        setter(true)
    }

    useEffect(() => {
        showProfileImage(userID, setImgURL)
        getOneUser(userID)
            .then(response => {
                console.log(response.data)
                setUserData(response.data)
            })
            .catch(error => console.log(error))
        fetchUserProjects(userID)
            .then(response => setUserProject(response.data))
            .catch(error => console.log(error))
    }, [])

    return (
        <div className='flex lg:flex-row flex-col justify-between'>
            <div className='w-full lg:w-[30%] bg-gray-100 lg:px-5 p-3 lg:py-8 border border-gray-300 h-fit lg:h-[100vh]'>
                <img src={imgURL && imgURL} alt="profileImage" className='rounded-full mx-auto h-[100px] w-[100px] lg:h-[200px] lg:w-[200px] xl:h-[350px] xl:w-[350px]' />
                <div className='pt-3 lg:pt-5'>
                    <h1 className='text-xl text-2xl font-bold text-center'>{userData.username}</h1>
                    <div className='flex justify-center'>
                        {userData.occupations && userData.occupations.map(occ => (
                            <p className='py-1.5 m-3 px-3 bg-[#97D4A6] w-fit rounded text-[12px] lg:text-sm mt-3'>{occ}</p>
                        ))}
                    </div>
                </div>
                <div className='mt-3'>
                    <p className='text-sm text-slate-700 w-fit text-justify'>
                        {userData.bio || "Hi! I appreciate art and would love to contribute and collaborate. :D"}
                    </p>
                </div>
            </div>
            <div className='w-fit lg:w-[65%] mt-8 mx-1.5 lg:mx-8'>
                <div className={`flex justify-between ${(loggedUserID === userID) ? 'lg:w-[70%] w-full ' : 'xl:w-[30%] lg:w-[40%]'} lg:text-base text-[13px]`}>
                    <button className={isOverview ? `linkFocus` : `linkHover`} onClick={() => toggleModal(setIsOverview)}>Overview</button>
                    <button className={isProjects ? `linkFocus` : `linkHover`} onClick={() => toggleModal(setIsProjects)} >Projects</button>
                    <button className={isContacts ? `linkFocus` : `linkHover`} onClick={() => toggleModal(setIsContacts)}>Contacts</button>
                    {loggedUserID === userID && <button className={isRequests ? `linkFocus` : `linkHover`} onClick={() => toggleModal(setIsRequests)}>Requests</button>}
                    {loggedUserID === userID && <button className={isProfile ? `linkFocus` : `linkHover`} onClick={() => toggleModal(setIsProfile)}>My Profile</button>}
                </div>
                {isOverview &&
                    <div className='py-10 px-8 bg-gray-100 rounded border border-gray-300 mt-10'>
                        <h1 className='text-2xl font-bold text-slate-700'>Overview</h1>
                        <p className='text-justify text-sm text-slate-700 mt-3'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. In voluptate vel, necessitatibus cum omnis, quas ullam voluptates nemo reprehenderit suscipit similique blanditiis eos iste. Veritatis minima omnis a nemo rem?</p>
                        {/* {isLogin && <Link to={`/EnterRoom/667d1dbb8bd2f22267f50746`} className='bg-[#97D4A6] rounded py-1.5 px-3 mt-5 text-[13px]'>Join room</Link>} */}
                        <h1 className='text-2xl font-bold text-slate-700 mt-8'>Statistics</h1>
                        <UserStats />
                    </div>
                }
                {isProjects &&
                    <div className='py-10 px-8 bg-gray-100 rounded border border-gray-300 mt-10'>
                        <h1 className='text-2xl font-bold text-slate-700'>Projects</h1>
                        <p className='text-justify text-sm text-slate-400 mt-1.5'>Discover all of the projects here. Read and contribute.</p>
                        {userProjects && userProjects.map(project => (
                            <div className='bg-[#97D4A6] rounded py-3 px-5 my-3'>{project.title}</div>
                        ))}
                    </div>
                }
                {isContacts &&
                    <div className='py-10 px-8 bg-gray-100 rounded border border-gray-300 mt-10'>
                        <h1 className='text-2xl font-bold text-slate-700'>Contacts</h1>
                        <p className='text-justify text-sm text-slate-400 mt-1.5'>Contact the organization through here:</p>
                        <div className='text-[15px] text-slate-600 mt-10'>
                            <p>New Delhi, India</p>
                            <p>Contact - 9876544173</p>
                            <p>Questions? mail at thakur@gmail.com</p>
                        </div>
                    </div>
                }
                <div className='mt-5 lg:mt-10'>{(isRequests && loggedUserID === userID) &&
                    <Requests userID={userID} />}
                </div>
                {
                    (isProfile && loggedUserID === userID) &&
                    <MyProfile userID={userID} setLogin={setLogin} isLogin={isLogin} />
                }
            </div>
        </div>
    )
}
export default Account
