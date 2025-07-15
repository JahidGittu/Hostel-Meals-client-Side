import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import useSecureAxios from '../../../../hooks/useSecureAxios';
import usePagination from '../../../../hooks/usePagination';

const ServeMeals = () => {
  const secureAxios = useSecureAxios();
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');

  const {
    page,
    limit,
    totalPages,
    setTotal,
    goToPage,
    goToNextPage,
    goToPrevPage,
  } = usePagination({ initialTotal: 0, limit: 10 });

  // 🔁 Debounced search effect
  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchText(value), 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchInput);
    return () => debouncedSearch.cancel(); // Cleanup debounce on unmount
  }, [searchInput, debouncedSearch]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-meal-requests', page, searchText],
    queryFn: async () => {
      const res = await secureAxios.get(
        `/admin/all-meal-requests?page=${page}&limit=${limit}&search=${searchText}`
      );
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const requests = data?.requests || [];
  const totalCount = data?.total || 0;

  useEffect(() => {
    setTotal(totalCount);
  }, [totalCount, setTotal]);

  const handleServe = async (source, id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to mark this meal as served?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Yes, serve it!',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await secureAxios.patch(`/admin/serve-meal-request/${source}/${id}`);
      if (res.data.success) {
        Swal.fire('Success', 'Meal marked as served.', 'success');
        refetch();
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to serve meal.', error);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold text-center mb-6">🍱 Serve Meals</h1>

      {/* 🔍 Search */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search by email or status..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      {/* 📋 Table */}
      <div className="overflow-x-auto rounded-lg shadow border">
        <table className="min-w-full text-sm text-left divide-y divide-gray-200">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Meal Title</th>
              <th className="px-4 py-3">User Email</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Requested At</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-red-500">
                  Something went wrong. Please try again later.
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  No meal requests found.
                </td>
              </tr>
            ) : (
              requests.map((req, idx) => (
                <tr key={req._id}>
                  <td className="px-4 py-3">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{req.mealTitle || 'N/A'}</td>
                  <td className="px-4 py-3">{req.userEmail}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className="text-xs px-2 py-1 bg-gray-600 rounded-full text-white">
                      {req.from}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {moment(req.requestedAt).format('YYYY-MM-DD HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        req.status === 'pending'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-green-200 text-green-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {req.status === 'pending' ? (
                      <button
                        onClick={() => handleServe(req.from, req._id)}
                        className="btn btn-sm btn-success"
                      >
                        Serve
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Already served</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
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

export default ServeMeals;
