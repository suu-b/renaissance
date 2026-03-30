import loginIcon from '../../assets/login.png'
import dashIcon from '../../assets/dashboard.png'
import exploreIcon from '../../assets/contract.png'
import { Link } from 'react-router-dom'

function HelpDesk() {
    return (
        <>
            <h1 className='text-5xl font-extrabold text-center mt-[40px] lg:mt-[70px] mb-[10px] lg:mb-[50px] '>How to Start Contributing?</h1>
            <div className='flex lg:flex-row flex-col w-[70vw] lg:w-[75vw] m-auto justify-between items-center'>
                <div className='cursor-pointer text-center shadow-lg border border-gray-300 bg-gray-100 lg:p-10 p-5 h-40 w-40 lg:h-[250px] lg:w-[250px] xl:h-[300px] xl:w-[300px] rounded-full '>
                    <Link to='/Register' className='flex justify-center text-[10px] lg:text-[13px] items-center flex-col'>
                        <img src={loginIcon} alt="loginIcon" className='w-16 h-16 lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] lg:m-3' />
                        Create a free account. Login to your account.</Link>
                </div>
                <div className='cursor-pointer text-center shadow-lg border border-gray-300 bg-gray-100 lg:p-10 p-5 h-40 w-40 lg:h-[250px] lg:w-[250px] xl:h-[300px] xl:w-[300px] rounded-full lg:mt-0 mt-3'>
                    <Link to='/Dashboard' className='flex justify-center text-[10px] lg:text-[13px] items-center flex-col'>
                        <img src={dashIcon} alt="dashIcon" className='w-16 h-16 lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] lg:m-3' />
                        View your dashboard by following the link on the dashboard.</Link>
                </div>
                <div className='cursor-pointer text-center shadow-lg border border-gray-300 bg-gray-100 lg:p-10 p-5 h-40 w-40 lg:h-[250px] lg:w-[250px] xl:h-[300px] xl:w-[300px] rounded-full lg:mt-0 mt-3'>
                    <Link to='NewProject' className='flex justify-center text-[10px] lg:text-[13px] items-center flex-col'>
                        <img src={exploreIcon} alt="exploreIcon" className='w-16 h-16 lg:w-[80px] lg:h-[80px] xl:w-[100px] xl:h-[100px] lg:m-3' />
                        Explore the literature and contribute to polish their magnificence.</Link>
                </div>
            </div>
        </>
    )
}

export default HelpDesk
