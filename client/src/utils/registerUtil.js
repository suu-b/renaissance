import axios from 'axios'
import { toast } from 'react-toastify'

const registerUtil = (data) => {
    axios.post(`${import.meta.env.VITE_API_USER_URI}/register`, data)
        .then(response => {
            toast.success("Registration Successfull. Login to Proceed.")
        })
        .catch(error => {
            console.log(error.response.data)
        })
}

export default registerUtil