import React, { useState } from 'react';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useSecureAxios from '../../../hooks/useSecureAxios';
import useAuth from '../../../hooks/useAuth';
import { FaThumbsUp } from 'react-icons/fa';
import Loading from '../../Shared/Loading/Loading';
import { Tooltip } from 'react-tooltip';

const MealDetails = () => {
  const { id } = useParams();
  const secureAxios = useSecureAxios();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [reviewText, setReviewText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Current logged-in user's full details
  const { data: userDetails = {}, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await secureAxios.get('/current/user');
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Meal details
  const { data: meal = {}, isLoading: mealLoading } = useQuery({
    queryKey: ['meal-details', id],
    queryFn: async () => {
      const res = await secureAxios.get(`/meals/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      setLikesCount(data.likes || 0);
      setLiked(data.likedBy?.includes(user?.email));
    }
  });

  // Like button handler (without useMutation)
  const handleLike = async () => {
    if (!user) {
      Swal.fire('Login Required', 'Please login to like meals.', 'info');
      return;
    }
    try {
      const res = await secureAxios.patch(`/meals/like/${id}`);
      if (res.data.liked) {
        setLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        setLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to like the meal.', 'error');
    }
    // invalidate cached 'meals' list to reflect changes when navigating back
    queryClient.invalidateQueries(['meals']);
  };

  // Meal request mutation (using useMutation)
  const requestMutation = useMutation({
    mutationFn: async () => {
      const res = await secureAxios.post('/meal-requests', {
        mealId: id,
        userEmail: user?.email,
        status: 'pending',
      });
      return res.data;
    },
    onSuccess: () => {
      Swal.fire('Success', 'Meal requested successfully!', 'success');
    },
    onError: () => {
      Swal.fire('Error', 'You already requested this meal!', 'error');
    },
  });

  // Review mutation (using useMutation)
  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await secureAxios.post('/meal-reviews', {
        mealId: id,
        email: user?.email,
        name: userDetails?.name || user?.displayName,
        review: reviewText,
        image: userDetails?.photo || user?.photoURL,
      });
      return res.data;
    },
    onSuccess: () => {
      setReviewText('');
      Swal.fire('Posted', 'Review submitted!', 'success');
      queryClient.invalidateQueries(['meal-details', id]);
    },
  });

  if (mealLoading || userLoading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-24">
      <img
        src={meal.image}
        alt={meal.title}
        className="w-full rounded-xl mb-6 h-96 object-cover"
      />
      <h1 className="text-3xl font-bold mb-2">{meal.title}</h1>
      <p className="text-gray-600 mb-2">
        Distributor: {meal.distributorName} ({meal.distributorEmail})
      </p>
      <p className="mb-2">Ingredients: {meal.ingredients}</p>
      <p className="mb-2">Rating: ⭐ {meal.rating}</p>
      <p className="mb-4">{meal.description}</p>

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        {/* Like button */}
        <div
          data-tooltip-id="likeTip"
          data-tooltip-content={!user ? 'Login to like meals' : liked ? "Click to Unlike" : 'Click to like'}
          className="inline-block"
        >
          <button
            className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleLike}
          >
            <FaThumbsUp className={`mr-1 ${liked ? 'text-white' : ''}`} />
            {likesCount}
          </button>
        </div>
        <Tooltip id="likeTip" place="top" />

        {/* Request Meal button */}
        <div
          data-tooltip-id="requestTip"
          data-tooltip-content={
            !user
              ? 'Login to request meal'
              : userDetails?.badge === 'Bronze'
                ? 'Upgrade to Premium to request meals'
                : 'Click to request this meal'
          }
          className="inline-block"
        >
          <button
            className="btn btn-sm btn-success"
            onClick={() => {
              if (!user) {
                Swal.fire('Login Required', 'Please login to request meals.', 'info');
              } else if (userDetails?.badge === 'Bronze') {
                Swal.fire('Upgrade Required', 'Only premium users can request meals.', 'warning');
              } else {
                requestMutation.mutate();
              }
            }}
          >
            🍽️ Request Meal
          </button>
        </div>
        <Tooltip id="requestTip" place="top" />
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          Reviews ({meal.reviews?.length || 0})
        </h2>

        {/* Review Form */}
        {user ? (
          <div className="mb-6">
            <textarea
              rows="3"
              placeholder="Write your review..."
              className="textarea textarea-bordered w-full"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>
            <button
              className="btn btn-sm btn-primary mt-2"
              disabled={!reviewText.trim()}
              onClick={() => reviewMutation.mutate()}
            >
              Submit Review
            </button>
          </div>
        ) : (
          <p className="text-gray-500">Login to write a review.</p>
        )}

        {/* Show Reviews */}
        <div className="space-y-4">
          {meal.reviews?.map((r, i) => (
            <div key={i} className="border p-4 rounded-md bg-gray-50">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={r.image || 'https://i.ibb.co/2kRbc7V/user.png'}
                  className="w-8 h-8 rounded-full"
                  alt="User"
                />
                <p className="font-medium">{r.name}</p>
              </div>
              <p className="ml-11">{r.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
};

export default MealDetails;
