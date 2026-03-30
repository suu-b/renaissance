import React from 'react'
import { useState, useEffect, useRef } from 'react'
import greenBg from '../../assets/bg-green2.png'
import searchIcon from '../../assets/search-icon.png'
import johnKeats from '../../assets/john_keats.jpg'
import HelpDesk from './HelpDesk'
import SimpleSlider from '../Sliders/Slider'
import SecondarySlider from '../Sliders/SecondarySlider'
import Suggestions from './Suggestions'
import Footer from '../Footer'
import { Link } from 'react-router-dom'
import WelcomeLoader from '../Loaders/WelcomeLoader'
import { fetchArtists } from '../../utils/apiUtils'
import downChevron from '../../assets/arrow.png'
import data from './data.json'
import getDailyArtist from '../../utils/getDailyArtist'

function Home({ isLogin }) {
    const [imageArray, setImageArray] = useState([])
    const [artistOfTheDay, setArtistOfTheDay] = useState(null)
    const helpDeskRef = useRef()

    const scrollToHelp = () => {
        helpDeskRef.current.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        fetchArtists()
            .then(response => {
                setImageArray(response.data)
                const selArtist = getDailyArtist(response.data)
                console.log(selArtist)
                setArtistOfTheDay(selArtist)
            })
            .catch(error => {
                console.log(error)
            })
    }, [])

    return (
        imageArray.length ? <div>
            <SimpleSlider />
            <div className='lg:flex lg:mt-0 mt-10 '>
                <div className='my-5 p-5 lg:p-0 lg:pl-5 pl-10 lg:w-[850px] h-[300px] xl:w-[1100px] xl:h-[350px] bg-cover' style={{ backgroundImage: `url(${greenBg})` }}>
                    <div className='lg:mt-5'>
                        <input type="text" placeholder="Search Here" className="pl-16 lg:py-5 py-2 text-3 w-[86vw] lg:w-[50vw] my-5 absolute left-[-15px] h-[30px] rounded-3xl border-transparent" />
                        <button className="z-[10] absolute bg-[#3F5F4F] text-slate-100 border-solid border-[#3F5F4F] border-2 py-1.5 px-3 right-[16vw] lg:right-auto lg:left-[48vw] mt-[20px] rounded-3xl rounded-l-none" ><img src={searchIcon} className='w-[14px] lg:w-[24px]' /></button>
                    </div>
                    <p className='text-center lg:text-left text-3.5 mt-[70px] lg:mt-[110px] text-[13px] lg:text-sm xl:text-base ml-2 '>I bow to thee,</p>
                    <h1 className='text-center lg:text-left text-5xl xl:text-8xl lg:text-7xl font-extrabold'>Renaissance</h1>
                    <p className='text-center lg:text-left text-[13px] xl:text-base lg:text-sm  ml-2'>Movement that changed the fate of a continent sunken
                        into backwaters</p>
                    <div className='mt-3 xl:mt-8 lg:mt-5 pl-2 lg:mx-0 mx-auto w-fit'>
                        {isLogin ? <Link to='Dashboard'><button className="bg-[#3F5F4F] text-[13px] xl:text-base lg:text-sm text-slate-100 border-solid border-[#3F5F4F] mr-5 rounded border-2 py-0.5 lg:py-1.5 px-3" >Dashboard</button></Link>
                            : <button className="bg-[#3F5F4F] text-[13px] text-slate-100 xl:text-base lg:text-sm border-solid border-[#3F5F4F] mr-5 rounded border-2 py-0.5 lg:py-1.5 px-3" >Explore</button>
                        }
                        <button className="bg-transparent text-[13px] border-solid border-[#3F5F4F] mr-5 rounded border-2 px-3 py-0.5 lg:py-1.5 px-3" onClick={scrollToHelp} >How to Start?</button>
                    </div>
                </div>
                <Link to={`/DailyArtist/${artistOfTheDay._id}`} className="lg:absolute lg:right-[8vw] mx-auto xl:top-[43%] lg:top-[47%] w-[60vw] h-[60vw] lg:w-[25vw] lg:h-[25vw] bg-cover z-20 flex items-start justify-center mt-[30pxF] border-[30px] shadow-lg border-[#97D4A6] rounded-full hover:shadow-xl artist-image" style={{ backgroundImage: `url(${artistOfTheDay.artistImageSrc})` }}>
                    <div className='animate-bounce'>
                        <div className='bg-yellow-200 rounded mr-3 py-1.5 px-1.5 text-center text-sm text-[12px] ml-5 opacity-90'>
                            Artist of the day
                        </div>
                        <img src={downChevron} className="w-5 m-auto mt-1.5 cursor-pointer" alt="" />
                    </div>
                </Link>
            </div >
            <h1 className='text-5xl font-extrabold text-center mt-[30px] lg:mt-[60px] xl:text-8xl lg:text-7xl'>Discover Personalities</h1>
            <p className='lg:text-base text-[13px] text-center mt-[10px] mb-[60px]'>In timeless verse, their ancient souls still breathe.</p>
            {imageArray && <SecondarySlider imageArray={imageArray} />}
            <h1 className='hidden lg:block text-5xl font-extrabold text-center mt-[70px] mb-[50px] xl:text-8xl lg:text-6xl'>Explore Some Amazing Works</h1>
            <Suggestions title={data[1].title} desc={data[1].desc} author={data[1].author} img={data[1].img} direction={'right'} />
            <div ref={helpDeskRef}>
                <HelpDesk />
            </div>
            <Suggestions title={data[0].title} desc={data[0].desc} author={data[0].author} img={data[0].img} direction={'left'} />
            <hr className='mt-8' />
            <p className='text-center mb-8 text-slate-800 mt-3'>Thanks For Visiting</p>
            <Footer />
        </div>
            : <WelcomeLoader />
    )
}

export default Home
