const PopularMeals = ({ meals }) => {
  return (
    <section className="my-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">🔥 Popular Meals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {meals.map(meal => (
          <div key={meal._id} className="bg-white shadow-md rounded-xl overflow-hidden transition hover:shadow-lg">
            <img
              src={meal.image}
              alt={meal.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold">{meal.title}</h3>
              <p className="text-sm text-gray-500">Distributor: <span className="font-medium">{meal.distributorName}</span></p>
              <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                <span>❤️ {meal.likes}</span>
                <span>🗨️ {meal.reviewsCount || 0}</span>
                <span className="text-primary font-bold">৳{meal.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularMeals;
