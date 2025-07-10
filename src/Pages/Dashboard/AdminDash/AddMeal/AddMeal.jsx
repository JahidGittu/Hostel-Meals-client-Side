import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../../hooks/useAuth';
import useSecureAxios from '../../../../hooks/useSecureAxios';
import useImageUploader from '../../../../hooks/useImageUploader';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddMeal = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();
  const { upload, uploading } = useImageUploader();

  const inputRef = useRef(null); // ✅ New ref
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
    trigger
  } = useForm();

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
      // ✅ Update input ref manually (important!)
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
      const imageFile = data.image[0];
      const imageUrl = await upload(imageFile);

      const meal = {
        title: data.title,
        category: data.category,
        ingredients: data.ingredients,
        description: data.description,
        price: parseFloat(data.price),
        image: imageUrl,
        postTime: new Date().toISOString(),
        distributorName: user?.displayName || 'N/A',
        distributorEmail: user?.email,
        rating: 0,
        likes: 0,
        reviews_count: 0,
      };

      const res = await secureAxios.post('/meals', meal);
      if (res.data.insertedId) {
        toast('🦄 Meal successfully added!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        reset();
        setPreview(null);
      }
    } catch (error) {
      toast.error(`❌ Error: ${error.message || 'Something went wrong'}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 shadow rounded">
      <ToastContainer />
      <h2 className="text-2xl font-bold text-center mb-6">🍽️ Add New Meal</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Title Input with search */}
        <div className="flex flex-col relative">
          <input
            {...register('title', { required: true })}
            className="input input-bordered w-full pr-16 focus:outline-none focus:border-gray-600"
            placeholder="Meal Title"
          />
          {watch('title') && watch('title').trim() !== '' && (
            <a
              href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(watch('title'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-1 top-1 btn btn-secondary btn-sm z-10 text-md">
              🔍
            </a>
          )}
          {errors.title && <p className="text-red-500 text-sm mt-1">Title is required</p>}
        </div>

        {/* Category */}
        <div className="flex flex-col">
          <input
            {...register('category', { required: true })}
            className="input input-bordered w-full focus:outline-none focus:border-gray-600"
            placeholder="Category"
          />
          {errors.category && <p className="text-red-500 text-sm mt-1">Category is required</p>}
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <input
            {...register('price', { required: true })}
            type="number"
            className="input input-bordered w-full focus:outline-none focus:border-gray-600"
            placeholder="Price (BDT)"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">Price is required</p>}
        </div>

        {/* Drag & Drop Image Upload */}
        <div className="flex flex-col">
          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="w-full h-[40px] border-dashed border-2 border-gray-400 rounded flex items-center justify-center text-center cursor-pointer overflow-hidden"
          >
            {!preview && <p className="text-gray-600 text-sm">Drag & drop image here or click</p>}
            <input
              {...register('image', { required: true })}
              ref={inputRef}
              type="file"
              onChange={handleImageChange}
              className="file-input hidden"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="h-full object-contain"
              />
            )}
          </label>
          {errors.image && <p className="text-red-500 text-sm mt-1">Image is required</p>}
        </div>

        {/* Ingredients */}
        <textarea
          {...register('ingredients', { required: true })}
          className="textarea textarea-bordered w-full md:col-span-2 focus:outline-none focus:border-gray-600"
          placeholder="Ingredients"
        />
        {errors.ingredients && <p className="text-red-500">Ingredients are required</p>}

        {/* Description */}
        <textarea
          {...register('description', { required: true })}
          className="textarea textarea-bordered w-full md:col-span-2 focus:outline-none focus:border-gray-600"
          placeholder="Meal Description"
        />
        {errors.description && <p className="text-red-500">Description is required</p>}

        {/* Distributor Info */}
        <div className="md:col-span-2">
          <input className="input input-bordered w-full focus:outline-none focus:border-gray-600" value={user?.displayName || ''} readOnly />
          <p className="text-xs text-gray-500 ml-1">Distributor Name</p>
        </div>
        <div className="md:col-span-2">
          <input className="input input-bordered w-full focus:outline-none focus:border-gray-600" value={user?.email || ''} readOnly />
          <p className="text-xs text-gray-500 ml-1">Distributor Email</p>
        </div>

        {/* Submit */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="btn btn-primary w-full focus:outline-none focus:border-gray-600"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Add Meal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMeal;
