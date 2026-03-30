import React from 'react'
import registerUtil from '../../utils/registerUtil'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

function Signup({ setRegStatus, mail }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const [traits, setTraits] = useState({ 'student': false, 'professional': false, amateur: false })
    const [traitsList, setTraitList] = useState([])

    useEffect(() => {
        const confirmedTraits = Object.keys(traits).filter(trait => traits[trait])
        setTraitList(confirmedTraits)
    }, [traits])

    const handleTraitsChange = (trait) => {
        setTraits(prevState => ({
            ...prevState,
            [trait]: !prevState[trait]
        }))
    }

    const getButtonClassName = (trait) => {
        return `mx-3 my-1.5 w-fit bg-[${getButtonBg(trait)}] lg:text-sm text-[12px] px-3 py-1.5 rounded text-[#3F5F4F]`
    }

    const getButtonBg = (trait) => {
        return traits[trait] ? `#97D4A6` : `#e6faeb`
    }

    const handleGoogleLogin = () => {
        window.open(`${import.meta.env.VITE_API_GOOGLE_URI}/google`, "_self")
    }

    return (
        <form
            className='flex justify-center items-centerl lg:w-[50vw] pt-[15vh] lg:p-0 lg:mx-0 mx-auto'
            onSubmit={handleSubmit((data) => {
                registerUtil({ username: data.username, email: mail, password: data.password, occupations: traitsList })
            })}>

            <div>
                <h1 className='font-extrabold text-5xl text-center'>Register here!</h1>
                <div className=' flex flex-col justify-center items-center mt-5'>
                    {errors.username && <p className='text-sm m-0.5 text-red-500'>{errors.username.message}</p>}
                    <input
                        type="text"
                        className={`w-[300px] lg:w-[400px] bg-gray-300 py-2 px-3.5 rounded m-1.5 placeholder-slate-800 text-[12px] lg:text-sm ${errors.username ? 'bg-red-100 border border-red-700' : ''}`}
                        placeholder='Enter your username' {...register("username", {
                            required: "Please enter the name",
                            minLength: { value: 3, message: "Name should be of minimum 3 characters." },
                            maxLength: { value: 30, message: "Name should be not more than 30 characters long" }
                        })} />
                    {errors.mail && <p className='text-[12px] lg:text-sm m-0.5 text-red-500'>{errors.mail.message}</p>}
                    {/* <input
                        type="text"
                        className={`w-[300px] lg:w-[400px] bg-gray-300 py-2 px-3.5 rounded m-1.5 placeholder-slate-800 text-[12px] lg:text-sm ${errors.email ? 'bg-red-100 border border-red-700' : ''}`}
                        placeholder='Enter your mail'
                        {...register("email", {
                            required: "Please enter the email",
                            minLength: { value: 3, message: "Name should be of minimum 3 characters." },
                            maxLength: { value: 30, message: "Name should be not more than 30 characters long" }
                        })} /> */}
                    <p className='text-[12px] lg:text-sm mt-3 mb-1.5 w-[380px] text-center'>I love writing and I am a</p>
                    <div className='flex items-center w-[300px] lg:w-[400px] flex-wrap mb-1.5 text-[12px] lg:text-sm'>
                        <button type="button" className={getButtonClassName('student')}
                            onClick={() => handleTraitsChange('student')}>Student</button>
                        <button type="button" className={getButtonClassName('professional')}
                            onClick={() => handleTraitsChange('professional')}>Professional</button>
                        <button type="button" className={getButtonClassName('amateur')}
                            onClick={() => handleTraitsChange('amateur')}>Amateur Author</button>
                    </div>
                    {errors.password && <p className='text-[12px] lg:text-sm m-0.5 text-red-500'>{errors.password.message}</p>}
                    <input type="password"
                        className={`w-[300px] lg:w-[400px] bg-gray-300 py-2 px-3.5 rounded m-1.5 placeholder-slate-800 text-[12px] lg:text-sm ${errors.password ? 'bg-red-100 border border-red-700' : ''}`}
                        placeholder='Enter your password'
                        {...register("password", {
                            required: "Please enter the password",
                            minLength: {
                                value: 10,
                                message: "The password should be at least 10 characters long",
                            }
                        })} />
                    {errors.re_password && <p className='text-[12px] lg:text-sm m-0.5 text-red-500'>{errors.re_password.message}</p>}

                    <input type="password"
                        className={`w-[300px] lg:w-[400px] bg-gray-300 py-2 px-3.5 rounded m-1.5 placeholder-slate-800 text-[12px] lg:text-sm ${errors.re_password ? 'bg-red-100 border border-red-700' : ''}`}
                        placeholder='Confirm your password'
                        {...register("re_password", {
                            required: "Please re-enter the password",
                            validate: (value) => value === watch("password") || "Passwords do not match"

                        })} />
                    <button className='w-[300px] lg:w-[400px] bg-[#97D4A6] py-2 px-3.5 rounded m-1.5 text-[12px] lg:text-sm' type='submit'>Let me in!</button>
                </div>
                <p className='text-center text-[12px] lg:text-sm m-3'>or</p>
                <button type="button" className='w-[300px] lg:ml-0 ml-10 lg:w-[400px] bg-[#97D4A6] py-1.5 lg:py-2 px-3.5 rounded m-1.5 text-[12px] lg:text-sm flex justify-center items-center' onClick={handleGoogleLogin}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png" alt="google-icon" className='w-[25px] mr-3' />
                    <p className="text-[12px] lg:text-sm">Continue with Google</p>
                </button>
                <p className='text-center lg:text-sm text-[12px] m-3'>Already have an account? <span className='text-[#3F5F4F] cursor-pointer underline' onClick={() => setRegStatus(true)}>Login here</span></p>
            </div>
        </form >
    )
}

export default Signup
