// src/Pages/Dashboard/StudentsDash/AdminProfile.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../../hooks/useAuth";
import useSecureAxios from "../../../../hooks/useSecureAxios";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminProfile = () => {
  const { user } = useAuth();
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  // Load current user info
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await axiosSecure.get("/current-user");
      return res.data;
    },
    enabled: !!user?.email,
    onSuccess: (data) => {
      setFormData({
        name: data?.name || "",
        phone: data?.phone || "",
        address: data?.address || "",
      });
    },
  });

  // Load admin meal stats
  const { data: mealStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-total-meals"],
    queryFn: async () => {
      const res = await axiosSecure.get("/total-meals");
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Update mutation
  const updateUser = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.put("/update-profile", updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setEditing(false);
      toast("Profile updated successfully!");
    },
    onError: () => toast("Profile updated successfully!")});

  const loading = userLoading || statsLoading;
  if (loading) return <div>Loading...</div>;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => updateUser.mutate(formData);

  const handleEdit = () => {
    setEditing(true);
    setFormData({
      name: userData?.name || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
    });
  };

  const name = userData?.name || user?.displayName || "Unknown User";
  const email = userData?.email || user?.email || "unknown@email.com";
  const role = (userData?.role || "admin").toUpperCase();
  const phone = userData?.phone || "Not set";
  const address = userData?.address || "Not set";
  const joined = userData?.created_At
    ? new Date(userData.created_At).toLocaleString()
    : "—";
  const lastLogin = userData?.last_Log_In
    ? new Date(userData.last_Log_In).toLocaleString()
    : "—";
  const avatar =
    userData?.photo ||
    user?.photoURL ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name || email
    )}`;
  const mealsCount = mealStats?.mealsCount ?? 0;
  const upcomingCount = mealStats?.upcomingCount ?? 0;

  return (
    <div className="min-h-[70vh] py-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <div className="w-full max-w-4xl mx-auto">

        {/* Profile Header */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={avatar}
            alt="Profile"
            className="w-24 h-24 rounded-full border object-cover"
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-sm opacity-80">{email}</p>
            <span className="mt-2 inline-block badge badge-primary">
              {role}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl p-5 text-center bg-success text-success-content">
            <p className="text-sm opacity-90">🍽️ Posted Meals</p>
            <p className="text-3xl font-bold">{mealsCount}</p>
          </div>
          <div className="rounded-xl p-5 text-center bg-warning text-warning-content">
            <p className="text-sm opacity-90">📅 Upcoming Meals</p>
            <p className="text-3xl font-bold">{upcomingCount}</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="relative bg-base-100 rounded-xl shadow-lg p-6 md:p-8 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Edit / Save buttons in top-right corner */}
          <div className="absolute top-4 right-4 flex gap-2">
            {!editing ? (
              <button className="btn btn-sm btn-outline" onClick={handleEdit}>
                Edit <FaEdit />
              </button>
            ) : (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={handleSave}
                  disabled={updateUser.isLoading}
                >
                  Save <FaSave />
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => setEditing(false)}
                >
                  Cancel <FaTimes />
                </button>
              </>
            )}
          </div>

          <Detail
            label="Name"
            value={
              editing ? (
                <input
                  className="input input-sm input-bordered w-full"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              ) : (
                name
              )
            }
          />
          <Detail label="Email" value={email} />
          <Detail
            label="Phone"
            value={
              editing ? (
                <input
                  className="input input-sm input-bordered w-full"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              ) : (
                phone
              )
            }
          />
          <Detail
            label="Address"
            value={
              editing ? (
                <input
                  className="input input-sm input-bordered w-full"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              ) : (
                address
              )
            }
          />
          <Detail label="Role" value={role} />
          <Detail label="Joined" value={joined} />
          <Detail label="Last Login" value={lastLogin} />
        </div>

      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-base-200">
    <p className="text-xs opacity-70">{label}</p>
    {typeof value === "string" ? <p className="font-medium">{value}</p> : value}
  </div>
);

export default AdminProfile;
