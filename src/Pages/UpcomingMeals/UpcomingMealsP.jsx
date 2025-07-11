import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import useSecureAxios from '../../hooks/useSecureAxios';

const UpcomingMealsP = () => {
  const secureAxios = useSecureAxios();
  const { user } = useAuth();

  const { data: meals = [], refetch, isLoading } = useQuery({
    queryKey: ['upcomingMeals'],
    queryFn: async () => {
      const res = await secureAxios.get('/upcoming-meals-public');
      return res.data;
    },
  });

  const handleLike = async (mealId) => {
    if (!user?.email || !user?.subscription || user.subscription === 'Bronze') {
      return Swal.fire('Only premium (Silver/Gold/Platinum) users can like meals!');
    }

    try {
      const res = await secureAxios.patch(`/upcoming-meals/like/${mealId}`);
      if (res.data.modifiedCount > 0) {
        Swal.fire('✅ Liked successfully!');
        refetch();
      }
    } catch (err) {
      console.error(err);
      Swal.fire('❌ Failed to like meal');
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">🕒 Upcoming Meals</h2>

      {isLoading ? (
        <p className="text-center py-10 font-semibold">Loading upcoming meals...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div key={meal._id} className="card bg-base-100 shadow-xl">
              <figure>
                <img src={meal.image} alt={meal.title} className="h-56 w-full object-cover" />
              </figure>
              <div className="card-body">
                <h2 className="card-title text-xl font-bold">{meal.title}</h2>
                <p className="text-sm opacity-80">Category: {meal.category}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-semibold text-primary">Likes: {meal.likes || 0}</span>
                  <span className="badge badge-outline">⭐ {meal.rating || 0}</span>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button
                    className={`btn btn-outline btn-sm ${
                      user?.subscription !== 'Bronze' ? 'hover:btn-primary' : 'btn-disabled'
                    }`}
                    onClick={() => handleLike(meal._id)}
                  >
                    👍 Like
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingMealsP;
