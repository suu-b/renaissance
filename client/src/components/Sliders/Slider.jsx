import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import carouselOne from "../../assets/carousel-bg/renaissance-carousel-i.jpg"
import carouselTwo from "../../assets/carousel-bg/renaissance-carousel-ii.jpg"
import carouselThree from "../../assets/carousel-bg/renaissance-carousel-iii.jpg"
import carouselFour from "../../assets/carousel-bg/renaissance-carousel-iv.jpg"

const SampleNextArrow = ({ className, style, onClick }) => {
    return <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", right: "20px", zIndex: 5 }} onClick={onClick} />
}

const SamplePrevArrow = ({ className, style, onClick }) => {
    return <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", left: "20px", zIndex: 5 }} onClick={onClick} />
}

export default function SimpleSlider() {
    var settings = {
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 3000,
        cssEase: "linear",
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />
    };

    return (
        <div className="lg:w-full m-auto lg:h-[40vh]">
            <Slider {...settings}>
                <div className="card w-full h-full">
                    <img src={carouselFour} alt="renaissance-carousel" className="card-content object-cover object-center w-[100vw] h-[50vh] lg:h-full lg:w-full" />
                    <div className="card-hover flex flex-col px-8">
                        <p className=" font-bold text-white">The Creation of Adam</p>
                        <p className=" font-semibold text-white">(Michelangelo)</p>
                        <p className="text-[13px] mt-8 w-[80%]">The Creation of Adam, also known as The Creation of Man a fresco painting by Italian artist Michelangelo, which forms part of the Sistine Chapel's ceiling, painted c. 1508–1512. It illustrates the Biblical creation narrative from the Book of Genesis in which God gives life to Adam, the first man.</p>
                    </div>
                </div>
                <div className="card w-full">
                    <img src={carouselTwo} alt="renaissance-carousel" className="card-content object-cover object-center w-[100vw] h-[50vh] lg:h-full lg:w-full" />
                    <div className="card-hover flex flex-col px-8">
                        <p className=" font-bold text-white">The Last Supper</p>
                        <p className=" font-semibold text-white">(Leonardo Da Vinci)</p>
                        <p className="text-[13px] mt-8 w-[80%]">The Last Supper is a mural painting by the Italian High Renaissance artist Leonardo da Vinci, dated to c. 1495–1498, housed in the refectory of the Convent of Santa Maria delle Grazie in Milan, Italy. The painting represents the scene of the Last Supper of Jesus with the Twelve Apostles, as it is told in the Gospel of John – specifically the moment after Jesus announces that one of his apostles will betray him.</p>
                    </div>
                </div>
                <div className="card w-full">
                    <img src={carouselThree} alt="renaissance-carousel" className="card-content object-cover object-center w-[100vw] h-[50vh] lg:h-full lg:w-full" />
                    <div className="card-hover flex flex-col px-8">
                        <p className=" font-bold text-white">Primevera</p>
                        <p className=" font-semibold text-white">(Sandro Botticelli)</p>
                        <p className="text-[13px] mt-8 w-[80%]">Primavera is a large panel painting in tempera paint by the Italian Renaissance painter Sandro Botticelli.The painting depicts a group of figures from classical mythology in a garden, but no story has been found that brings this particular group together.Most critics agree that the painting is an allegory based on the lush growth of Spring</p>
                    </div>
                </div>
                <div className="card w-full">
                    <img src={carouselOne} alt="renaissance-carousel" className="card-content object-cover object-center w-[100vw] h-[50vh] lg:h-full lg:w-full" />
                    <div className="card-hover flex flex-col px-8">
                        <p className=" font-bold text-white">School of Athens</p>
                        <p className=" font-semibold text-white">(Raphael)</p>
                        <p className="text-[13px] mt-8 w-[80%]">The School of Athens is a fresco by the Italian Renaissance artist Raphael. The fresco depicts a congregation of ancient philosophers, mathematicians, and scientists, with Plato and Aristotle featured in the center. The identities of most figures are ambiguous or discernable only through subtle details or allusions.</p>
                    </div>
                </div>
            </Slider>
        </div>)
}

