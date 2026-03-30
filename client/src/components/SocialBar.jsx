import { useEffect, useState } from 'react'
import likeIcon from '../assets/like-icon.png'
import likedIcon from '../assets/liked-icon.png'
import { getNoOfLikesForProject, likeProject, checkIfLiked } from '../utils/apiUtils'
import getUserDetails from '../utils/getUserDetails'
import { toast } from 'react-toastify'

function SocialBar({ projectID }) {
    const [likes, setLikes] = useState(0)
    const [canLike, setCanLike] = useState(false)
    const userID = getUserDetails('userID')

    useEffect(() => {
        checkLike()
        getNoOfLikesForProject(projectID)
            .then(response => setLikes(response.data.likes))
            .catch(error => console.log(error))
    }, [projectID])

    const handleLikeAction = () => {
        likeProject(projectID, userID)
            .then(response => {
                setLikes(response.data.likes)
                setCanLike(false)
                toast.success("You Liked a Project!")
            })
            .catch(error => {
                toast.error("Failed to Like. Try again Later.")
                console.log(error)
            })
    }

    const checkLike = () => {
        checkIfLiked(projectID, userID)
            .then(response => { if (response.status === 200) { setCanLike(true) } })
            .catch(error => {
                if (error.response.status === 409) setCanLike(false)
                else console.log(error)
            })
    }

    return (
        <div className='flex flex-col justify-center items-center cursor-pointer' title='Upvote'>
            {canLike ?
                <img src={likeIcon} alt="likeProject" className='w-[30px] lg:w-8 lg:mt-0 mt-3' onClick={() => handleLikeAction()} />
                :
                <img src={likedIcon} alt="likedProject" className='w-[30px] lg:w-8 lg:mt-0 mt-3' />
            }
            <p className='text-[11px] lg:text-[13px] mt-1.5 text-slate-600'>{likes} Upvotes</p>
        </div>
    )
}

export default SocialBar
