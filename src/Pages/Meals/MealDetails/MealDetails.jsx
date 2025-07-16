import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useSecureAxios from '../../../hooks/useSecureAxios';
import useAuth from '../../../hooks/useAuth';
import { FaThumbsUp, FaHeart, FaStar } from 'react-icons/fa';  // FaStar যোগ করলাম
import Loading from '../../Shared/Loading/Loading';
import { Tooltip } from 'react-tooltip';

const Star = ({ filled, onClick }) => (
  <FaStar
    onClick={onClick}
    className={`cursor-pointer h-6 w-6 ${filled ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
  />
);

const MealDetails = () => {
  const { id } = useParams();
  const secureAxios = useSecureAxios();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0); // স্টার রেটিং স্টেট
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const navigate = useNavigate();

  const { data: userDetails = {}, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => secureAxios.get('/current-user').then(r => r.data),
    enabled: !!user?.email,
  });

  const {
    data: meal = {},
    isLoading: mealLoading,
    refetch: refetchMeal,
  } = useQuery({
    queryKey: ['meal-details', id],
    queryFn: () => secureAxios.get(`/meals/${id}`).then(r => r.data),
    onSuccess: data => {
      setLikesCount(data.likes || 0);
      setLiked(data.likedBy?.includes(user?.email));
    },
  });

  useEffect(() => {
    if (meal && user?.email) {
      setLikesCount(meal.likes || 0);
      setLiked((meal.likedBy || []).includes(user.email));
    }
  }, [meal, user?.email]);

  const likeMutation = useMutation({
    mutationFn: () => secureAxios.patch(`/meals/like/${id}`).then(r => r.data),
    onSuccess: data => {
      setLiked(data.liked);
      setLikesCount(prev => prev + (data.liked ? 1 : -1));
      queryClient.invalidateQueries(['meals']);
      refetchMeal();
    },
    onError: () => Swal.fire('Error', 'Failed to toggle like.', 'error'),
  });

  const requestMutation = useMutation({
    mutationFn: () => secureAxios.post('/meal-requests', {
      mealId: id,
      userEmail: user.email,
      status: 'pending',
    }),
    onSuccess: () => Swal.fire('Success', 'Meal requested!', 'success'),
    onError: () => Swal.fire('Error', 'Already requested.', 'error'),
  });

  const reviewMutation = useMutation({
    mutationFn: () => secureAxios.post('/meal-reviews', {
      mealId: id,
      email: user.email,
      name: userDetails.name || user.displayName,
      review: reviewText,
      rating, // রেটিং পাঠানো হচ্ছে
      image: userDetails.photo || user.photoURL,
    }),
    onSuccess: () => {
      setReviewText('');
      setRating(0);
      Swal.fire('Posted', 'Review submitted!', 'success');
      queryClient.invalidateQueries(['meal-details', id]);
    },
    onError: () => Swal.fire('Error', 'Failed to post review.', 'error'),
  });

  const avgRating = meal.reviews?.length
    ? (meal.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / meal.reviews.length).toFixed(1)
    : '0.0';

  if (mealLoading || userLoading) return <Loading />;

  const handleLike = () => {
    if (!user) {
      return Swal.fire('Login Required', 'Please login to like meals.', 'info');
    }
    likeMutation.mutate();
  };

  const handleRequest = () => {
    if (!user) return Swal.fire('Login Required', 'Please login.', 'info');
    if (userDetails.badge === 'Bronze') {
      return Swal.fire({
        title: 'Upgrade Needed',
        text: 'Only premium users can request.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Upgrade Now',
        cancelButtonText: 'Close',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/membership');
        }
      });
    }
    requestMutation.mutate();
  };

  const handleReview = () => reviewMutation.mutate();

  return (
    <div className="max-w-4xl mx-auto p-6 mt-24">
      {/* Image + ❤️ */}
      <div className="relative rounded-xl overflow-hidden mb-6">
        <img
          src={meal.image || 'https://via.placeholder.com/600x400?text=No+Image'}
          alt={meal.title}
          className="w-full h-96 object-cover"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white bg-opacity-75 rounded-full px-3 py-1 shadow-md select-none">
          <FaHeart className="text-red-500" />
          <span className="font-semibold text-gray-800">{likesCount}</span>
        </div>
      </div>

      {/* Details */}
      <h1 className="text-3xl font-bold mb-2">{meal.title}</h1>
      <p className="text-gray-600 mb-2">
        Distributor: {meal.distributorName} ({meal.distributorEmail})
      </p>
      <p className="mb-2">Ingredients: {meal.ingredients}</p>
      <p className="mb-2">
        Rating: <span className="text-yellow-500">⭐ {avgRating}</span> ({meal.reviews?.length || 0} reviews)
      </p>
      <p className="mb-4 whitespace-pre-line">{meal.description || 'No description.'}</p>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <div data-tooltip-id="likeTip" data-tooltip-content={liked ? 'Unlike' : 'Like'}>
          <button
            className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleLike}
          >
            {liked ? <FaHeart /> : <FaThumbsUp />}
          </button>
        </div>
        <Tooltip id="likeTip" place="top" />

        <div
          data-tooltip-id="requestTip"
          data-tooltip-content={
            userDetails.badge === 'Bronze' ? 'Upgrade to Premium' : 'Request Meal'
          }
        >
          <button className="btn btn-sm btn-success" onClick={handleRequest}>
            🍽️ Request Meal
          </button>
        </div>
        <Tooltip id="requestTip" place="top" />

      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Reviews ({meal.reviews?.length || 0})</h2>
        {user ? (
          <div className="mb-6">
            <textarea
              rows="3"
              placeholder="Write your review..."
              className="textarea textarea-bordered w-full"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />

            {/* স্টার রেটিং */}
            <div className="mt-2 flex items-center gap-2 select-none">
              <span className="text-gray-600">Your Rating:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    filled={star <= rating}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <button
              className="btn btn-sm btn-primary mt-3"
              disabled={!reviewText.trim() || rating === 0}
              onClick={handleReview}
            >
              Submit Review
            </button>
          </div>
        ) : (
          <p className="text-gray-500">Login to write a review.</p>
        )}

        <div className="space-y-4">
          {meal.reviews?.map((r, i) => (
            <div key={i} className="border p-4 rounded-md bg-base-100">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={r.image || 'https://i.ibb.co/2kRbc7V/user.png'}
                  className="w-8 h-8 rounded-full"
                  alt={r.name}
                />
                <p className="font-medium">{r.name}</p>
              </div>
              <p className="ml-11 whitespace-pre-line mb-1">{r.review}</p>
              <p className="ml-11 text-sm text-yellow-500">Rating: {'⭐'.repeat(r.rating || 0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealDetails;
