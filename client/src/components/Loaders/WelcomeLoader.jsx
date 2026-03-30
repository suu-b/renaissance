import { PulseLoader } from 'react-spinners'
import randomGenNum from '../../utils/randomGenNum'
import randomFacts from './randomFacts.json'
import { useEffect, useState } from 'react'

import F01_img from '../../assets/facts/tolkien.jpeg'
import F02_img from '../../assets/facts/edgarAllenPoe.jpeg'
import F03_img from '../../assets/facts/markTwain.jpeg'
import F04_img from '../../assets/facts/roaldDahl.jpeg'
import F05_img from '../../assets/facts/agathaChristie.jpeg'
import F06_img from '../../assets/facts/douglasAdams.jpeg'
import F07_img from '../../assets/facts/williamShakespeare.jpeg'
import F08_img from '../../assets/facts/fyodor.jpeg'
import F09_img from '../../assets/facts/williamShakespeare.jpeg'
import F10_img from '../../assets/facts/james-joyce.jpeg'

function WelcomeLoader() {
    const [images, setImages] = useState([F01_img, F02_img, F03_img, F04_img, F05_img, F06_img, F07_img, F08_img, F09_img, F10_img])
    const [fact, setFact] = useState({})

    useEffect(() => {
        const index = randomGenNum(randomFacts.length)
        setFact(randomFacts[index])
        console.log(fact)
    }, [])

    useEffect(() => {
        console.log(images)
    }, [images])

    return (
        <div className='h-[100vh] w-full flex justify-center bg-gray-100'>
            <div className='flex flex-col items-center justify-center'>
                <h2 className='text-slate-700 text-lg lg:text-xl font-bold mt-5 text-center mt-3'>Renaisaance is Loading..</h2>
                <p className='text-slate-700 mb-3'>Meanwhile...</p>
                <PulseLoader color='#454a46' size={15} />
                <h2 className='text-green-900 text-lg lg:text-xl font-bold mt-3 text-center mt-3'>Did you know?</h2>
                <img src={images[fact.id]} alt="" className='w-[200px] lg:w-[250px] rounded-lg' />
                <h3 className='text-[#3F5F4F] text-[13px] lg:text-[16px] w-[50vw] lg:w-[30vw] font-semibold text-center mt-3'>{fact.fact}</h3>
            </div>
        </div>
    )
}

export default WelcomeLoader