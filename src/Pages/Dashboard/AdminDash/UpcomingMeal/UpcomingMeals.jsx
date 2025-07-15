import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useSecureAxios from '../../../../hooks/useSecureAxios';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import useAuth from '../../../../hooks/useAuth';
import useImageUploader from '../../../../hooks/useImageUploader';
import usePagination from '../../../../hooks/usePagination';


const UpcomingMeals = () => {
  const secureAxios = useSecureAxios();
  const { user } = useAuth();
  const { upload, uploading } = useImageUploader();

  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm();

  // Pagination hook with initial total 0 and limit 10
  const {
    page,
    limit,
    totalPages,
    setTotal,
    goToPage,
    goToNextPage,
    goToPrevPage,
  } = usePagination({ initialTotal: 0, limit: 10 });

  // Debounce search input for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // React Query to fetch paginated + searched meals
  const { data = {}, isLoading, refetch } = useQuery({
    queryKey: ['upcoming-meals', page, searchDebounced],
    queryFn: async () => {
      const res = await secureAxios.get(
        `/upcoming-meals?page=${page}&limit=${limit}&search=${encodeURIComponent(searchDebounced)}`
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const meals = data.data || [];
  const totalCount = data.total || 0;

  // Update pagination total when totalCount changes
  useEffect(() => {
    setTotal(totalCount);
  }, [totalCount, setTotal]);

  const handlePublish = async (id) => {
    const confirm = await Swal.fire({
      title: 'Publish this meal?',
      text: 'It will be moved to the meals list',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Publish',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await secureAxios.post(`/publish-meal/${id}`);
        if (res.data.message) {
          Swal.fire('Published!', res.data.message, 'success');
          refetch();
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to publish', err.message || err);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setValue('image', [file], { shouldValidate: true });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      inputRef.current.files = dataTransfer.files;

      setValue('image', [file], { shouldValidate: true });
      trigger('image');
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const image = data.image[0];
      const imageUrl = await upload(image);

      const meal = {
        title: data.title,
        category: data.category,
        price: parseFloat(data.price),
        description: data.description,
        ingredients: data.ingredients,
        image: imageUrl,
        distributorName: user?.displayName || 'N/A',
        distributorEmail: user?.email || 'N/A',
        createdAt: new Date().toISOString(),
      };

      const res = await secureAxios.post('/upcoming-meals', meal);
      if (res.data.insertedId) {
        toast('🥳 Upcoming meal added', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        });
        reset();
        setPreview(null);
        setShowModal(false);
        refetch();
      }
    } catch (err) {
      toast.error('❌ Failed to add meal', err);
    }
  };

  return (
    <div className="max-w-full w-full">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📆 Upcoming Meals</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-sm btn-primary">
          ➕ Add Upcoming Meal
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <p className="text-sm font-medium">Total: {totalCount} upcoming meals</p>
        <input
          type="text"
          placeholder="🔍 Search upcoming meal"
          className="input input-sm input-bordered w-full sm:w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded shadow">
        <table className="table table-zebra text-sm text-center w-full">
          <thead className="bg-base-200 text-base">
            <tr>
              <th>Title</th>
              <th>Likes</th>
              <th>Category</th>
              <th>Price</th>
              <th>Distributor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-6">
                  Loading...
                </td>
              </tr>
            ) : meals.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 text-gray-500">
                  No upcoming meals found
                </td>
              </tr>
            ) : (
              meals.map((meal) => (
                <tr key={meal._id}>
                  <td className='text-left'>{meal.title}</td>
                  <td>{meal.likes || 0}</td>
                  <td>{meal.category}</td>
                  <td>৳{meal.price}</td>
                  <td>{meal.distributorName}</td>
                  <td>
                    <button onClick={() => handlePublish(meal._id)} className="btn btn-sm btn-success">
                      Publish
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-base-100 p-6 rounded shadow-md w-full max-w-2xl relative">
            <h3 className="text-lg font-bold mb-4">➕ Add Upcoming Meal</h3>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Title */}
              <div className="relative">
                <input
                  {...register('title', { required: true })}
                  className="input input-bordered w-full pr-12"
                  placeholder="Meal Title"
                />
                {watch('title') && (
                  <a
                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(watch('title'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-1 top-1 btn btn-sm btn-secondary z-10"
                  >
                    🔍
                  </a>
                )}
                {errors.title && <span className="text-sm text-red-500">Title is required</span>}
              </div>

              {/* Category */}
              <div>
                <input
                  {...register('category', { required: true })}
                  className="input input-bordered w-full"
                  placeholder="Category"
                />
                {errors.category && <span className="text-sm text-red-500">Category is required</span>}
              </div>

              {/* Price */}
              <div>
                <input
                  {...register('price', { required: true })}
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="Price (BDT)"
                />
                {errors.price && <span className="text-sm text-red-500">Price is required</span>}
              </div>

              {/* Image Upload */}
              <div className="relative h-[40px] border-2 border-dashed rounded border-gray-400 flex items-center justify-center cursor-pointer overflow-hidden">
                {!preview && <p className="text-sm text-gray-600">Drag & drop image or click</p>}
                <input
                  {...register('image', { required: true })}
                  ref={inputRef}
                  type="file"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {preview && <img src={preview} alt="Preview" className="h-full object-contain" />}
                {errors.image && (
                  <span className="text-sm text-red-500 absolute -bottom-5 left-0">Image is required</span>
                )}
              </div>

              {/* Ingredients */}
              <div className="md:col-span-2">
                <textarea
                  {...register('ingredients', { required: true })}
                  className="textarea textarea-bordered w-full"
                  placeholder="Ingredients"
                />
                {errors.ingredients && <span className="text-sm text-red-500">Ingredients required</span>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <textarea
                  {...register('description', { required: true })}
                  className="textarea textarea-bordered w-full"
                  placeholder="Meal Description"
                />
                {errors.description && <span className="text-sm text-red-500">Description required</span>}
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className='flex justify-center py-10'>
        <button onClick={() => setShowModal(true)} className="btn btn-sm btn-primary">
          ➕ Add Upcoming Meal
        </button>
      </div>
    </div>
  );
};

export default UpcomingMeals;
