import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaStar } from "react-icons/fa";

const Testimonials = ({ featuredReviews = [], currentUserEmail }) => {
  const [chunked, setChunked] = useState([]);

  useEffect(() => {
    const chunks = [];
    for (let i = 0; i < featuredReviews.length; i += 3) {
      chunks.push(featuredReviews.slice(i, i + 3));
    }
    setChunked(chunks);
  }, [featuredReviews]);

  const settings = {
    dots: true,
    infinite: chunked.length > 1,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(.17,.67,.83,.67)",
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));

  const hasUserReview = featuredReviews.some(
    (review) => review.email === currentUserEmail
  );

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            💬 ইউজারদের অভিজ্ঞতা
          </h2>
        </div>

        {!hasUserReview && currentUserEmail && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-xl mb-6 max-w-xl mx-auto text-center">
            To see your name, please review first.
          </div>
        )}

        <Slider {...settings}>
          {chunked.map((group, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4">
                {group.map((item,idx) => (
                  <div
                    key={idx}
                    className="relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 flex flex-col items-center"
                  >
                    {/* Rating */}
                    <div className="flex justify-center mb-2">{renderStars(item.rating)}</div>

                    {/* Review */}
                    <p className="text-gray-700 italic text-center mb-6 text-sm md:text-base">
                      “{item.review}”
                    </p>

                    {/* Profile Image */}
                    {item.image && (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 mb-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* User Info */}
                    <h3 className="font-semibold text-lg ">{item.name}</h3>
                    {item.location && (
                      <p className="text-xs text-gray-400">{item.location}</p>
                    )}
                    {item.createdAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.createdAt).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
