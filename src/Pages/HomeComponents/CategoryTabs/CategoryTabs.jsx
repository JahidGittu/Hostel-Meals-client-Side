import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import useAxios from "../../../hooks/useAxios";

const categories = ["Breakfast", "Lunch", "Dinner", "Snacks/Breakfast", "All"];

const CategoryTabs = () => {
  const axiosInstance = useAxios();
  const [selectedCategory, setSelectedCategory] = useState("Breakfast");
  const [limit, setLimit] = useState(8);
  const [activeTab, setActiveTab] = useState("Meal");
  const [mealsData, setMealsData] = useState({ meals: [], upcomingMeals: [] });
  const [loading, setLoading] = useState(false);

  const headerRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    setLoading(true);

    const url = `/meals-by-category?category=${encodeURIComponent(
      selectedCategory
    )}&type=${activeTab === "Meal" ? "meal" : "upcoming"}&limit=${limit}`;

    axiosInstance
      .get(url)
      .then((res) => setMealsData(res.data))
      .catch(() => setMealsData({ meals: [], upcomingMeals: [] }))
      .finally(() => {
        setLoading(false);

        // Scroll automatically header-এর নিচে + extra spacing
        const extraSpacing = Math.round(window.innerHeight * 0.1);
        const headerHeight =
          (headerRef.current?.offsetHeight || 0) + extraSpacing;

        if (sectionRef.current) {
          const sectionTop =
            sectionRef.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: sectionTop - headerHeight,
            behavior: "smooth",
          });
        }
      });
  }, [selectedCategory, limit, activeTab, axiosInstance]);

  const mealsToRender =
    activeTab === "Meal" ? mealsData.meals : mealsData.upcomingMeals;

  return (
    <div className="px-4 max-w-7xl mx-auto">
      {/* Sticky Header */}
      <div
        ref={headerRef}
        className="sticky top-16 z-20 bg-base-100 pt-4 pb-4 mb-4 shadow-sm"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
            Our Menu
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base">
            Discover our variety of delicious meals prepared with love & care.
          </p>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setLimit(8);
              }}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-primary text-primary-content shadow-md"
                  : "bg-base-200 text-base-content hover:bg-primary hover:text-primary-content"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Meal / Upcoming Tabs + Limit Selector */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          {/* Tabs */}
          <div className="flex gap-3 justify-around items-center w-full">
            <button
              onClick={() => setActiveTab("Meal")}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition btn ${
                activeTab === "Meal"
                  ? "btn-secondary"
                  : "btn-outline hover:bg-primary hover:text-white"
              }`}
            >
              Meal
            </button>
            <button
              onClick={() => setActiveTab("Upcoming")}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition btn ${
                activeTab === "Upcoming"
                  ? "btn-secondary"
                  : "btn-outline hover:bg-primary hover:text-white"
              }`}
            >
              Upcoming
            </button>
          </div>

          {/* Limit Selector */}
          {selectedCategory === "All" && activeTab === "Meal" && (
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="select select-bordered w-40"
            >
              <option value={4}>Show 4</option>
              <option value={8}>Show 8</option>
              <option value={12}>Show 12</option>
              <option value={16}>Show 16</option>
              <option value={0}>Show All</option>
            </select>
          )}
        </div>
      </div>

      {/* Meals Grid */}
      <div ref={sectionRef} className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <MealCardSkeleton key={idx} />
            ))}
          </div>
        ) : mealsToRender.length === 0 ? (
          <p className="text-center text-base-content">
            No data found for this selection.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mealsToRender.map((meal) => (
              <MealCard
                key={meal._id}
                meal={meal}
                label={activeTab === "Meal" ? "Meal" : "Upcoming Meal"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* Meal Card Skeleton */
const MealCardSkeleton = () => (
  <div className="rounded-xl shadow-md overflow-hidden bg-base-200 animate-pulse flex flex-col">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-4 flex flex-col flex-1 justify-between">
      <div>
        <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/5"></div>
      </div>
    </div>
  </div>
);

/* Meal Card Component */
const MealCard = ({ meal, label }) => (
  <div className="relative rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 bg-base-200 flex flex-col">
    <div className="relative h-48">
      <img
        src={meal.image || "https://via.placeholder.com/300x200?text=No+Image"}
        alt={meal.title}
        className="w-full h-full object-cover"
      />
      <span className="absolute top-2 right-2 bg-base-200 text-base-content px-2 py-1 text-xs rounded shadow">
        👍 {meal.likes || 0}
      </span>
    </div>
    <div className="p-4 flex flex-col flex-1 justify-between">
      <div>
        <h3 className="font-semibold text-lg mb-1 text-base-content line-clamp-1">
          {meal.title}
        </h3>
        <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
          {meal.category}
        </p>
      </div>
      <div className="flex justify-between items-center text-sm mb-3">
        <span className="text-base-content/70">
          📝 {meal.reviews_count || 0} reviews
        </span>
        <span className="text-primary font-bold">৳{meal.price}</span>
      </div>
      <div className="flex justify-between items-center gap-2">
        <Link
          to={
            label === "Meal"
              ? `/meal-details/${meal._id}`
              : `/upcoming-meal-details/${meal._id}`
          }
          className="btn btn-sm btn-outline flex-1"
        >
          Details
        </Link>
        <span className="text-xs italic text-base-content/50">{label}</span>
      </div>
    </div>
  </div>
);

export default CategoryTabs;
