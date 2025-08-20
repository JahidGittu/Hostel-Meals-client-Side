import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useSecureAxios from "../../../../hooks/useSecureAxios";
import usePagination from "../../../../hooks/usePagination";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { FaTimes, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

const AllMeals = () => {
  const axiosSecure = useSecureAxios();
  const navigate = useNavigate();

  const [sortField, setSortField] = useState("likes");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  // Pagination hook
  const {
    page,
    limit,
    totalPages,
    setTotal,
    goToPage,
    goToNextPage,
    goToPrevPage,
  } = usePagination({ initialTotal: 0, limit: 10 });

  // Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch meals
  const {
    data = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["meals", page, sortField, sortOrder, searchDebounced],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/meals?sort=${sortField}&order=${sortOrder}&search=${searchDebounced}&page=${page}&limit=${limit}`
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const meals = data?.data || [];
  const totalCount = data?.total || 0;

  // Update total in pagination hook
  useEffect(() => {
    setTotal(totalCount);
  }, [totalCount]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this meal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it!",
    });

    try {
      if (confirm.isConfirmed) {
        const res = await axiosSecure.delete(`/meals/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire("Deleted!", "Meal has been deleted.", "success");
          refetch();
        }
      }
    } catch (err) {
      Swal.fire("Error", "Failed to delete meal", "error");
    }
  };

  return (
    <div className="max-w-full w-full p-4 sm:p-6 bg-base-100 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-center mb-6">
        📋 All Meals Management
      </h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Total */}
        <p className="text-sm font-medium bg-base-200 px-3 py-1 rounded-lg shadow-sm">
          Total: {totalCount} meals
        </p>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="🔍 Search meal by title"
            className="input input-sm input-bordered w-full pr-8 rounded-lg shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2 items-center justify-end">
          <label className="font-medium hidden sm:block">Sort By:</label>
          <select
            onChange={(e) => setSortField(e.target.value)}
            value={sortField}
            className="select select-sm select-bordered rounded-lg"
          >
            <option value="likes">Top Likes</option>
            <option value="reviews_count">Top Reviews</option>
            <option value="postTime">Date</option>
            <option value="category">Category</option>
          </select>
          <select
            onChange={(e) => setSortOrder(e.target.value)}
            value={sortOrder}
            className="select select-sm select-bordered rounded-lg"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-md border border-base-200">
        <table className="table text-center text-sm w-full">
          <thead className="bg-base-200 text-base font-semibold">
            <tr>
              <th>Title</th>
              <th>Likes</th>
              <th>Reviews</th>
              <th>Rating</th>
              <th>Category</th>
              <th>Distributor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(limit)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="7" className="py-4 text-center text-gray-300">
                    <ImSpinner2 className="animate-spin inline mr-2" />
                    Loading...
                  </td>
                </tr>
              ))
            ) : meals.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  No meals found.
                </td>
              </tr>
            ) : (
              meals.map((meal) => (
                <tr
                  key={meal._id}
                  className="hover:bg-base-200 transition-colors"
                >
                  <td className="text-left font-medium">{meal.title}</td>
                  <td>{meal.likes}</td>
                  <td>{meal.reviews_count}</td>
                  <td>{meal.rating}</td>
                  <td>{meal.category}</td>
                  <td>{meal.distributorName}</td>
                  <td>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/update-meal/${meal._id}`)
                        }
                        className="btn btn-xs btn-info flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(meal._id)}
                        className="btn btn-xs btn-error flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                      <button
                        onClick={() => navigate(`/meal/${meal._id}`)}
                        className="btn btn-xs btn-success flex items-center gap-1"
                      >
                        <FaEye /> View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          <button
            className="btn btn-sm"
            onClick={goToPrevPage}
            disabled={page === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`btn btn-sm ${
                page === i + 1 ? "btn-primary" : "btn-outline"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-sm"
            onClick={goToNextPage}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllMeals;
