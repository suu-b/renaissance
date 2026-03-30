import axios from 'axios'
import { toast } from 'react-toastify'
import getCookie from './getCookie'

const logoutUtil = (setLogin) => {
    const accessToken = getCookie('accessToken')
    axios.post(`${import.meta.env.VITE_API_USER_URI}/logout`, {}, { headers: { Authorization: `bearer ${accessToken}` }, withCredentials: true })
        .then(response => {
            toast.success("Logout Sucessfull!")
            setLogin(false)
        })
        .catch(error => {
            console.log(error)
            toast.error("Logout Failed. Try again later.")
        })
}

export default logoutUtil