import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { FaSearch } from "react-icons/fa";
import bannerImg1 from "../../../assets/banner/banner1.jpg";
import bannerImg2 from "../../../assets/banner/banner2.jpg";
import bannerImg3 from "../../../assets/banner/banner3.jpg";
import useAxios from "../../../hooks/useAxios";

const Banner = () => {
    const axiosInstance = useAxios();
    const navigate = useNavigate();

    const bannerContent = {
        title: "Welcome to Our University Hostel",
        description:
            "Explore today's meals, give your feedback, and share your review to help us serve better.",
    };

    const bannerImages = [bannerImg1, bannerImg2, bannerImg3];

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const debounceTimeout = useRef(null);

    const fetchSuggestions = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `/search-meals?q=${encodeURIComponent(searchTerm)}`
            );
            setSuggestions(res.data || []);
        } catch (error) {
            console.error("Error fetching search suggestions:", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            fetchSuggestions(query);
        }, 400);

        return () => clearTimeout(debounceTimeout.current);
    }, [query]);

    const handleChange = (e) => {
        setQuery(e.target.value);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (id, type) => {
        setShowSuggestions(false);
        setQuery(""); // Optional: খালি করে দিতে পারো ইনপুট

        if (type === "meal") {
            navigate(`/meal-details/${id}`);
        } else if (type === "upcoming") {
            navigate(`/upcoming-meal-details/${id}`);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest("#search-container")) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

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
                        <img
                            src={img}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-screen object-cover"
                        />
                    </div>
                ))}
            </Carousel>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60 z-10"></div>

            {/* Static text and search */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white text-center px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                    {bannerContent.title}
                </h2>
                <p className="text-base md:text-lg mb-6 max-w-2xl drop-shadow-md">
                    {bannerContent.description}
                </p>

                <div
                    id="search-container"
                    className="w-full max-w-md relative text-left"
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-owns="search-suggestion-list"
                    aria-expanded={showSuggestions}
                >
                    <input
                        type="text"
                        placeholder="Search meals, ingredients, or category..."
                        value={query}
                        onChange={handleChange}
                        onFocus={() => setShowSuggestions(true)}
                        className="input input-bordered w-full focus:outline-none rounded-full pr-14 bg-white text-black placeholder:text-gray-700"
                        aria-autocomplete="list"
                        aria-controls="search-suggestion-list"
                    />
                    <button
                        type="submit"
                        onClick={(e) => e.preventDefault()}
                        className="absolute rounded-full right-1 top-1/2 transform -translate-y-1/2 btn btn-accent btn-sm flex items-center gap-1 z-10"
                        aria-label="Search"
                    >
                        <FaSearch />
                        Search
                    </button>

                    {showSuggestions && query.trim() && (
                        <ul
                            id="search-suggestion-list"
                            role="listbox"
                            className="absolute mt-1 max-h-60 w-full overflow-y-auto rounded-lg bg-white shadow-lg z-30 text-black"
                        >
                            {loading && (
                                <li className="p-2 text-center italic text-gray-500">Loading...</li>
                            )}
                            {!loading && suggestions.length === 0 && (
                                <li className="p-2 text-center text-gray-500">No results found</li>
                            )}
                            {!loading &&
                                suggestions.map(({ _id, title, type, image }) => (
                                    <li
                                        key={_id}
                                        role="option"
                                        tabIndex={0}
                                        onClick={() => handleSuggestionClick(_id, type)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSuggestionClick(_id, type);
                                        }}
                                        className="cursor-pointer flex items-center gap-3 px-4 py-2 hover:bg-accent hover:text-white"
                                    >
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={title}
                                                className="w-10 h-10 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-300 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                                No Img
                                            </div>
                                        )}

                                        <div>
                                            <div>{title}</div>
                                            <span className="text-xs italic text-gray-500">
                                                Type:
                                                ({type === "meal" ? "Meal" : "Upcoming"})
                                            </span>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Banner;
