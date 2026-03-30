import { useEffect, useState } from "react"
import Loader from '../Loaders/Loader'
import explore_bg from '../../assets/cover_Explore.jpg'
import { fetchProjects } from "../../utils/apiUtils"
import Footer from "../Footer"
import { getDisplayPicture } from "../../utils/getAccountDP"
import { Link } from "react-router-dom"
import { ClipLoader } from "react-spinners"

function Explore({ isLogin }) {
    const [projects, setProjects] = useState([])
    const [projectImages, setProjectImages] = useState({})
    useEffect(() => {
        fetchProjects()
            .then(response => setProjects(response.data))
            .catch(error => console.log(error))
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
    return (
        <>
            {projects ?
                <><div className="py-5 px-8 ">
                    <div className="lg:flex">
                        <h1 className="text-2xl font-bold text-slate-800 lg:text-left text-center">Renaissance</h1>
                        <div className="lg:flex w-fit lg:mx-0 mx-auto lg:mt-0 mt-3">
                            <Link to='/Register' ><button className="bg-[#3F5F4F] ml-3 text-white border-solid border-[#3F5F4F] text-[12px] lg:text-sm mr-5 rounded border-2 py-0.5 px-1.5">Let me In!</button></Link>
                            <button className="text-[#3F5F4F] ml-3 border border-[#3F5F4F] text-[12px] lg:text-sm mr-5 rounded border-1 py-0.5 px-3">How to Start?</button>
                        </div>
                    </div>
                    <p className="text-slate-700 text-center mt-5 lg:mt-10 text-[12px] lg:text-[14px]">We Provide a free access to our users to hundreds of poems, stories, novelletes, novels for free!. Why? Beacuse its open source. We invite you to hlep us build the community of open source for Litreature!</p>
                    <div className="card cursor-pointer">
                        <img src={explore_bg} alt="cover" className="card-content lg:w-auto lg:h-auto h-[30vh] rounded my-5 shadow" />
                        <div className="card-hover flex flex-col px-3 lg:px-8">
                            <p className="lg:text-base text-[11px] font-bold text-white">Wheatfield Under Thunderclouds</p>
                            <p className="lg:text-base text-[11px] font-semibold text-white">(Vincent Van Gogh)</p>
                            <p className="text-[8px] lg:text-[13px] lg:mt-8 text-justify">In the last weeks of his life, Van Gogh completed a number of impressive paintings of the wheatfields around Auvers. This outspread field under a dark sky is one of them. In these landscapes he tried to express 'sadness, extreme loneliness'. But the overwhelming emotions that Van Gogh experienced in nature were also positive. He wrote to his brother Theo, 'I'd almost believe that these canvases will tell you what I can't say in words, what I consider healthy and fortifying about the countryside.' The elongated format of Wheatfields under Thunderclouds is unusual. It emphasizes the grandeur of the landscape, as does the simple composition: two horizontal planes.</p>
                        </div>
                    </div>
                    <p className="text-slate-700 text-center mt-5 lg:mt-10 text-[12px] lg:text-[14px]">Explore the litrery pieces penned and contributed by our users. Realize how cooperation makes things easier and exalt the beauty of a piece bya  million times!</p>
                    <h1 className="text-3xl lg:text-6xl font-bold text-center text-slate-900 mt-3 lg:mt-1.5">Discover Some Amazing Pieces!</h1>
                    <div className="mt-8 flex flex-wrap justify-center">
                        {projects.map(project => (
                            <div className='border bg-white m-3 rounded-xl w-fit px-5 py-8 shadow-lg flex flex-col justify-center hover:scale-105'>
                                <div className='flex'>
                                    {projectImages[project.projectOwner] ? <img src={projectImages[project.projectOwner]} alt="profile-picture" className='rounded-full w-20 h-20 shadow-lg' /> : <ClipLoader size={20} className='m-auto' />}
                                    <div className='p-3'>
                                        <h1 className='font-bold text-sm lg:text-lg'>{project.projectOwnerName}</h1>
                                        <p className='text-slate-700 text-[12px]'>Creative Writer, Author, Director</p>
                                    </div>
                                </div>
                                <h1 className='font-bold mt-5 lg:text-base text-sm'>{project.title}</h1>
                                <p className='text-slate-700 text-sm'>{project.description}</p>
                                <div>
                                    <Link to={`/Read/${project._id}`}><button className='bg-[#3F5F4F] w-fit h-fit text-[11px] lg:text-[13px] px-3 py-1.5 rounded mt-2 text-white' >Read</button></Link>
                                    <Link to={`/userAccount/${project.projectOwner}`}><button className='text-[#3F5F4F] font-semibold border border-[1.5px] border-[#3F5F4F] text-[11px] lg:text-[13px] px-3 py-[5px] rounded mt-2 ml-1.5'>About Authors</button></Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                    <Footer /></>
                : <Loader />
            }
        </>
    )
}

export default Explore
