import { Link } from 'react-router-dom'
import searchIcon from '../assets/search-icon.png'

function Sidebar({ isExpand, userProjects, forkedProjects, username, setExpand }) {
    return (
        <div className={`z-[100] fixed h-[100vh] bg-white transition-all duration-700 ease-in-out shadow-xl ${isExpand ? 'w-[60vw] lg:w-[25%] xl:w-[19%]' : 'w-0'} overflow-hidden`}>
            <div className={` pt-20 ${isExpand ? 'block' : 'hidden'}`}>
                <Link to='/NewProject'><button className="bg-[#3F5F4F] ml-3 text-sm text-white px-2 py-1.5 rounded">+ New</button></Link>
                <form className='mt-2 relative'>
                    <input type="text" placeholder="Search Here" className="absolute left-[-12%] pl-10 py-3 text-sm w-[250px] my-5 bg-gray-100 h-[30px] rounded-3xl border-transparent" />
                    <button className="absolute bg-[#3F5F4F] text-slate-100 border-solid border-[#3F5F4F] border-2 py-1.5 px-3 right-[5px] top-[19.5px] rounded-3xl rounded-l-none"><img src={searchIcon} className='w-[15px]' />
                    </button>
                </form>
                <p className='ml-3 mt-20 text-base text-slate-800 font-semibold'>Your Contributions:</p>
                <div className='ml-3 mt-2 w-[220px] max-h-[150px] overflow-auto'>
                    {userProjects.length ? userProjects.map(ele => (
                        <Link to={`/myProject/${ele._id}`}><p key={ele._id} className='pb-0.5 ml-2 text-[14px] text-slate-800 hover:underline cursor-pointer'>{username}/<span>{ele.title}</span></p></Link>
                    )) :
                        <p className='m-3 text-[14px] text-gray-500'>No Project to show</p>}
                </div>
                <p className='ml-3 mt-20 text-base text-slate-800 font-semibold'>Your Forked Projects:</p>
                <div className='ml-3 mt-2 w-[220px] max-h-[150px] overflow-auto'>
                    {forkedProjects.length ? forkedProjects.map(ele => (
                        <Link to={`/forkedProject/${ele.id}`}><p key={ele.id} className='pb-0.5 ml-2 text-[14px] text-slate-800 hover:underline cursor-pointer'>{username}/<span>{ele.title}</span></p></Link>
                    )) :
                        <p className='m-3 text-[14px] text-gray-500'>No Project to show</p>}
                </div>
                <button onClick={() => setExpand(!isExpand)} className='ml-3.5 mt-5 text-[12px] px-1.5 py-0.5 lg:hidden bg-red-100 border border-red-400 text-red-500 rounded '>Go Back</button>
            </div>
        </div>
    )
}

export default Sidebar;

