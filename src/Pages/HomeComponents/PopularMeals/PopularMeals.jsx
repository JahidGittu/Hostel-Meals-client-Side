import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';

const PopularMeals = ({ meals, loading }) => {
  // Skeleton card (CategoryTabs এর মতো)
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

  // Loading state
  if (loading) {
    return (
      <section className="my-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-primary">
          🔥 Popular Meals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <MealCardSkeleton key={idx} />
          ))}
        </div>
      </section>
    );
  }

  // No data state
  if (!Array.isArray(meals) || meals.length === 0) {
    return (
      <section className="my-16 px-4 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
          🔥 Popular Meals
        </h2>
        <p className="text-gray-500">No popular meals found.</p>
      </section>
    );
  }

  // Main render
  return (
    <section className="my-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-primary">
        🔥 Popular Meals
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {meals.map((meal) => (
          <motion.div
            key={meal._id}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
            }}
            className="rounded-xl shadow-md overflow-hidden bg-base-200 flex flex-col transition-all duration-300"
          >
            <div className="relative h-48">
              <img
                src={meal.image || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={meal.title || "Meal Image"}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <span className="bg-red-100 text-red-600 px-2 py-1 text-xs rounded shadow font-medium">
                  ❤️ {meal.likes || 0}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded shadow font-medium">
                  🗨️ {meal.reviewsCount || 0}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-base-content line-clamp-1" title={meal.title}>
                  {meal.title}
                </h3>
                <p className="text-sm text-base-content/70 line-clamp-2" title={meal.distributorName}>
                  Distributor: <span className="font-medium">{meal.distributorName}</span>
                </p>
              </div>

              <div className="flex justify-between items-center text-sm text-base-content/70 mt-3 mb-2">
                <span>Price: <span className="text-primary font-bold">৳{meal.price}</span></span>
              </div>

              <Link
                to={
                  meal.source === "meal"
                    ? `/meal-details/${meal._id}`
                    : `/upcoming-meal-details/${meal._id}`
                }
                className="btn btn-sm btn-outline w-full mt-2"
              >
                See Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PopularMeals;
