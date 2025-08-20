import React, { useEffect, useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import useSecureAxios from "../../hooks/useSecureAxios";
import useAxios from "../../hooks/useAxios";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Meals = () => {
  const secureAxios = useSecureAxios();
  const axiosInstance = useAxios();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minPriceLimit, setMinPriceLimit] = useState(null);
  const [maxPriceLimit, setMaxPriceLimit] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 600);
  const debouncedPriceRange = useDebounce(priceRange, 600);
  const [filterReady, setFilterReady] = useState(false);
  const drawerRef = useRef(null);

  // Fetch filter info
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const res = await axiosInstance.get("/meals-filter-info");
        setCategories(["All", ...res.data.categories]);
        setMinPriceLimit(res.data.minPrice);
        setMaxPriceLimit(res.data.maxPrice);
        setPriceRange([res.data.minPrice, res.data.maxPrice]);
        setFilterReady(true);
      } catch (err) {
        console.error("Failed to fetch filter info:", err);
      }
    };
    fetchFilterData();
  }, [axiosInstance]);

  const fetchMeals = async ({ pageParam = 1 }) => {
    const params = new URLSearchParams();
    params.set("page", pageParam);
    params.set("limit", 6);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category !== "All") params.set("category", category);
    params.set("minPrice", debouncedPriceRange[0]);
    params.set("maxPrice", debouncedPriceRange[1]);

    const res = await secureAxios.get(`/meals-public?${params.toString()}`);
    return {
      meals: res.data.meals,
      totalCount: res.data.totalCount,
      isLast: res.data.isLast,
      nextPage: res.data.isLast ? undefined : pageParam + 1,
    };
  };

  const { data, fetchNextPage, hasNextPage, isLoading, isError, error } =
    useInfiniteQuery({
      queryKey: ["meals", debouncedSearch, category, debouncedPriceRange],
      queryFn: fetchMeals,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
      enabled: filterReady && minPriceLimit !== null && maxPriceLimit !== null,
    });

  const meals = data?.pages.flatMap((p) => p.meals) || [];

  const onPriceRangeChange = (range) => setPriceRange(range);

  // Skeleton Card
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

  // Meal Card
  const MealCard = ({ meal }) => (
    <div className="overflow-hidden rounded-xl hover:shadow-xl">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="card bg-base-100 shadow-md flex flex-col transition-all duration-300"
      >
        <div className="relative h-48">
          <img
            src={
              meal.image || "https://via.placeholder.com/300x200?text=No+Image"
            }
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
            <h3
              className="text-lg font-semibold text-base-content line-clamp-1"
              title={meal.title}
            >
              {meal.title}
            </h3>
            <p className="text-sm text-base-content/70 line-clamp-2">
              {meal.category}
            </p>
          </div>
          <div className="flex justify-between items-center text-sm text-base-content/70 mt-3 mb-2">
            <span className="text-primary font-bold">৳ {meal.price}</span>
          </div>
          <Link
            to={`/meal-details/${meal._id}`}
            className="btn btn-sm btn-outline w-full mt-2"
          >
            Details
          </Link>
        </div>
      </motion.div>
    </div>
  );

  // Close drawer on outside click
  const handleClickOutside = (e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (drawerOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [drawerOpen]);

  // Filter Content (shared for desktop & mobile)
  const FilterContent = () => (
    <>
      <div className="mb-4">
        <label className="block mb-1">Search</label>
        <input
          type="text"
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select select-bordered w-full"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1">Price Range</label>
        <div className="flex justify-between text-sm mb-2">
          <span>৳ {priceRange[0]}</span>
          <span>৳ {priceRange[1]}</span>
        </div>
        <Slider
          range
          min={minPriceLimit ?? 0}
          max={maxPriceLimit ?? 1000}
          value={priceRange}
          allowCross={false}
          onChange={onPriceRangeChange}
          trackStyle={[{ backgroundColor: "#16a34a" }]}
          handleStyle={[
            { borderColor: "#16a34a", backgroundColor: "#16a34a" },
            { borderColor: "#16a34a", backgroundColor: "#16a34a" },
          ]}
        />
      </div>
    </>
  );

  return (
    <div className="mt-24">
      {/* Header */}
      <div className="sticky top-16 lg:top-12 flex justify-center items-center gap-10 px-4 z-20 bg-base-100 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-center lg:text-left">
          All Meals
        </h1>

        {/* Mobile Hamburger */}
        <div className="lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <AiOutlineMenu size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 max-w-7xl mx-auto p-4">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 p-4 border-2 border-base-200 rounded shadow-md sticky top-32 self-start">
          <h2 className="text-xl font-semibold mb-4">Filter Meals</h2>
          <FilterContent />
        </aside>

        {/* Main Meals */}
        <main className="flex-1">
          {(isLoading || !filterReady) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <MealCardSkeleton key={i} />
              ))}
            </div>
          )}
          {isError && (
            <p className="text-center text-red-600">Error: {error.message}</p>
          )}

          {!isLoading && filterReady && (
            <InfiniteScroll
              dataLength={meals.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={
                <div className="text-center py-4">
                  <span className="loading loading-spinner text-success"></span>
                </div>
              }
              scrollThreshold={0.9}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.length === 0 ? (
                  <p className="text-center col-span-full">No meals found.</p>
                ) : (
                  meals.map((meal) => <MealCard key={meal._id} meal={meal} />)
                )}
              </div>
            </InfiniteScroll>
          )}
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          >
            <motion.div
              ref={drawerRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute top-0 right-0 w-72 h-full bg-base-100 shadow-lg z-50 p-4 overflow-y-auto"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn btn-ghost mb-4 flex items-center gap-2"
              >
                <AiOutlineClose /> Close
              </button>
              <FilterContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Meals;
