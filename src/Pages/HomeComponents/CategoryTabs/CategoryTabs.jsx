import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import useAxios from "../../../hooks/useAxios";

// Categories
const categories = ["Breakfast", "Lunch", "Dinner", "Snacks/Breakfast", "All"];

const CategoryTabs = () => {
  const axiosInstance = useAxios();
  const [selectedCategory, setSelectedCategory] = useState("Breakfast");
  const [limit, setLimit] = useState(8);
  const [activeTab, setActiveTab] = useState("Meal");
  const [mealsData, setMealsData] = useState({ meals: [], upcomingMeals: [] });
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // <-- Track if data already loaded

  const headerRef = useRef(null);
  const sectionRef = useRef(null);
  const [sectionInView, setSectionInView] = useState(false);

  // IntersectionObserver to check if section is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setSectionInView(entry.isIntersecting),
      { rootMargin: "-100px" }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch meals (scroll-triggered but only once)
  useEffect(() => {
    if (!dataLoaded) {
      setLoading(true);
      const url = `/meals-by-category?category=${encodeURIComponent(
        selectedCategory
      )}&type=${activeTab === "Meal" ? "meal" : "upcoming"}&limit=${limit}`;

      axiosInstance
        .get(url)
        .then((res) => {
          setMealsData(res.data);
          setDataLoaded(true); // Mark as loaded
        })
        .catch(() => setMealsData({ meals: [], upcomingMeals: [] }))
        .finally(() => setLoading(false));
    }

    // Smooth scroll if section is in view
    if (sectionInView && sectionRef.current) {
      const extraSpacing = Math.round(window.innerHeight * 0.1);
      const headerHeight = (headerRef.current?.offsetHeight || 0) + extraSpacing;
      const sectionTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: sectionTop - headerHeight,
        behavior: "smooth",
      });
    }
  }, [sectionInView, selectedCategory, limit, activeTab, axiosInstance, dataLoaded]);

  const mealsToRender = activeTab === "Meal" ? mealsData.meals : mealsData.upcomingMeals;

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
                setDataLoaded(false); // Reset dataLoaded when category changes
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

        {/* Tabs + Limit Selector */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-3 justify-around items-center w-full">
            <button
              onClick={() => {
                setActiveTab("Meal");
                setDataLoaded(false); // Reset when tab changes
              }}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition btn ${
                activeTab === "Meal"
                  ? "btn-secondary"
                  : "btn-outline hover:bg-primary hover:text-white"
              }`}
            >
              Meal
            </button>
            <button
              onClick={() => {
                setActiveTab("Upcoming");
                setDataLoaded(false); // Reset when tab changes
              }}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition btn ${
                activeTab === "Upcoming"
                  ? "btn-secondary"
                  : "btn-outline hover:bg-primary hover:text-white"
              }`}
            >
              Upcoming
            </button>
          </div>

          <div className="w-full flex justify-center">
            {selectedCategory === "All" && activeTab === "Meal" && (
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setDataLoaded(false); // Reset when limit changes
                }}
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

// Reusable MealCard Skeleton
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

// Reusable MealCard
const MealCard = ({ meal, label }) => (
  <div className="relative rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 bg-base-200 flex flex-col">
    <div className="relative h-48">
      <img
        src={meal.image || "https://via.placeholder.com/300x200?text=No+Image"}
        alt={meal.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <span className="bg-red-100 text-red-600 px-2 py-1 text-xs rounded shadow font-medium">
          ❤️ {meal.likes || 0}
        </span>
        <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded shadow font-medium">
          🗨️ {meal.reviews_count || 0}
        </span>
      </div>
    </div>

    <div className="p-4 flex flex-col flex-1 justify-between">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-base-content line-clamp-1">
          {meal.title}
        </h3>
        <p className="text-sm text-base-content/70 line-clamp-2">
          {meal.category}
        </p>
      </div>

      <div className="flex justify-between items-center text-sm text-base-content/70 mt-3 mb-2">
        <span>
          Price: <span className="text-primary font-bold">৳{meal.price}</span>
        </span>
      </div>

      <Link
        to={
          label === "Meal"
            ? `/meal-details/${meal._id}`
            : `/upcoming-meal-details/${meal._id}`
        }
        className="btn btn-sm btn-outline w-full mt-2"
      >
        Details
      </Link>
    </div>
  </div>
);

export default CategoryTabs;
