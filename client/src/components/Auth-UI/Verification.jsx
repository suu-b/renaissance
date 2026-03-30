import React, { useEffect } from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { MoonLoader } from 'react-spinners'
import Signup from './Signup'
import { sendOTP, verifyOTP } from '../../utils/apiUtils'

function Verification({ isLogin, setRegStatus, setLogin }) {
    const [sending, setSending] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [otp, setOTP] = useState('')
    const [sentOTP, setSentOTP] = useState(false)
    const [mail, setMail] = useState('')

    const handleOTPSend = (e) => {
        e.preventDefault()
        if (mail === '') {
            toast.warning("Please enter mail")
            return
        }
        setSending(true)
        console.log(mail)
        sendOTP({ email: mail })
            .then(resp => {
                toast.success("OTP sent to your mail")
                setSending(false)
                setSentOTP(true)
            })
            .catch(error => console.log(error))
    }

    const handleOTPVerify = (e) => {
        e.preventDefault()
        if (otp === '' || mail === '') {
            toast.warning("Please enter OTP and mail both")
            return
        }
        setSending(true)
        verifyOTP({ email: mail, otp: otp })
            .then(resp => {
                toast.success("OTP verified")
                setSending(false)
                setIsVerified(true)
            })
            .catch(error => console.log(error))
    }

    return (

        isVerified ?
            <Signup setRegStatus={setRegStatus} mail={mail} /> :
            <form className='flex justify-center items-center w-full lg:w-[50vw] pt-[25vh] lg:p-0 mx-auto lg:mx-0'>
                <div>
                    <h1 className='font-extrabold text-5xl text-center'>Register here!</h1>
                    <p className='text-center mt-3 lg:text-base text-sm'>Enter your mail and Verify it!</p>
                    <div className='flex flex-col justify-center items-center mt-5'>
                        <input
                            type="text"
                            className={`w-[300px] lg:w-[400px] bg-gray-300 py-2 px-3.5 rounded m-1.5 placeholder-slate-800 text-[12px] lg:text-sm `}
                            placeholder='Enter your mail'
                            value={mail}
                            onChange={(e) => setMail(e.target.value)}
                            required />
                        {!sentOTP && <button className='w-[300px] text-[12px] lg:w-[400px] bg-[#97D4A6] py-2 px-3.5 rounded m-1.5 lg:text-sm' onClick={handleOTPSend}>Send OTP</button>}
                        {sending && <MoonLoader color='#3F5F4F' size={30} />}
                        {(sentOTP && !sending) &&
                            <>
                                <input
                                    type="text"
                                    className={`w-[300px] lg:w-[400px] bg-gray-300 py-2 px-3.5 rounded m-1.5 placeholder-slate-800 text-[12px] lg:text-sm`}
                                    placeholder='Enter your OTP'
                                    onChange={(e) => setOTP(e.target.value)}
                                    required />
                                <button className='w-[300px] text-[12px] lg:w-[400px] bg-[#97D4A6] py-2 px-3.5 rounded m-1.5 lg:text-sm' onClick={handleOTPVerify}>Verify OTP</button>
                            </>
                        }
                    </div>

                    <p className='text-[12px] lg:text-sm text-center m-3'>Already have an account? <span className='text-[#3F5F4F] cursor-pointer underline' onClick={() => setRegStatus(true)}>Login here</span></p>
                </div>
            </form>


    )
}

export default Verification
