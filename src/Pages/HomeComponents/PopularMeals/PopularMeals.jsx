import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';

const PopularMeals = ({ meals }) => {
  if (!Array.isArray(meals)) {
    return (
      <section className="my-16 px-4 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-primary">🔥 Popular Meals</h2>
        <p className="text-gray-500">Loading popular meals...</p>
      </section>
    );
  }

  if (meals.length === 0) {
    return (
      <section className="my-16 px-4 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-primary">🔥 Popular Meals</h2>
        <p className="text-gray-500">No popular meals found.</p>
      </section>
    );
  }

  return (
    <section className="my-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-primary">
        🔥 Popular Meals
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {meals.map((meal) => (
          <motion.div
            key={meal._id}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}
            className="card bg-base-100 rounded-xl overflow-hidden shadow-md flex flex-col transition-all duration-300"
          >
            <div className="relative h-48">
              <img
                src={meal.image || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={meal.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 bg-base-200 text-base-content px-2 py-1 text-xs rounded shadow">
                ❤️ {meal.likes}
              </span>
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-base-content line-clamp-1">
                  {meal.title}
                </h3>
                <p className="text-sm text-base-content/70 line-clamp-2">
                  Distributor: <span className="font-medium">{meal.distributorName}</span>
                </p>
              </div>

              <div className="flex justify-between items-center text-sm text-base-content/70 mt-3 mb-2">
                <span>🗨️ {meal.reviewsCount || 0} reviews</span>
                <span className="text-primary font-bold">৳{meal.price}</span>
              </div>

              {/* Dynamic Details Link */}
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
