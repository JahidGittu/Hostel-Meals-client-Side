import React, { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAuth from '../../hooks/useAuth';
import useSecureAxios from '../../hooks/useSecureAxios';
import useAxios from '../../hooks/useAxios';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Swal from 'sweetalert2';
import { Tooltip } from 'react-tooltip';
import Loading from '../Shared/Loading/Loading';

const UpcomingMealsPage = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minPriceLimit, setMinPriceLimit] = useState(0);
  const [maxPriceLimit, setMaxPriceLimit] = useState(1000);

  // ✅ Get current user details
  const { data: userDetails = {} } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await secureAxios.get('/current/user');
      return res.data;
    },
    enabled: !!user?.email,
  });

  // ✅ Load filter info
  useEffect(() => {
    const fetchFilterInfo = async () => {
      try {
        const res = await axiosInstance.get('/upcoming-meals-filter');
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

  // ✅ Load meals
  const fetchUpcomingMeals = async ({ pageParam = 1, queryKey }) => {
    const [_key, search, category, minPrice, maxPrice] = queryKey;
    const params = new URLSearchParams();
    params.append('page', pageParam);
    params.append('limit', pageParam === 1 ? 6 : 3);
    if (search) params.append('search', search);
    if (category !== 'All') params.append('category', category);
    if (minPrice != null) params.append('minPrice', minPrice);
    if (maxPrice != null) params.append('maxPrice', maxPrice);

    const res = await secureAxios.get(`/upcoming-meals-public?${params.toString()}`);
    return {
      data: res.data.meals,
      nextPage: pageParam + 1,
      isLast: res.data.meals.length < (pageParam === 1 ? 6 : 3),
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
    queryKey: ['upcoming-meals', search, category, priceRange[0], priceRange[1]],
    queryFn: fetchUpcomingMeals,
    getNextPageParam: (lastPage) => (lastPage.isLast ? undefined : lastPage.nextPage),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const meals = data?.pages.flatMap(page => page.data) || [];

  const onPriceRangeChange = (values) => {
    setPriceRange(values);
  };

  // ✅ Toggle Like with Restrictions
  const toggleLike = async (mealId) => {
    if (!user) {
      Swal.fire('Login Required', 'Please login to like meals.', 'info');
      return;
    }

    if (userDetails?.badge === 'Bronze') {
      Swal.fire('Upgrade Required', 'Only premium users (Silver/Gold/Platinum) can like upcoming meals.', 'warning');
      return;
    }

    try {
      const res = await secureAxios.patch(`/upcoming-meals/like/${mealId}`);
      if (res.data.success) {
        const userEmail = res.data.userEmail;
        const liked = res.data.liked;

        queryClient.setQueryData(
          ['upcoming-meals', search, category, priceRange[0], priceRange[1]],
          (oldData) => {
            if (!oldData) return oldData;

            const newPages = oldData.pages.map(page => {
              const newData = page.data.map(meal => {
                if (meal._id === mealId) {
                  return {
                    ...meal,
                    likes: liked ? meal.likes + 1 : meal.likes - 1,
                    likedBy: liked
                      ? [...(meal.likedBy || []), userEmail]
                      : (meal.likedBy || []).filter(email => email !== userEmail),
                  };
                }
                return meal;
              });
              return { ...page, data: newData };
            });

            return { ...oldData, pages: newPages };
          }
        );
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };


  return (
    <div className="mt-24">
      <h1 className="text-3xl font-bold mb-6 text-center">Upcoming Meals</h1>
      <div className="flex min-h-screen max-w-7xl mx-auto p-4 gap-6">
        {/* Sidebar */}
        <aside className="w-72 sticky top-20 self-start p-6 rounded-lg shadow-md border border-gray-200 h-max">
          <h2 className="text-2xl font-semibold mb-4">Filter Meals</h2>

          {/* Search */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Search</label>
            <input
              type="text"
              placeholder="Search meals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
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
              trackStyle={[{ backgroundColor: '#16a34a' }]}
              handleStyle={[
                { borderColor: '#16a34a', backgroundColor: '#16a34a', boxShadow: '0 0 5px #16a34a' },
                { borderColor: '#16a34a', backgroundColor: '#16a34a', boxShadow: '0 0 5px #16a34a' },
              ]}
            />
          </div>
        </aside>

        {/* Meals List */}
        <main className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center min-h-screen -mt-24">
              <span className="loading loading-spinner loading-lg text-success"></span>
            </div>
          )}
          {isError && <p className="text-center text-red-600">Error: {error.message}</p>}

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
                <div
                  key={meal._id}
                  className="card bg-base-100 shadow-md border rounded-lg p-4 flex flex-col">
                  <img
                    src={meal.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={meal.title}
                    className="rounded-lg mb-4 object-cover h-48 w-full"
                  />
                  <h2 className="text-xl font-semibold mb-2">{meal.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">{meal.category}</p>

                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold mb-2">৳ {meal.price}</p>
                    <div
                      data-tooltip-id={`likeTip-${meal._id}`}
                      data-tooltip-content={
                        !user
                          ? 'Login to like'
                          : userDetails?.badge === 'Bronze'
                            ? 'Upgrade to Premium to like'
                            : meal.likedBy?.includes(user?.email)
                              ? 'Click to Unlike'
                              : 'Click to Like'
                      }
                    >
                      {/* Like Button */}
                      <div
                        data-tooltip-id={`likeTip-${meal._id}`}
                        data-tooltip-content={
                          !user
                            ? 'Login to like meals'
                            : userDetails?.badge === 'Bronze'
                              ? 'Upgrade to Premium to like upcoming meals'
                              : meal.likedBy?.includes(user?.email)
                                ? 'Click to Unlike this meal'
                                : 'Click to Like this meal'
                        }
                        className="inline-block"
                      >
                        <button
                          className={`btn btn-sm ${meal.likedBy?.includes(user?.email) ? 'btn-success text-white' : 'btn-outline'
                            }`}
                          onClick={() => {
                            if (!user) {
                              Swal.fire('Login Required', 'Please login to like meals.', 'info');
                            } else if (userDetails?.badge === 'Bronze') {
                              Swal.fire('Upgrade Required', 'Only premium users can like upcoming meals.', 'warning');
                            } else {
                              toggleLike(meal._id);
                            }
                          }}
                        >
                          {meal.likedBy?.includes(user?.email) ? 'Unlike' : 'Like'}
                        </button>
                      </div>
                      <Tooltip id={`likeTip-${meal._id}`} place="top" />

                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500 mt-1">
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

export default UpcomingMealsPage;
