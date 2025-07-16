import React from 'react';
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

    const handleDelete = async (mealId, source, email) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this review!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        });

        if (confirm.isConfirmed) {
            try {
                const res = await secureAxios.delete(`/admin/reviews/${mealId}/${source}/${email}`);
                if (res.data.modifiedCount > 0) {
                    toast('Review deleted successfully!');
                    refetch();
                } else {
                    toast.error('Failed to delete review');
                }
            } catch (err) {
                toast.error('Something went wrong!', err);
            }
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
                                <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Meal</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Likes</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Review</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Posted At</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                            {myReviews.map((review, index) => (
                                <tr key={index} className="hover:bg-gray-600">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{review.mealTitle}</td>
                                    <td className="px-4 py-3">{review.likes || 0}</td>
                                    <td className="px-4 py-3">{review.reviewText}</td>
                                    <td className="px-4 py-3">
                                        {review.from === 'meals' ? (
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                                                Regular Meal
                                            </span>
                                        ) : (
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                                                Upcoming Meal
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {moment(review.createdAt).format('DD MMM YYYY, h:mm A')}
                                    </td>
                                    <td className="px-4 py-3 text-center space-x-2 flex items-center justify-center">
                                        <Link
                                            to={review.from === 'meals' ? `/meal-details/${review.mealId}` : `/upcoming-meal-details/${review.mealId}`}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="View Meal"
                                        >
                                            <FaEye />
                                        </Link>
                                        <button
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete Review"
                                            onClick={() =>
                                                handleDelete(review.mealId, review.from, review.reviewerEmail)
                                            }
                                        >
                                            <FaTrashAlt />
                                        </button>
                                        {/* Optional future: Add Edit button if needed */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyReviews;
