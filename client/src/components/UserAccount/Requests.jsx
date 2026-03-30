import { useState, useEffect } from 'react'
import deBonaparte from '../../assets/deBonaparte.jpg'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchApprovalRequests } from '../../utils/apiUtils'
import getUserDetails from '../../utils/getUserDetails'
import getDateFromISO from '../../utils/getDateFromISO'

function Requests() {
    const [requests, setRequests] = useState(null)
    useEffect(() => {
        const userID = getUserDetails('userID')
        fetchApprovalRequests(userID)
            .then(response => {
                console.log(response.data)
                setRequests(response.data)
            })
            .catch(error => {
                toast.error("Failed to fetch any request")
                console.log(error)
            })
    }, [])
    return (
        <div className='py-10 px-8 bg-gray-100 rounded border border-gray-300 h-[80%] overflow-auto'>
            <h1 className="text-xl text-slate-700 font-bold ">Requests to Merge in your projects</h1>
            <div>
                {requests && requests.map(request => (
                    <div className="white shadow rounded py-5 px-8 bg-white my-5 flex justify-between">
                        <div className='lg:flex'>
                            {/* <img src={deBonaparte} alt="profile-image" className='rounded-full w-14 h-14 lg:w-24 lg:h-24' /> */}
                            <div className='mt-5 lg:m-5'>
                                <h1 className="text-lg lg:text-xl text-slate-700 font-bold ">{request.projectName}</h1>
                                <p className="text-[12px] lg:text-[14px] text-gray-500">By: {request.contributerName}</p>
                                <p className="text-[12px] lg:text-[14px] text-gray-500">{getDateFromISO(request.timestamp)}</p>
                            </div>
                        </div>
                        <div className='flex flex-col justify-center'>
                            <Link to={`/request/${request._id}`}><button className="bg-[#3F5F4F] border text-white border-[#3F5F4F] rounded text-[12px] lg:text-sm px-2 lg:px-3 py-1.5 rounded">View Request</button></Link>
                            <button className="border border-1.5 border-[#3F5F4F] rounded text-[12px] lg:text-sm px-2 lg:px-3 py-1.5 rounded mt-3">Merge Request</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Requests
