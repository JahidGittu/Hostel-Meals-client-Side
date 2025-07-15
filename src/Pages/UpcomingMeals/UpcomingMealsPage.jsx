import React, { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import useSecureAxios from '../../hooks/useSecureAxios';
import useAxios from '../../hooks/useAxios';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Link } from 'react-router';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const UpcomingMealsPage = () => {
  const secureAxios = useSecureAxios();
  const axiosInstance = useAxios();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minPriceLimit, setMinPriceLimit] = useState(null);
  const [maxPriceLimit, setMaxPriceLimit] = useState(null);
  const [filterReady, setFilterReady] = useState(false);

  const debouncedSearch = useDebounce(search, 600);
  const debouncedPriceRange = useDebounce(priceRange, 600);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const res = await axiosInstance.get('/upcoming-meals-filter');
        setCategories(['All', ...res.data.categories]);
        setMinPriceLimit(res.data.minPrice);
        setMaxPriceLimit(res.data.maxPrice);
        setPriceRange([res.data.minPrice, res.data.maxPrice]);
        setFilterReady(true);
      } catch (err) {
        console.error('Filter Info Load Error:', err);
      }
    };
    fetchFilterData();
  }, [axiosInstance]);

  const fetchMeals = async ({ pageParam = 1 }) => {
    const params = new URLSearchParams();
    params.set('page', pageParam);
    params.set('limit', 6);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (category !== 'All') params.set('category', category);
    params.set('minPrice', debouncedPriceRange[0]);
    params.set('maxPrice', debouncedPriceRange[1]);

    const res = await secureAxios.get(`/upcoming-meals-public?${params.toString()}`);
    return {
      meals: res.data.meals,
      isLast: res.data.isLast,
      nextPage: res.data.isLast ? undefined : pageParam + 1,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['upcoming-meals', debouncedSearch, category, debouncedPriceRange],
    queryFn: fetchMeals,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
    enabled: filterReady && minPriceLimit !== null && maxPriceLimit !== null,
  });

  const meals = data?.pages.flatMap(p => p.meals) || [];

  const onPriceRangeChange = (range) => {
    setPriceRange(range);
  };

  return (
    <div className="mt-24">
      <h2 className="text-3xl font-bold mb-6 text-center">Upcoming Meals</h2>
      <div className="flex gap-4 max-w-7xl mx-auto p-4">
        {/* Sidebar Filter */}
        <aside className="w-72 p-4 border rounded shadow-md sticky top-20 self-start">
          <h3 className="text-xl font-semibold mb-4">Filter Meals</h3>

          <div className="mb-4">
            <label className="block mb-1">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Search meals..."
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
                <option key={cat}>{cat}</option>
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
              allowCross={false}
              value={priceRange}
              onChange={onPriceRangeChange}
              trackStyle={[{ backgroundColor: '#16a34a' }]}
              handleStyle={[
                { borderColor: '#16a34a', backgroundColor: '#16a34a' },
                { borderColor: '#16a34a', backgroundColor: '#16a34a' },
              ]}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {(isLoading || !filterReady) && (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner text-success"></span>
            </div>
          )}
          {isError && (
            <p className="text-red-600 text-center">Error: {error.message}</p>
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
                {meals.map((meal) => (
                  <div key={meal._id} className="card bg-base-100 border shadow rounded-lg">
                    <img
                      src={meal.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={meal.title}
                      className="w-full h-48 object-cover rounded"
                    />
                    <div className='p-2'>
                      <h4 className="text-lg font-bold mb-1">{meal.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">{meal.category}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-success">৳ {meal.price}</span>
                        <Link to={`/upcoming-meal-details/${meal._id}`}>
                          <button className="btn btn-sm">Meal Details</button>
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500 flex justify-between">
                        <span>⭐ {meal.rating || 0}</span>
                        <span>👍 {meal.likes || 0}</span>
                        <span>📝 {meal.reviews_count || 0} reviews</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </main>
      </div>
    </div>
  );
};

export default UpcomingMealsPage;
