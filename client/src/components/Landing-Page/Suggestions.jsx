import bgSemiGreen from '../../assets/bg-semi-2.png'

function Suggestions({ title, author, desc, img, direction }) {
    return (
        <div className={`relative lg:flex hidden h-[400px] bg-cover mt-8 flex items-center justify-center px-12 ${direction === 'left' ? 'flex-row-reverse' : null}`} style={{ backgroundImage: `url(${bgSemiGreen})` }}>
            <img src={`${img}`} alt="" className='w-[250px] self-end' />
            <div>
                <h3 className={`font-bold text-lg mt-24 ${direction === 'left' ? 'text-right mr-8' : 'ml-8'}`}>{title}</h3>
                <p className={`font-semibold text-slate-800 ${direction === 'left' ? 'text-right mr-8' : 'ml-8'}`}>{author}</p>
                <p className={`text-base text-sm mt-8 ${direction === 'left' ? 'text-right mr-8' : 'ml-8'}`}>{desc}</p>
            </div>
        </div>
    )
}

export default Suggestions
