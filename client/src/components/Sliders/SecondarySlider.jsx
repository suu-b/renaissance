import React, { Component, lazy, useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import bgSemiGreen from '../../assets/bg-semi-2.png'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import downChevron from '../../assets/arrow.png'

const SampleNextArrow = ({ className, style, onClick }) => {
    return <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClick} />
}

const SamplePrevArrow = ({ className, style, onClick }) => {
    return <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClick} />
}

function SecondarySlider({ imageArray }) {
    const [imageIndex, setImageIndex] = useState(0)
    const [selectedArtist, setSelectedArtist] = useState(null)
    const modalRef = useRef(null)
    const settings = {
        infinite: true,
        centerPadding: "0px",
        slidesToShow: 3,
        speed: 1200,
        centerMode: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        beforeChange: (current, next) => {
            setImageIndex(next)
            if (selectedArtist != null) {
                setSelectedArtist(next)
            }
        }
    }
    useEffect(() => {
        if (selectedArtist != null) {
            modalRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [selectedArtist])

    const setPopUp = (index) => {
        setSelectedArtist(index)
    }

    return (
        <div className="xl:h-[400px] lg:h-[320px] bg-cover relative" style={{ backgroundImage: `url(${bgSemiGreen})` }}>
            <div ref={modalRef} />
            <Slider {...settings} className="slider-container lg:w-[70vw] m-auto h-[200px] lg:h-[350px]">
                {imageArray.map((image, index) => (
                    <div key={image._id} className={index == imageIndex ? "scale-[1.2] lg:scale-[1.1] transition-transform lg:px-5 p-2 lg:py-8 rounded shadow-xl bg-white" : "shadow-xl p-2 lg:p-5 scale-[0.7] lg:scale-[0.8] bg-[#97D4A6] rounded"}>
                        <img src={image.artistImageSrc} alt={image.artistName} className="rounded w-[300px] lg:w-[800px] object-contain" />
                        {index == imageIndex && <div className="absolute bottom-[15%] w-[90%] m-auto" onClick={() => setPopUp(index)}>
                            <img src={downChevron} className="w-3 lg:w-5 m-auto animate-bounce cursor-pointer" alt="" />
                            {selectedArtist == null && <p className="text-[11px] lg:text-[15px] text-white text-shadow text-center mb-1.5 cursor-pointer">{image.artistName}</p>}
                        </div>}
                    </div>
                ))}
            </Slider>
            {selectedArtist != null &&
                <div className="w-[80vw] py-5 lg:py-8 px-3 lg:px-5 rounded m-auto bg-white absolute top-[130px] left-[10%] lg:top-[350px] shadow-xl pt-0 ">
                    <button onClick={() => setPopUp(null)} className="lg:text-lg text-sm absolute right-3 top-3">Close</button>
                    <h1 className="font-bold text-center lg:text-lg text-sm lg:mt-0 mt-3">{imageArray[selectedArtist].artistName}</h1>
                    <h1 className="text-center lg:text-lg text-[13px]">{imageArray[selectedArtist].birth}</h1>
                    <p className="p-3 text-black lg:text-lg text-[13px]">{imageArray[selectedArtist].artistBio}</p>
                </div>
            }
        </div>
    );
}

export default SecondarySlider;
