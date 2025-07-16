import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { FaThumbsUp, FaHeart } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import useSecureAxios from '../../../hooks/useSecureAxios';
import useAuth from '../../../hooks/useAuth';
import Loading from '../../Shared/Loading/Loading';

const UpcomingMealDetails = () => {
  const { id } = useParams();
  const secureAxios = useSecureAxios();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [reviewText, setReviewText] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  // 1) Fetch current user (to check badge)
  const { data: userDetails = {}, isLoading: loadingUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => secureAxios.get('/current-user').then(r => r.data),
    enabled: !!user?.email,
  });

  // 2) Fetch upcoming meal details
  const {
    data: meal = {},
    isLoading: loadingMeal,
    refetch: refetchMeal,
  } = useQuery({
    queryKey: ['upcoming-meal-details', id],
    queryFn: () => secureAxios.get(`/upcoming-meals/${id}`).then(r => r.data),
    onSuccess: data => {
      setLikesCount(data.likes || 0);
      setLiked((data.likedBy || []).includes(user?.email));
    },
  });

  // 3) Keep local liked+count in sync if either `meal` or `user` changes
  useEffect(() => {
    if (meal && user?.email) {
      setLikesCount(meal.likes || 0);
      setLiked((meal.likedBy || []).includes(user.email));
    }
  }, [meal, user?.email]);

  // 4) Like/unlike mutation (premium-only)
  const likeMutation = useMutation({
    mutationFn: () => secureAxios.patch(`/upcoming-meals/like/${id}`).then(r => r.data),
    onSuccess: data => {
      setLiked(data.liked);
      setLikesCount(prev => prev + (data.liked ? 1 : -1));
      queryClient.invalidateQueries(['upcoming-meals']);
      refetchMeal();
    },
    onError: () => Swal.fire('Error', 'Failed to toggle like.', 'error'),
  });

  const handleLike = () => {
    if (!user) {
      return Swal.fire('Login Required', 'Please login to like meals.', 'info');
    }
    if (userDetails.badge === 'Bronze') {
      return Swal.fire({
        title: 'Upgrade Required',
        text: 'Only premium users can like upcoming meals.',
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
    likeMutation.mutate();
  };

  // 5) Request meal mutation
  const requestMutation = useMutation({
    mutationFn: () => secureAxios.post('/upcoming-meal-requests', {
      mealId: id,
      userEmail: user.email,
      status: 'pending',
    }),
    onSuccess: () => Swal.fire('Success', 'Meal requested successfully!', 'success'),
    onError: () => Swal.fire('Error', 'You already requested this meal!', 'error'),
  });

  const handleRequest = () => {
    if (!user) {
      return Swal.fire('Login Required', 'Please login to request meals.', 'info');
    }
    if (userDetails.badge === 'Bronze') {
      return Swal.fire({
        title: 'Upgrade Required',
        text: 'Only premium users can request for upcoming meals.',
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

  // 6) Review mutation
  const reviewMutation = useMutation({
    mutationFn: () => secureAxios.post('/upcoming-meal-reviews', {
      mealId: id,
      email: user.email,
      name: userDetails.name || user.displayName,
      review: reviewText,
      image: userDetails.photo || user.photoURL,
    }),
    onSuccess: () => {
      setReviewText('');
      Swal.fire('Posted', 'Review submitted!', 'success');
      queryClient.invalidateQueries(['upcoming-meal-details', id]);
    },
    onError: () => Swal.fire('Error', 'Failed to post review.', 'error'),
  });

  const handleReview = () => reviewMutation.mutate();

  // 7) Show loader while fetching
  if (loadingMeal || loadingUser) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-24">
      {/* Image + Like Count */}
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

      {/* Title & Info */}
      <h1 className="text-3xl font-bold mb-2">{meal.title}</h1>
      <p className="text-gray-600 mb-2">
        Distributor: {meal.distributorName} ({meal.distributorEmail})
      </p>
      <p className="mb-2">Ingredients: {meal.ingredients}</p>
      <p className="mb-2">Rating: ⭐ {meal.rating || 0}</p>
      <p className="mb-4 whitespace-pre-line">{meal.description || 'No description available.'}</p>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <div data-tooltip-id="likeTip" data-tooltip-content={liked ? 'Unlike' : 'Like'}>
          <button
            className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleLike}
          >
            <FaThumbsUp />
          </button>
        </div>
        <Tooltip id="likeTip" place="top" />

        <div
          data-tooltip-id="requestTip"
          data-tooltip-content='Request Meal'

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
            <button
              className="btn btn-sm btn-primary mt-2"
              disabled={!reviewText.trim()}
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
              <p className="ml-11 whitespace-pre-line">{r.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingMealDetails;
