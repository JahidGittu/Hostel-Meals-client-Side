import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import moment from 'moment';
import { Link } from 'react-router';
import Swal from 'sweetalert2';
import useSecureAxios from '../../../../hooks/useSecureAxios';
import useAuth from '../../../../hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';

const MyReviews = () => {
  const secureAxios = useSecureAxios();
  const { user } = useAuth();

  const { data: myReviews = [], refetch } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: async () => {
      const res = await secureAxios.get(`/my-reviews?email=${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  const [editingReview, setEditingReview] = useState(null);

  const handleDelete = async (mealId, from) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this review!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await secureAxios.delete(`/my-reviews/${mealId}/${from}`);
        if (res.data.success) {
          toast.success('Review deleted successfully!');
          refetch();
        } else {
          toast.error('Delete failed!');
        }
      } catch (error) {
        toast.error('Server error during delete.');
      }
    }
  };

  const handleEditSubmit = async () => {
    const { mealId, from, reviewText } = editingReview;

    if (!reviewText.trim()) {
      toast.error('Review cannot be empty!');
      return;
    }

    try {
      const res = await secureAxios.patch(`/my-reviews/${mealId}/${from}`, {
        newReviewText: reviewText,
      });
      if (res.data.success) {
        toast.success('Review updated successfully!');
        setEditingReview(null);
        refetch();
      } else {
        toast.error('Update failed!');
      }
    } catch (error) {
      toast.error('Server error during update.');
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">My Reviews</h2>

      {myReviews.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t posted any reviews yet.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Meal</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Posted At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {myReviews.map((review, index) => (
                <tr key={index} className="hover:bg-gray-600">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{review.mealTitle}</td>
                  <td className="px-4 py-3">{review.reviewText}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                      ${review.from === 'meals' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {review.from === 'meals' ? 'Regular Meal' : 'Upcoming Meal'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{moment(review.createdAt).format('DD MMM YYYY, h:mm A')}</td>
                  <td className="px-4 py-3 text-center flex items-center gap-2 justify-center">
                    <Link
                      to={
                        review.from === 'meals'
                          ? `/meal-details/${review.mealId}`
                          : `/upcoming-meal-details/${review.mealId}`
                      }
                      title="View"
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => setEditingReview({ ...review })}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(review.mealId, review.from)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-600 w-[90%] max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Edit Your Review</h2>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              value={editingReview.reviewText}
              onChange={(e) =>
                setEditingReview({ ...editingReview, reviewText: e.target.value })
              }
            ></textarea>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setEditingReview(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleEditSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviews;
