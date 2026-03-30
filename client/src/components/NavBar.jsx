import { useState } from 'react'
import compass from '../assets/compass.png'
import dashboard from '../assets/dashboard-white.png'
import user from '../assets/user-white.png'
import help from '../assets/help-white.png'
import home from '../assets/home-white.png'
import explore from '../assets/explore-white.png'
import { Link } from 'react-router-dom'
import getUserDetails from '../utils/getUserDetails'

function NavBar() {
    const [expand, setExpand] = useState(false)
    const userID = getUserDetails('userID')
    const links = [
        {
            image: home,
            alt: 'Home',
            to: '/'
        },
        {
            image: dashboard,
            alt: 'Dashboard',
            to: '/Dashboard'
        },
        {
            image: explore,
            alt: 'Explore',
            to: '/Explore'
        },
        {
            image: help,
            alt: 'Help',
            to: '/Dashboard'
        },
        {
            image: user,
            alt: 'My Account',
            to: userID ? `/userAccount/${userID}` : '/Register'
        }
    ]
    return (
        <nav className='flex fixed z-30 top-[20px] right-[20px] flex flex-col'>
            <div className={`w-[50px] h-[50px] bg-slate-700 p-1.5 shadow-xl cursor-pointer rounded-full ${expand ? 'rotateIcon' : "rotateBack"}`}>
                <img src={compass} id="navigation" alt="navigation" onClick={() => setExpand(!expand)} />
            </div>
            {expand && (
                <div className='flex flex-col'>
                    {links && links.map(link => (
                        <div className='flex items-center tooltip-container' key={link.alt}>
                            <div className='tooltip animate-bounce bg-yellow-200 rounded mr-3 py-1.5 px-1.5 text-center text-sm w-24'>
                                {link.alt}
                            </div>
                            <Link to={link.to} className='w-[50px] h-[50px] bg-slate-700 p-3 shadow-xl cursor-pointer rounded-full mt-3'>
                                <img src={link.image} alt={link.alt} aria-label={link.alt} />
                            </Link >
                        </div>
                    ))}
                </div>
            )}
        </nav>
    )
}

export default NavBar
