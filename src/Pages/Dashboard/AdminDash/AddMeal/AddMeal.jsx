import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../../../hooks/useAuth";
import useSecureAxios from "../../../../hooks/useSecureAxios";
import useImageUploader from "../../../../hooks/useImageUploader";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddMeal = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();
  const { upload, uploading } = useImageUploader();

  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    trigger,
  } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setValue("image", [file], { shouldValidate: true });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setValue("image", [file], { shouldValidate: true });
      trigger("image");
    }
  };

  const handleClickUpload = () => {
    inputRef.current.click();
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
        distributorName: user?.displayName || "N/A",
        distributorEmail: user?.email,
        rating: 0,
        likes: 0,
        reviews_count: 0,
      };

      const res = await secureAxios.post("/meals", meal);
      if (res.data.insertedId) {
        toast.success("✅ Meal successfully added!", {
          position: "top-right",
          autoClose: 4000,
          transition: Bounce,
        });
        reset();
        setPreview(null);
      }
    } catch (error) {
      toast.error(`❌ Error: ${error.message || "Something went wrong"}`);
    }
  };

  return (
    <div className="w-full p-2 bg-base-100 shadow-xl rounded-2xl">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-center my-4">🍽️ Add New Meal</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Side → Form Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-base-200 shadow-md p-4 rounded-xl space-y-4 hover:shadow-lg transition">
            {/* Title */}
            <div className="flex flex-col relative">
              <label className="font-medium mb-1">Meal Title</label>
              <input
                {...register("title", { required: true })}
                className="input input-bordered w-full"
                placeholder="Meal Title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">Title is required</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="font-medium mb-1">Category</label>
              <input
                {...register("category", { required: true })}
                className="input input-bordered w-full"
                placeholder="Category"
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  Category is required
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="font-medium mb-1">Price (BDT)</label>
              <input
                {...register("price", { required: true })}
                type="number"
                className="input input-bordered w-full"
                placeholder="Price"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">Price is required</p>
              )}
            </div>

            {/* Distributor */}
            <div>
              <label className="font-medium mb-1">Distributor Name</label>
              <input
                className="input input-bordered w-full bg-gray-400 cursor-not-allowed"
                value={user?.displayName || ""}
                readOnly
              />
            </div>
            <div>
              <label className="font-medium mb-1">Distributor Email</label>
              <input
                className="input input-bordered w-full bg-gray-400 cursor-not-allowed"
                value={user?.email || ""}
                readOnly
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-medium mb-1">Meal Description</label>
            <textarea
              {...register("description", { required: true })}
              className="bg-base-200 text-base-content textarea textarea-bordered w-full"
              placeholder="Meal description..."
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500">Description is required</p>
            )}
          </div>
        </div>

        {/* Right Side → Image + Textarea */}
        <div className="space-y-4">
          <label className="font-medium">Upload Image</label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleClickUpload}
            className="bg-base-200 w-full h-80 border-dashed border-2 border-gray-400 rounded-xl flex items-center justify-center text-center cursor-pointer overflow-hidden hover:shadow-xl transition-all"
          >
            {!preview && (
              <p className="text-gray-600 text-sm px-4">
                Drag & drop image here or click to upload
              </p>
            )}
            <input
              {...register("image", { required: true })}
              ref={inputRef}
              type="file"
              onChange={handleImageChange}
              className="hidden"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {errors.image && (
            <p className="text-red-500 text-sm">Image is required</p>
          )}

          {/* Ingredients */}
          <div>
            <label className="font-medium mb-1">Ingredients</label>
            <textarea
              {...register("ingredients", { required: true })}
              className="bg-base-200 text-base-content textarea textarea-bordered w-full"
              placeholder="List ingredients..."
              rows={3}
            />
            {errors.ingredients && (
              <p className="text-red-500">Ingredients are required</p>
            )}
          </div>
        </div>
        {/* Submit Button Full Width */}
        <div className="lg:col-span-3">
          <button
            type="submit"
            className="btn btn-primary w-full py-2 text-lg hover:scale-[1.01] transition-transform"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Add Meal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMeal;
