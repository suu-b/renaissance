import getCookie from './getCookie'
import { jwtDecode } from 'jwt-decode'

const getUserDetails = (query) => {
    const token = getCookie('accessToken')
    if (!token) {
        console.log("No Token available")
        return null
    }
    try {
        const decodedToken = jwtDecode(token);
        return decodedToken[query];
    }
    catch (error) {
        console.log('Failed to decode token', error);
        return null;
    }
}

export default getUserDetails