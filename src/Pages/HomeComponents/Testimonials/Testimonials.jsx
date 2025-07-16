import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useAuth from "../../../hooks/useAuth";

const TestimonialsSection = ({ featuredReviews = [] }) => {
  const { user } = useAuth();

  // ইউজারের রিভিউ আছে কিনা চেক করো
  const hasUserReview = featuredReviews.some((review) => review.email === user?.email);

  // ৩ টা করে ভাগ করো
  const chunked = [];
  for (let i = 0; i < featuredReviews.length; i += 3) {
    chunked.push(featuredReviews.slice(i, i + 3));
  }

  const settings = {
    dots: true,
    infinite: chunked.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

 return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-primary">
        💬 ইউজারদের অভিজ্ঞতা
      </h2>

      {/* ✅ Show a card if user has no review */}
      {user?.email && !hasUserReview && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-xl mb-6 max-w-xl mx-auto">
          <p className="font-medium text-center">To see your name, please review first.</p>
        </div>
      )}

      <Slider {...settings}>
        {chunked.map((group, idx) => (
          <div key={idx}>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
              {group.map((item) => (


                <div key={item._id} className="">

                  {/* রেটিং (মাঝে) */}
                  <div className="flex justify-center mb-12">
                    <div className="rating rating-sm">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <input
                          key={i}
                          type="radio"
                          className="mask mask-star-2 bg-orange-400"
                          readOnly
                          checked={item.rating === i}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="relative bg-base-200 shadow-lg p-6 rounded-xl hover:shadow-xl transition-all border border-gray-500">


                    {/* রিভিউকার্ডের উপরে ব্যবহারকারীর ছবি */}
                    <div className="flex justify-center mb-4 absolute -top-10 right-32">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 bg-amber-200 rounded-full object-cover border-2 border-gray-400"
                      />
                    </div>
                    <div className="mt-12 min-h-[100px] h-full ">
                      {/* ব্যবহারকারীর নাম */}
                      <h3 className="text-lg font-semibold text-primary text-center mb-2">{item.name}</h3>

                      {/* রিভিউ কমেন্ট (উদ্ধৃতি চিহ্ন সহ) */}
                      <p className="text-sm text-gray-700 italic text-center">
                        <span className="font-bold">“</span>{item.review}<span className="font-bold">”</span>
                      </p>


                      {/* লোকেশন এবং তারিখ */}

                      <p className="text-xs text-gray-400 text-center mt-2">
                        {new Date(item.createdAt).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default TestimonialsSection;
