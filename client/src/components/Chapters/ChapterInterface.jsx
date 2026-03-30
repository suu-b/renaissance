import { useEffect, useState } from 'react'
import { fetchChapter } from '../../utils/apiUtils'
import deBonaparte from '../../assets/deBonaparte.jpg'
import { useParams } from 'react-router-dom'
import ReactHtmlParser from 'html-react-parser'
import Loader from '../Loaders/Loader'
import { Link } from 'react-router-dom'
import getUserDetails from '../../utils/getUserDetails'
import likeButton from '../../assets/like-icon.png'
import likedButton from '../../assets/liked-icon.png'
import shareButton from '../../assets/share-icon.png'
import UserInfoCard from '../UserInfoCard'

function ChapterInterface() {
    const { chapterID, projectName } = useParams()
    const [chapter, setChapter] = useState(null)
    const [userID, setUserId] = useState(null)
    const [userName, setUserName] = useState("")
    const [liked, setLike] = useState(false)

    useEffect(() => {
        const userID = getUserDetails('userID')
        setUserId(userID)
        const username = getUserDetails("userName")
        setUserName(username)
        fetchChapter(chapterID)
            .then(response => {
                setChapter(response.data)
            })
            .catch(error => {
                if (error.response) {
                    console.log("Error fetching data", error.response.data)
                }
                else {
                    console.log("Some error occurred. Try Again Later", error)
                }
            })
    }, [])

    return (
        chapter ?
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
                <div className='py-8 px-10'>
                    <h1 className='text-xl lg:text-2xl font-bold text-slate-800 mr-3'>{projectName}/ {chapter.title}</h1>
                    <div className='flex items-center py-3 px-5 lg:py-5 lg:px-8 bg-[#97D4A6] mt-3 text-slate-900 text-[13px] lg:text-sm rounded '>Shubham Thakur updated 8 months ago</div>
                    <div className='lg:flex justify-between mt-5'>
                        <div className='w-full lg:w-[70vw] border border-gray-300 bg-gray-100 rounded h-[100vh] rounded p-5 lg:py-10 lg:px-8'>
                            <h1 className='font-bold text-slate-800 text-2xl lg:text-3xl'>{chapter.title}</h1>
                            <p className='mt-3 lg:mt-5 text-[13px] lg:text-[15px]'>{chapter.content && ReactHtmlParser(chapter.content)}</p>
                        </div>
                        <div className='w-full lg:w-[30vw] mt-5 lg:mt-0 lg:ml-5 pt-3'>
                            <div>
                                <h1 className='font-bold text-xl'>Summary</h1>
                                <p className='text-sm mt-3 text-justify'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam neque veritatis laborum harum sed necessitatibus nostrum consequuntur. Eveniet nam expedita animi beatae quo rem deleniti praesentium voluptatem. Quae, et aut.</p>
                            </div>
                            <div>
                                <h1 className='font-bold text-lg mt-8'>Upvote and Share it!</h1>
                                <div className='mt-3 flex items-center ml-5'>
                                    {liked ?
                                        (<div className='mt-1.5 mr-8' onClick={() => setLike(false)}>
                                            <img src={likedButton} alt="" className='w-10 cursor-pointer' />
                                            <p className='text-[12px] mt-3'>3567 Likes</p>
                                        </div>)
                                        :
                                        (<div className='mt-1.5 mr-8'>
                                            <img src={likeButton} alt="" className='w-10 cursor-pointer' onClick={() => setLike(true)} />
                                            <p className='text-[12px] mt-3'>3567 Likes</p>
                                        </div>)
                                    }
                                    <div>
                                        <img src={shareButton} alt="" className='h-8 mt-2 cursor-pointer' />
                                        <p className='text-[12px] mt-3'>357 shares</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h1 className='font-bold text-lg mt-8'>Discussion</h1>
                                <div className='w-full h-[500px] border border-gray-300 bg-gray-100 mt-5'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </> : <Loader />
    )
}
export default ChapterInterface
