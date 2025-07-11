import React, { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import useSecureAxios from '../../hooks/useSecureAxios';
import useAxios from '../../hooks/useAxios';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Meals = () => {
  const secureAxios = useSecureAxios();
  const axiosInstance = useAxios();

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minPriceLimit, setMinPriceLimit] = useState(0);
  const [maxPriceLimit, setMaxPriceLimit] = useState(1000);

  // Fetch filter info
  useEffect(() => {
    const fetchFilterInfo = async () => {
      try {
        const res = await axiosInstance.get('/meals-filter-info');
        setCategories(['All', ...res.data.categories]);
        setMinPriceLimit(res.data.minPrice);
        setMaxPriceLimit(res.data.maxPrice);
        setPriceRange([res.data.minPrice, res.data.maxPrice]);
      } catch (err) {
        console.error('Failed to fetch filter info:', err);
      }
    };
    fetchFilterInfo();
  }, [axiosInstance]);

  // Fetch meals
  const fetchMeals = async ({ pageParam = 1, queryKey }) => {
    const [_key, search, category, minPrice, maxPrice] = queryKey;
    const params = new URLSearchParams();
    params.append('page', pageParam);
    params.append('limit', 10);
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    if (minPrice != null) params.append('minPrice', minPrice);
    if (maxPrice != null) params.append('maxPrice', maxPrice);

    const res = await secureAxios.get(`/meals-public?${params.toString()}`);
    return {
      data: res.data.meals,
      nextPage: pageParam + 1,
      isLast: res.data.meals.length < 10,
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
    queryKey: ['meals', search, category, priceRange[0], priceRange[1]],
    queryFn: fetchMeals,
    getNextPageParam: (lastPage) => (lastPage.isLast ? undefined : lastPage.nextPage),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const meals = data?.pages.flatMap(page => page.data) || [];

  const onPriceRangeChange = (values) => {
    setPriceRange(values);
  };

  return (
    <div className='pt-24'>
      <h1 className="text-3xl font-bold mb-6 text-center">All Meals</h1>
      <div className="flex min-h-screen max-w-7xl mx-auto p-4 gap-6">
        {/* Sidebar */}
        <aside className="w-72 sticky top-20 self-start p-6 rounded-lg shadow-md border border-gray-200 h-max">
          <h2 className="text-2xl font-semibold mb-4">Filter Meals</h2>

          {/* Search */}
          <div className="mb-6">
            <label className="block mb-1 font-medium" htmlFor="search-input">Search</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search meals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block mb-1 font-medium" htmlFor="category-select">Category</label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Price Range</label>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>৳ {priceRange[0]}</span>
              <span>৳ {priceRange[1]}</span>
            </div>
            <Slider
              range
              min={minPriceLimit}
              max={maxPriceLimit}
              value={priceRange}
              allowCross={false}
              onChange={onPriceRangeChange}
              trackStyle={[{ backgroundColor: '#2563eb' }]}
              handleStyle={[
                { borderColor: '#2563eb', backgroundColor: '#2563eb', boxShadow: '0 0 5px #2563eb' },
                { borderColor: '#2563eb', backgroundColor: '#2563eb', boxShadow: '0 0 5px #2563eb' },
              ]}
            />
          </div>
        </aside>

        {/* Meals List */}
        <main className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center min-h-screen -mt-24">
              <div className="text-center">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-20 w-20 mb-4 mx-auto animate-spin"></div>
                <p className="text-lg font-semibold">Loading meals...</p>
              </div>
            </div>
          )}
          {isError && <p className="text-center text-red-600">Error: {error.message}</p>}

          <InfiniteScroll
            dataLength={meals.length}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            loader={<h4 className="text-center">Loading more meals...</h4>}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map(meal => (
                <div
                  key={meal._id}
                  className="card bg-base-100 shadow-md border rounded-lg p-4 flex flex-col"
                >
                  <img
                    src={meal.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={meal.title}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <h2 className="text-xl font-semibold mb-2">{meal.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">{meal.category}</p>
                  <p className="text-lg font-bold mb-2">৳ {meal.price}</p>
                  <p className="text-sm mb-4 flex-grow">
                    {meal.description?.slice(0, 100)}
                    {meal.description?.length > 100 ? '...' : ''}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>⭐ {meal.rating || 0}</span>
                    <span>👍 {meal.likes || 0}</span>
                    <span>📝 {meal.reviews_count || 0} reviews</span>
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        </main>
      </div>
    </div>
  );
};

export default Meals;
