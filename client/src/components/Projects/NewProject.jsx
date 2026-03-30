import { useState, useEffect } from 'react'
import padLock from '../../assets/padlock.png'
import open from '../../assets/open.png'
import { useForm } from 'react-hook-form'
import getDate from '../../utils/getDate'
import getUserDetails from '../../utils/getUserDetails'
import { toast } from 'react-toastify'
import { postProject } from '../../utils/apiUtils'
import { useNavigate } from 'react-router-dom'

function NewProject() {
    const [allTags, setAllTags] = useState(["Fantasy", "Crime & Thriller", "Wartime", "Mystery", "Kids", "Self-Help", "Fiction", "RomCom", "Comedy", "Myth", "Drama", "Historical", "Adventure", "Fairies"])
    const [selectedTags, setSelectedTags] = useState([])
    const [status, setStatus] = useState('Open')
    const [typeOfProject, setType] = useState('')
    const { register, handleSubmit, formState: { errors } } = useForm()
    const navigate = useNavigate()

    const handleDeleteTag = (tagToDelete) => {
        setSelectedTags(prevTags => prevTags.filter(tag => tag != tagToDelete))
    }

    const handlePostProject = (data) => {
        postProject(data)
            .then(response => {
                console.log("Response", response.data)
                toast.success(`${response.data.title} Successfully created!`)
                navigate('/Dashboard')
            })
            .catch(error => {
                toast.error(error.response.message)
                console.log(error.response.data)
            })
    }

    return (
        <div className='lg:flex h-fit'>
            <form className="lg:w-[50vw] py-10 px-12 bg-white"
                onSubmit={handleSubmit((data) => {
                    data.tags = selectedTags
                    data.projectOwner = getUserDetails('userID')
                    data.status = status
                    const dateCreated = getDate()
                    data.dateCreated = dateCreated
                    data.projectOwnerName = getUserDetails('userName')
                    handlePostProject(data)
                })}>
                <h1 className="text-3xl font-bold">Start a New Project</h1>
                <p className="text-[13px] text-gray-700 mt-1.5">A new project can be anything from a the meters of poems to prose of Stories! Novels, Poems, lyrics and stories anything you wish</p>
                <hr className="my-1.5" />
                <p className="text-[12px] lg:text-sm text-gray-700 mt-1.5">(*) are required</p>
                <div className="flex w-fit mt-10">
                    <div className="mr-5">
                        <p className="font-bold">Owner*</p>
                        <div className="flex">
                            <p className="text-[12px] lg:text-sm border border-1.5 bg-[#D6E7DA] border-[#3F5F4F] px-2 py-1.5 rounded">Shubhh_Thakur /</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold">Project name*</p>
                        <input type="text" placeholder="Enter the project name" className="text-[12px] lg:text-sm placeholder-slate-800 bg-gray-300 border px-2 py-1.5 border-gray-300 rounded"
                            {...register("title", {
                                required: "The title for the project is required",
                                minLength: { value: 3, message: "Name should be of minimum 3 characters." },
                                maxLength: { value: 100, message: "Name should be not more than 100 characters long" }
                            })} />
                    </div>
                </div>
                <p className="text-[12px] lg:text-[13px] text-gray-700 mt-1.5">A name that accumulates all the feelings that you would put in your pen!</p>
                <div className="mt-5">
                    <p className="font-bold">Description*</p>
                    <textarea cols="10" rows="3" placeholder="eg. A story where our hero would ..." className="px-5 py-3 text-[12px] lg:text-sm w-[90%] border bg-gray-300  placeholder-slate-700 border-gray-300 rounded"
                        {...register("description", {
                            required: "The description for the project is required",
                            minLength: { value: 3, message: "Description should be of minimum 3 characters." },
                            maxLength: { value: 300, message: "Description should be not more than 300 characters long" }
                        })}></textarea>
                </div>
                <hr className="my-5" />
                <div>
                    <p className="font-bold">Choose Genre*</p>
                    <p className="text-[13px] text-gray-700 mt-0.5">You can only choose three genre. Choose wisely!</p>
                    <div className="flex">
                        <select className='text-[12px] lg:text-sm bg-gray-300 rounded mt-1.5 px-2 py-1.5' onChange={(e) => setSelectedTags(prevTags => ([
                            ...prevTags,
                            e.target.value
                        ]))}>
                            {allTags.map((tag, index) => (
                                <option key={index} value={tag}>{tag}</option>
                            ))}
                        </select>
                        <div>
                            {selectedTags && selectedTags.map(tag => (
                                <button type="button" key={tag} className='mx-3 my-1.5 w-fit bg-[#97D4A6] text-[12px] lg:text-sm px-3 py-1.5 rounded text-slate-900'>{tag} <button onClick={() => handleDeleteTag(tag)}>X</button></button>
                            ))}
                        </div>
                    </div>
                </div>
                <hr className="my-5" />
                <div>
                    <div className='flex items-center m-3'>
                        <input type="radio" name="status" value="Open" className="cursor-pointer mr-5" onChange={(e) => setStatus(e.target.value)} />
                        <img src={open} alt="" className='w-8' />
                        <div className='ml-3'>
                            <label htmlFor="status" className='font-semibold text-[12px] lg:text-sm mt-3'>Open</label>
                            <p className="text-[11px] lg:text-[12px] text-gray-700">Anyone on internet can see, visit and contribute to your project. See more here.</p>
                        </div>
                    </div>
                    <div className='flex items-center m-3'>
                        <input type="radio" name="status" value="Private" className="cursor-pointer mr-5" onChange={(e) => setStatus(e.target.value)} />
                        <img src={padLock} alt="" className='w-8 ' />
                        <div className='ml-3'>
                            <label htmlFor="status" className='font-semibold text-[12px] lg:text-sm mt-3'>Private</label>
                            <p className="text-[11px] lg:text-[12px] text-gray-700 ">Anyone on internet can see and visit but would require permission to contribute. See more here.</p>
                        </div>
                    </div>
                </div>
                <hr className="my-5" />
                <div>
                    <p className="font-bold">Choose the kind of litreature*</p>
                    <div className='flex justify-start'>
                        <div className='flex items-center m-3'>
                            <input type="radio" value="Poetry" onChange={(e) => setType(e.target.value)} className='cursor-pointer' name='kind' />
                            <label className='text-[12px] lg:text-sm ml-1.5'>Poetry</label>
                        </div>
                        <div className='flex items-center m-3'>
                            <input type="radio" value="Prose" onChange={(e) => setType(e.target.value)} className='cursor-pointer' name='kind' />
                            <label className='text-[12px] lg:text-sm  ml-1.5'>Prose</label>
                        </div>
                    </div>
                </div>
                <hr className="my-3" />
                <p className="text-[11px] lg:text-[12px] text-gray-700 mt-1.5">By creating a new project you are adhering to our terms and conditions and consenting to the policies mentioned in the agreement.</p>
                <button type='submit' className='bg-[#97D4A6] text-[11px] lg:text-sm text-slate-900 mt-5 rounded py-2 px-3'>Create Project</button>
            </form>
            <div className="lg:block hidden w-[50vw] bg-cover fixed  right-0 top-0 h-full" style={{ backgroundImage: `url(https://c1.wallpaperflare.com/preview/895/605/304/photo-beethoven-composer-germany.jpg)` }}>
                <div className='absolute bottom-[20px] left-[10px] py-1.5 px-3 bg-white bg-opacity-60 text-slate-900 rounded'>
                    <h1>Ludwig Van Beethoven</h1>
                    <p className='text-[11px] lg:text-[12px] w-[300px]'>He is one of the most revered figures in the history of Western music; his works rank among the most performed of the classical music repertoire.</p>
                </div>
            </div>
        </div >
    )
}
export default NewProject
