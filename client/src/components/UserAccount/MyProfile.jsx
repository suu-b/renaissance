import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { getOneUser, setProfileImage, updateUser } from '../../utils/apiUtils'
import logoutUtil from '../../utils/logoutUtil'
import { showProfileImage } from '../../utils/getProfileImage'
import Loader from '../Loaders/Loader'
import { toast } from 'react-toastify'

function MyProfile({ userID, setLogin, isLogin }) {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [userData, setUserData] = useState(null)
    const [selProfile, setSelFile] = useState("")
    const [imgURL, setImgURL] = useState("")

    const isAnyFieldNotEmpty = (object) => {
        return Object.keys(object).some(key => object[key] !== '');
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        setSelFile(file)
        console.log(file)
    }
    const handleFileUpload = () => {
        setProfileImage(userID, selProfile)
            .then(response => {
                console.log(response)
                toast.success("Profile updated successfully!")
                showProfileImage(userID, setImgURL)
            })
            .catch(error => {
                toast.error(error.response.data.message)
                console.log(error)
            })
    }

    useEffect(() => {
        showProfileImage(userID, setImgURL)
        getOneUser(userID)
            .then(response => setUserData(response.data))
            .catch(error => console.log(error))
    }, [userID])

    return (
        userData ?
            <form className='lg:py-10 lg:px-8 p-5 bg-gray-100 rounded border border-gray-300 mt-10'
                onSubmit={handleSubmit((data) => {
                    console.log(data)
                    if (!isAnyFieldNotEmpty(data)) {
                        toast.error("Please change something to update.")
                        return
                    }
                    updateUser(data, userID)
                        .then(response => toast.success("Profile updated Successfully!"))
                        .catch(error => {
                            console.log(error)
                            toast.error("Failed to update. Try again later. ")
                        })

                })}>
                <div className='lg:flex justify-between items-center mb-3'>
                    <h1 className="text-xl text-slate-700 font-bold ml-1.5">My Profile</h1>
                    {isLogin ? <button type='button' className="text-[12px] mt-3 lg:mt-0 bg-red-200 ml-1.5 lg:text-sm border border-red-500 mr-5 rounded py-1.5 px-5" title="Logout" onClick={() => logoutUtil(setLogin)}>Logout</button> : null}
                </div>
                <p className='text-[11px] lg:text-[13px] text-gray-400 mb-5 ml-1.5 text-justify'>You can see your current profile data. If you wish to update it, write the new data in the respective field and click the button in the bottom to update it! To update the profile picture, select the new picture and upload from the device and select change!</p>
                <div className="white shadow rounded py-10 px-8 bg-white my-5">
                    <h1 className="text-xl text-slate-700 font-bold">Your Personal Details:</h1>
                    <p className="text-[11px] lg:text-[13.5px] mb-5 mt-1.5 text-slate-600 mt-1.5">Enter your personal details like username, mail and bio to update. (In case you did no change the original data shall remain intact)</p>
                    <div className='lg:flex justify-start items-start'>
                        <div className='lg:flex flex-col items-center justify-center'>
                            <img src={imgURL && imgURL} alt="profile-image" className='rounded-full w-[100px] lg:w-[150px]' />
                            <div className='text-[13px] mt-3'>
                                <label htmlFor="file-upload" className='text-[11px] lg:text-[9px] xl:text-sm cursor-pointer border bg-gray-100 rounded w-fit px-3 py-1.5 text-slate-700'>Upload from device</label>
                                <input type="file" id="file-upload" onChange={handleFileChange} />
                                <div className='mt-3 text-[11px] lg:text-base text-slate-500 text-left lg:text-center'>{selProfile && selProfile.name}</div>
                            </div>
                            <button type="button" className="bg-[#97D4A6] m-auto mt-3 text-[11px] lg:text-[13px] border-solid border-[#97D4A6] rounded border-2 py-1.5 px-3" onClick={handleFileUpload}>Change</button>
                        </div>
                        <div className='flex flex-col justify-center ml-0 lg:ml-8 mt-5'>
                            <div>
                                <p className='text-[11px] lg:text-[13px] text-gray-400 pl-3'>Your Username</p>
                                <input
                                    type="text"
                                    className='text-[11px] lg:text-sm text-left border border-1.5 bg-gray-100 border-gray-300 rounded py-1.5 px-3 text-gray-600'
                                    placeholder={userData.username}
                                    {...register("username", {
                                        minLength: { value: 3, message: "Name should be of minimum 3 characters." },
                                        maxLength: { value: 30, message: "Name should be not more than 30 characters long" }
                                    })} />
                                {errors.username && <p className='text-sm m-0.5 text-red-500'>{errors.username.message}</p>}
                            </div>
                            <div>
                                <p className='text-[11px] lg:text-[13px] text-gray-400 pl-3 mt-5'>Your Bio</p>
                                <textarea rows={4} cols={50} className='text-[11px] lg:text-sm text-left border border-1.5 bg-gray-100 border-gray-300 rounded py-1.5 px-3 text-gray-600'
                                    placeholder={userData.bio || "Nothing for now. Add one!"}
                                    {...register("bio")} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="white shadow rounded py-10 px-8 bg-white my-5">
                    <h1 className="text-xl text-slate-700 font-bold">Your Contacts and Locations:</h1>
                    <p className="text-[11px] lg:text-[13.5px] mb-5 text-slate-600 mt-1.5">Enter your personal details like username, mail and bio to update. (in case you did no change the original data shall remain intact)</p>
                    <div>
                        <p className='text-[11px] lg:text-[13px] text-gray-400 pl-3 mt-5'>Your mail</p>
                        <input
                            type="text"
                            className='text-[11px] lg:text-sm text-left border border-1.5 bg-gray-100 border-gray-300 rounded py-1.5 px-3 text-gray-600'
                            placeholder={userData.email}
                            {...register("email")} />
                    </div>
                    <div>
                        <p className='text-[11px] lg:text-[13px] text-gray-400 pl-3 mt-5'>Your Contact Number:</p>
                        <input
                            type="text"
                            className='text-[11px] lg:text-sm text-left border border-1.5 bg-gray-100 border-gray-300 rounded py-1.5 px-3 text-gray-600'
                            placeholder={userData.phNumber || "Nothing for now. Add one!"}
                            {...register("phNumber", {
                                minLength: { value: 10, message: "Phone should be of minimum 10 digits." },
                                maxLength: { value: 10, message: "Name should be not more than 10 digits long" }
                            })} />
                        {errors.phNumber && <p className='text-[11px] lg:text-sm m-0.5 text-red-500'>{errors.phNumber.message}</p>}
                    </div>
                    <div>
                        <p className='text-[11px] lg:text-[13px] text-gray-400 pl-3 mt-5'>Your City and Country:</p>
                        <input
                            type="text"
                            className='text-[11px] lg:text-sm text-left border border-1.5 bg-gray-100 border-gray-300 rounded py-1.5 px-3 text-gray-600'
                            placeholder={userData.location || "Nothing for now. Add one!"}
                            {...register("location")} />
                    </div>
                </div>
                <button type='submit' className="bg-[#97D4A6] ml-1.5 text-[11px] lg:text-sm border-solid border-[#97D4A6] mr-5 rounded border-2 py-1.5 px-3" >Save Changes</button>
            </form>
            :
            < Loader />
    )
}
export default MyProfile
