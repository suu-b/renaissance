import { PropagateLoader } from 'react-spinners'

function Loader() {
    return (
        <div className='h-[100vh] w-full flex justify-center items-center bg-gray-100'>
            <div className='flex flex-col items-center'>
                <h3 className='text-[#3F5F4F] text-lg lg:text-xl font-bold mt-3 w-fit m-auto'>We're just there...</h3>
                <PropagateLoader color='#3F5F4F' size={15} className='mt-5' />
            </div>
        </div>
    )
}

export default Loader
