import SocialBar from "../SocialBar"
import Footer from "../Footer"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchChapters, fetchProject } from "../../utils/apiUtils"
import Loader from "../Loaders/Loader"
import { toast } from "react-toastify"
import HTMLReactParser from "html-react-parser/lib/index"
function Read({ isLogin }) {
    const [project, setProject] = useState(null)
    const [chapters, setChapters] = useState(null)
    const [index, setIndex] = useState(0)
    const { projectID } = useParams()
    useEffect(() => {
        fetchProject(projectID)
            .then(response => {
                setProject(response.data)
                return fetchChapters(projectID)
            })
            .then(response => setChapters(response.data))
            .catch(error => console.log(error))
    }, [])
    const handlePrev = () => {
        if (index == 0) return
        setIndex(prevIndex => prevIndex - 1)
    }
    const handleNext = () => {
        if (index == chapters.length - 1) {
            toast.success("Thank you for reading till end. Show your gratitude by hitting the like!")
            return
        }
        setIndex(nextIndex => nextIndex + 1)
    }
    return (
        (project && chapters) ?
            <div>
                <h1 className="text-4xl font-bold text-slate-800 text-center mt-8">{project.title}</h1>
                <p className="text-[13px] text-gray-500 mt-5 w-[80%] mx-auto text-justify">{project.description}</p>
                <div className="flex justify-between mx-auto w-[80%] mt-5">
                    <p className="text-slate-800 underline text-[13px] cursor-pointer" onClick={handlePrev}>Previous</p>
                    <p className="text-slate-800 underline text-[13px] cursor-pointer" onClick={handleNext}>Next</p>
                </div>
                <div className="flex justify-center items-start mx-auto w-[80%] mt-8">
                    <article className="bg-gray-100 border border-gray-300 rounded px-8 w-full py-5">
                        <h3 className="font-bold text-2xl text-slate-800">{chapters[index].title}</h3>
                        <p className="text-[13.5px] text-slate-800 mt-5 text-justify">{HTMLReactParser(chapters[index].content)}</p>
                    </article>
                    {isLogin ?
                        <div className="ml-5 text-center">
                            <SocialBar projectID={projectID} />
                        </div>
                        :
                        <p className="text-[13px] text-slate-600 text-center ml-5 p-3 bg-gray-100 border border-gray-300 rounded">Login to Like the Project</p>}

                </div>
                <Footer />
            </div>
            : <Loader />
    )
}

export default Read
