import github_logo from '../assets/socials/github.png'
import insta_logo from '../assets/socials/insta.png'
import linkedin_logo from '../assets/socials/linkedin.png'

function Footer() {
    return (
        <footer>
            <div className="px-5 pt-8 lg:px-20 mt-5 lg:mt-10 lg:pt-14 bg-gray-100 border-t">
                <div>
                    <h3 className='font-bold text-2xl text-slate-900'>Renaissance</h3>
                    <p className='text-[12px] lg:w-full w-[50vw] lg:text-[13px] text-slate-500'>Movement that changed the fate of the continent sunken into backwaters.</p>
                </div>
                <div className='flex lg:flex-row flex-col justify-between items-center w-full'>
                    <div className='mt-8 flex justify-between w-full lg:w-[50vw]'>
                        <div>
                            <h4 className='text-base font-bold text-slate-700'>ABOUT</h4>
                            <ul className='mt-3 text-[12px] lg:text-sm'>
                                <li className='text-slate-500'>Why Renaissance?</li>
                                <li className='text-slate-500 mt-1.5'>Terms and Conditions</li>
                                <li className='text-slate-500 mt-1.5'>Creator's' Page</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className='text-base font-bold text-slate-700'>WEBSITE</h4>
                            <ul className='mt-3 text-[12px] lg:text-sm'>
                                <li className='text-slate-500'>Explore</li>
                                <li className='text-slate-500 mt-1.5'>Artist of the Day</li>
                                <li className='text-slate-500 mt-1.5'>My Dashboard</li>
                                <li className='text-slate-500 mt-1.5'>My Profile</li>
                                <li className='text-slate-500 mt-1.5'>Credits</li>
                            </ul>
                        </div>
                        <div className='lg:ml-0 ml-5'>
                            <h4 className='text-base font-bold text-slate-700'>HELP AND SUPPORT</h4>
                            <ul className='mt-3 text-[12px] lg:text-sm'>
                                <li className='text-slate-500'>How to get started?</li>
                                <li className='text-slate-500 mt-1.5'>Terms and conditions</li>
                                <li className='text-slate-500 mt-1.5'>Help Desk</li>
                            </ul>
                        </div>
                    </div>
                    <div className='lg:ml-0 ml-3 lg:w-[20vw] mt-3'>
                        <h4 className='text-base font-bold text-slate-700'>CONTACTS</h4>
                        <ul className='mt-3 text-[12px] lg:text-sm'>
                            <p className='text-slate-500'>Questions? Drop a mail at</p>
                            <p className='text-slate-500 font-semibold'>shubham.thakur@kalvium.community</p>
                            <p className='text-slate-500'>A Capstone page made under the Full stack web development course by <a className='font-semibold underline' href='https://kalvium.com/' target='_blank'>Kalvium</a></p>

                        </ul>
                    </div>
                </div>
                <hr className='mt-8' />
                <p className='text-sm font-semibold text-center text-slate-700 mt-3'>Designed and Developed by Shubham Thakur</p>
                <div className='flex justify-center lg:pb-0 pb-5'>
                    <a href="" target='_blank'><img src={github_logo} alt="Visit GitHub" className="w-8 m-1.5" /></a>
                    <a href="" target='_blank'><img src={insta_logo} alt="Visit Instagram" className="w-8 m-1.5" /></a>
                    <a href="" target='_blank'><img src={linkedin_logo} alt="Visit LinkedIn" className="w-8 m-1.5" /></a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
