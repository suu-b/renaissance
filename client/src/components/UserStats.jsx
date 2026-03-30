import statsIcon from '../assets/stats-icon.png'
import { fetchUserProjects, getForkedProject, getNoOfLikesForUser } from '../utils/apiUtils'
import getUserDetails from '../utils/getUserDetails'
import { useState, useEffect } from 'react'

function UserStats() {
    const [stats, setStats] = useState({ likes: 0, projects: 0, forks: 0 })
    const userID = getUserDetails('userID')
    const getUserStats = () => {
        getNoOfLikesForUser(userID)
            .then(response => {
                setStats(prevStats => ({ ...prevStats, likes: response.data.likes }))
                return getForkedProject(userID)
            })
            .then(response => {
                setStats(prevStats => ({ ...prevStats, forks: response.data.length }))
                return fetchUserProjects(userID)
            })
            .then(response => {
                setStats(prevStats => ({ ...prevStats, projects: response.data.length }))
            })
            .catch(error => console.log(error))
    }
    useEffect(() => getUserStats(), [userID])
    return (
        <div className='flex justify-center items-center w-fit'>
            <img src={statsIcon} alt="stats" className='w-[50px] lg:w-[60px] mt-3' />
            <div className='w-1.5 lg:w-2 h-[50px] lg:h-[60px] bg-[#3F5F4F] ml-3 mt-3' />
            <div className='text-[12px] lg:text-sm text-smibold pl-3 pt-1.5'>
                <p><span className='font-bold'>{stats.likes}</span> Likes</p>
                <p><span className='font-bold'>{stats.projects}</span> Projects</p>
                <p><span className='font-bold'>{stats.forks}</span> Forks</p>
            </div>
        </div>
    )
}

export default UserStats
