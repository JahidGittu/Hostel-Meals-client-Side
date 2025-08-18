import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import useAxios from '../../../hooks/useAxios';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks/Breakfast', 'All'];

const CategoryTabs = () => {
    const axiosInstance = useAxios();
    const [selectedCategory, setSelectedCategory] = useState('Breakfast');
    const [limit, setLimit] = useState(8);
    const [activeTab, setActiveTab] = useState('Meal'); // 'Meal' or 'Upcoming'
    const [mealsData, setMealsData] = useState({ meals: [], upcomingMeals: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const url = `/meals-by-category?category=${encodeURIComponent(selectedCategory)}&type=${activeTab === 'Meal' ? 'meal' : 'upcoming'}&limit=${limit}`;

        axiosInstance.get(url)
            .then(res => setMealsData(res.data))
            .catch(() => setMealsData({ meals: [], upcomingMeals: [] }))
            .finally(() => setLoading(false));
    }, [selectedCategory, limit, activeTab, axiosInstance]);

    const mealsToRender = activeTab === 'Meal' ? mealsData.meals : mealsData.upcomingMeals;

    return (
        <div className="p-4 urbanist-font">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setLimit(8); }}
                        className={`px-4 py-2 rounded-full font-semibold transition ${
                            selectedCategory === cat
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-200 text-base-content hover:bg-primary hover:text-primary-content'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Tabs and Limit Selector */}
            <div className="flex justify-between items-center mb-4">
                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('Meal')}
                        className={`rounded-full font-semibold transition btn btn-sm ${
                            activeTab === 'Meal'
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-200 text-base-content hover:bg-primary hover:text-primary-content'
                        }`}
                    >
                        Meal
                    </button>
                    <button
                        onClick={() => setActiveTab('Upcoming')}
                        className={`rounded-full font-semibold transition btn btn-sm ${
                            activeTab === 'Upcoming'
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-200 text-base-content hover:bg-primary hover:text-primary-content'
                        }`}
                    >
                        Upcoming
                    </button>
                </div>

                {/* Limit Selector */}
                {selectedCategory === 'All' && activeTab === 'Meal' && (
                    <select
                        value={limit}
                        onChange={e => setLimit(Number(e.target.value))}
                        className="select select-bordered w-40 max-w-xs"
                    >
                        <option value={4}>Show 4</option>
                        <option value={8}>Show 8</option>
                        <option value={12}>Show 12</option>
                        <option value={16}>Show 16</option>
                        <option value={0}>Show All</option>
                    </select>
                )}
            </div>

            {/* Meals Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <p className="text-center text-base-content">Loading...</p>
                ) : mealsToRender.length === 0 ? (
                    <p className="text-center text-base-content">No data found for this selection.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mealsToRender.map(meal => (
                            <MealCard
                                key={meal._id}
                                meal={meal}
                                label={activeTab === 'Meal' ? 'Meal' : 'Upcoming Meal'}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const MealCard = ({ meal, label }) => (
    <div className="relative border rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition duration-300 bg-base-100 flex flex-col">
        <div className="relative">
            <img
                src={meal.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={meal.title}
                className="w-full h-44 object-cover"
            />
            <span className="absolute top-2 right-2 bg-base-200 text-base-content px-2 py-1 text-xs rounded shadow">
                👍 {meal.likes || 0}
            </span>
        </div>
        <div className="p-4 flex flex-col flex-1 justify-between">
            <div>
                <h3 className="font-semibold text-lg mb-1 text-base-content">{meal.title}</h3>
                <p className="text-sm text-base-content/70 mb-2">{meal.category}</p>
            </div>
            <div className="flex justify-between items-center mb-2 text-sm text-base-content/70">
                <span>📝 {meal.reviews_count || 0} reviews</span>
                <span className="text-primary font-bold">৳{meal.price}</span>
            </div>
            <div className="flex justify-between items-center">
                <Link
                    to={label === 'Meal' ? `/meal-details/${meal._id}` : `/upcoming-meal-details/${meal._id}`}
                    className="btn btn-xs btn-outline flex-1"
                >
                    Details
                </Link>
                <span className="text-xs italic text-base-content/50 flex-1 text-right">{label}</span>
            </div>
        </div>
    </div>
);

export default CategoryTabs;
