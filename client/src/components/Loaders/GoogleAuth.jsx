import { PropagateLoader } from 'react-spinners'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import setCookie from '../../utils/setCookie'

function GoogleAuth({ setLogin }) {
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if (token) {
            setCookie('accessToken', token, 1) 
            setLogin(true)
            toast.success("Login Successful!")
            navigate('/Dashboard')
        } else {
            toast.error("Login Failed. Try again later.")
            navigate('/login')
        }
    }, [])

    return (
        <div className='h-[100vh] w-full flex justify-center items-center bg-gray-100'>
            <div className='flex flex-col items-center'>
                <h3 className='text-[#3F5F4F] text-xl font-bold mt-3 w-fit m-auto'>We're just there...</h3>
                <PropagateLoader color='#3F5F4F' size={15} className='mt-5' />
            </div>
        </div>
    )
}

export default GoogleAuth
