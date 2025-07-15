import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaEye, FaTrash } from 'react-icons/fa';
import moment from 'moment';
import { Link } from 'react-router';
import Swal from 'sweetalert2';
import useSecureAxios from '../../../../hooks/useSecureAxios';
import usePagination from '../../../../hooks/usePagination';

const AllReviews = () => {
  const axiosSecure = useSecureAxios();

  const {
    page,
    limit,
    totalPages,
    setTotal,
    goToPage,
    goToNextPage,
    goToPrevPage,
  } = usePagination({ initialTotal: 0, limit: 10 });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-reviews', page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/admin/all-reviews?page=${page}&limit=${limit}`);
      return res.data;
    },
    keepPreviousData: false,
    staleTime: 5 * 60 * 1000,
  });

  const reviews = data?.reviews || [];
  const totalCount = data?.total || 0;

  useEffect(() => {
    setTotal(totalCount);
  }, [totalCount, setTotal]);

  const handleDelete = async (mealId, source, reviewerEmail) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This review will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axiosSecure.delete(`/admin/reviews/${mealId}/${source}/${reviewerEmail}`);
      if (res.data.modifiedCount > 0) {
        Swal.fire('Deleted!', 'The review has been removed.', 'success');
        refetch();
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to delete the review.', error.message || error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-center py-10">Something went wrong. Please try again later.</div>;
  }

  return (
    <div className="p-5 max-w-full">
      <h1 className="text-2xl font-semibold mb-6 text-center">📝 All Meal Reviews</h1>

      <div className="overflow-x-auto rounded-lg shadow border">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Meal Title</th>
              <th className="px-4 py-3">Reviewer</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  No reviews found.
                </td>
              </tr>
            ) : (
              reviews.map((rev, idx) => (
                <tr
                  key={rev._id || `${rev.mealId}-${rev.reviewerEmail}-${idx}`}
                  className="hover:bg-gray-800 transition duration-300"
                >
                  <td className="px-4 py-3">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3">{rev.mealTitle}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.reviewerImage}
                        alt={rev.reviewerName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{rev.reviewerName}</p>
                        <p className="text-xs text-gray-500">{rev.reviewerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{rev.reviewText}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-orange-400 rounded-full capitalize">
                      {rev.from}
                    </span>
                  </td>
                  <td className="px-4 py-3">{moment(rev.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                  <td className="px-4 py-3 text-center flex gap-2 justify-center">
                    <Link
                      to={rev.from === 'meals' ? `/meal-details/${rev.mealId}` : `/upcoming-meal-details/${rev.mealId}`}
                      className="btn btn-sm btn-info text-white"
                      title="View Meal"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => handleDelete(rev.mealId, rev.from, rev.reviewerEmail)}
                      className="btn btn-sm btn-error text-white"
                      title="Delete Review"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          <button className="btn btn-sm" onClick={goToPrevPage} disabled={page === 1}>
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
            >
              {i + 1}
            </button>
          ))}

          <button className="btn btn-sm" onClick={goToNextPage} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllReviews;
