import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import { FaSearch } from 'react-icons/fa';
import bannerImg1 from '../../../assets/banner/banner1.jpg';
import bannerImg2 from '../../../assets/banner/banner2.jpg';
import bannerImg3 from '../../../assets/banner/banner3.jpg';

const Banner = () => {
    const bannerContent = {
        title: "Welcome to Our University Hostel",
        description: "Explore today's meals, give your feedback, and share your review to help us serve better.",
    };

    const bannerImages = [bannerImg1, bannerImg2, bannerImg3];

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Carousel Background */}
            <Carousel
                autoPlay
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                interval={5000}
                swipeable
                showArrows={false}
                stopOnHover={false}
            >
                {bannerImages.map((img, index) => (
                    <div key={index} className="h-screen w-full">
                        <img src={img} alt={`Banner ${index + 1}`} className="w-full h-screen object-cover" />
                    </div>
                ))}
            </Carousel>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60 z-10"></div>

            {/* Static text over all slides */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white text-center px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">{bannerContent.title}</h2>
                <p className="text-base md:text-lg mb-6 max-w-2xl drop-shadow-md">{bannerContent.description}</p>

                <form className="w-full max-w-md">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search meals, reviews, or users..."
                            className="input input-bordered w-full focus:outline-none rounded-full pr-14 bg-white text-black placeholder:text-gray-700"
                        />
                        <button
                            type="submit"
                            className="absolute rounded-full right-1 top-1/2 transform -translate-y-1/2 btn btn-accent btn-sm flex items-center gap-1 z-10"
                        >
                            <FaSearch />
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Banner;
