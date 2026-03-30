import { useEffect, useState } from 'react'
import celebratingDoodle from '../../assets/celebrating.png'
import Loader from '../Loaders/Loader'
import { toast } from 'react-toastify'
import { getArtistsOne } from '../../utils/apiUtils'
import { useParams } from 'react-router-dom'

function DailyArtist() {
    const [artistOfTheDay, setArtistOfTheDay] = useState(null)
    const { artistID } = useParams()
    useEffect(() => {
        getArtistsOne(artistID)
            .then(response => setArtistOfTheDay(response.data))
            .catch(error => {
                console.log(error)
                toast.error("Failed to fetch today's artist of the day")
            })
    }, [])
    return (
        artistOfTheDay ?
            <div className='flex justify-between'>
                <div className='w-1/2 flex flex-col justify-center items-center h-[100vh] bg-gray-100 shadow-lg border'>
                    <h1 className='font-bold text-xl font-bold text-[#3F5F4F]'>RENAISSANCE</h1>
                    <img src={celebratingDoodle} alt="celebrating" className='w-[48vw]' />
                    <div className="w-[350px] bg-cover h-[350px] rounded-full shadow-lg mt-[-40px]" style={{ backgroundImage: `url(${artistOfTheDay.artistImageSrc})` }} />
                </div>
                <div className='w-1/2 py-8 px-8 h-[100vh] overflow-auto'>
                    <h1 className='text-slate-700 text-3xl font-bold'>Artist of the day</h1>
                    <p className='text-sm text-gray-400 mt-1.5'>We celebrate the most eloquent personalities of litrature, art and music here in Renaissance. Come daily to visit the most beautiful pieces ever created in the history and know the artist behind them!</p>
                    <hr className='mt-5' />
                    <p className='text-[15px] text-slate-600 mt-5 text-center'><em>{artistOfTheDay.quote}</em></p>
                    <h3 className='text-[#3F5F4F] font-bold text-3xl text-center mt-3'>{artistOfTheDay.artistName}</h3>
                    <div className='mt-5'>
                        <h3 className='text-slate-700 font-bold text-xl ml-3'>About</h3>
                        <p className='text-justify text-[15px] text-slate-600 border p-5 rounded bg-gray-100 mt-1.5'>{artistOfTheDay.artistBio}</p>
                    </div>
                    <div className='mt-5'>
                        <h3 className='text-slate-700 font-bold text-xl ml-3'>Biography</h3>
                        <div className='text-justify text-[15px] text-slate-600 border p-5 rounded bg-gray-100 mt-1.5 flex flex-col'>
                            <div>
                                <h3 className='text-slate-700 font-bold text-lg mt-3'>Birth</h3>
                                <p>{artistOfTheDay.birth}</p>
                            </div>
                            <div>
                                <h3 className='text-slate-700 font-bold text-lg mt-3'>Death</h3>
                                <p>{artistOfTheDay.death}</p>
                            </div>
                            <div>
                                <h3 className='text-slate-700 font-bold text-lg mt-3'>Parents</h3>
                                <p>{artistOfTheDay.parent}</p>
                            </div>
                        </div>
                    </div>
                    <div className='mt-5'>
                        <h3 className='text-slate-700 font-bold text-xl ml-3'>Life</h3>
                        <p className='text-justify text-[15px] text-slate-600 border p-5 rounded bg-gray-100 mt-1.5'>
                            John Keats (1795-1821) was an influential English Romantic poet born in London. He initially trained as an apothecary before fully dedicating himself to poetry. Over his brief career, he created a significant body of work, including renowned poems such as "Ode to a Nightingale," "Ode on a Grecian Urn," and "To Autumn." Known for his vivid imagery and emotional depth, Keats's work explores themes of beauty, mortality, and the human experience. Despite facing criticism during his lifetime, his poetry gained acclaim posthumously. Keats's life was tragically cut short by tuberculosis at the age of 25, yet his literary legacy endures, marking him as a key figure in English literature.                    </p>
                    </div>
                    <div className='mt-5'>
                        <h3 className='text-slate-700 font-bold text-xl ml-3'>Life Works</h3>
                        <div className='flex justify-between items-center mt-3'>
                            <img title="Buy On Amazon" src="https://m.media-amazon.com/images/I/716VHWLJ0uL._AC_UF1000,1000_QL80_.jpg" alt="" className='w-44' />
                            <img title="Buy On Amazon" src="https://m.media-amazon.com/images/I/711lDbGxnqL._AC_UF1000,1000_QL80_.jpg" alt="" className='w-44' />
                            <img title="Buy On Amazon" src="https://m.media-amazon.com/images/I/91vsM7hh5HL._AC_UF1000,1000_QL80_.jpg" alt="" className='w-44' />
                        </div>
                    </div>
                    <hr className='mt-8 mb-3' />
                    <p className='text-center text-slate-500 text-sm'>We own none of the images used here. All of them belong to their respective owners.</p>
                    <p className='text-center text-slate-500 text-sm'>Renaissance</p>
                </div>
            </div>
            : <Loader />
    )
}

export default DailyArtist
