import { useState } from 'react'
import Login from './Login'
import Signup from './Signup'
import deDanteWall from '../../assets/Dante-wall.png'
import Verification from './Verification'

function Register({ isLogin, setLogin }) {
    const [isRegistered, setRegStatus] = useState(true)

    return (
        <div className='lg:flex lg:items-center lg:justify-center'>
            <div className='lg:block hidden w-[50vw] h-[100vh] bg-cover' style={{ backgroundImage: `url(${deDanteWall})` }}>
            </div>
            {!isRegistered ? <Verification setRegStatus={setRegStatus} /> : <Login setRegStatus={setRegStatus} setLogin={setLogin} isLogin={isLogin} />}
        </div >
    )
}

export default Register
