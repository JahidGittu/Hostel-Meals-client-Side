// src/Pages/Dashboard/StudentsDash/MyProfile.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../../hooks/useAuth";
import useSecureAxios from "../../../../hooks/useSecureAxios";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const badgeEmoji = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
};

const MyProfile = () => {
  const { user } = useAuth();
  const axiosSecure = useSecureAxios();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Fetch user data
  const { data: userData, isLoading } = useQuery({
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

  // Update mutation
  const updateUser = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axiosSecure.put("/update-profile", updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] }); // Re-fetch for real-time update
      setEditing(false);
      toast("Profile updated successfully!");
    },
    onError: () => toast("Profile updated successfully!")});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    updateUser.mutate(formData);
  };

  const handleEdit = () => {
    setEditing(true);
    // নিশ্চিত করা ইনপুটে আগের ডেটা থাকে
    setFormData({
      name: userData?.name || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-pulse w-full max-w-3xl space-y-6">
          <div className="h-40 rounded-xl bg-base-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-28 rounded-xl bg-base-200" />
            <div className="h-28 rounded-xl bg-base-200" />
          </div>
          <div className="h-40 rounded-xl bg-base-200" />
        </div>
      </div>
    );
  }

  const name = userData?.name || user?.displayName || "Unknown User";
  const email = userData?.email || user?.email || "unknown@email.com";
  const phone = userData?.phone || "Not set";
  const address = userData?.address || "Not set";
  const badge = userData?.badge || "Bronze";
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
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Profile Summary */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6 md:p-8 flex items-center gap-6">
          <img
            src={avatar}
            alt="Profile"
            className="w-20 h-20 rounded-full border object-cover"
          />
          <div className="flex-1 text-left">
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-sm opacity-80">{email}</p>
            <span className="mt-2 inline-flex items-center gap-2 badge badge-primary">
              <span className="text-lg leading-none">
                {badgeEmoji[badge] || "🥉"}
              </span>
              <span>{badge}</span>
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6 md:p-8 relative">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Profile Details
            {!editing ? (
              <button
                className="btn btn-sm btn-outline flex items-center gap-1"
                onClick={handleEdit}
              >
                <FaEdit /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-success flex items-center gap-1"
                  onClick={handleSave}
                  disabled={updateUser.isLoading}
                >
                  <FaSave /> Save
                </button>
                <button
                  className="btn btn-sm btn-error flex items-center gap-1"
                  onClick={() => setEditing(false)}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail
              label="Name"
              value={name}
              editable={editing}
              name="name"
              onChange={handleChange}
              inputValue={formData.name}
            />
            <Detail label="Email" value={email} editable={false} />
            <Detail
              label="Phone"
              value={phone}
              editable={editing}
              name="phone"
              onChange={handleChange}
              inputValue={formData.phone}
            />
            <Detail
              label="Address"
              value={address}
              editable={editing}
              name="address"
              onChange={handleChange}
              inputValue={formData.address}
            />
            <Detail
              label="Badge"
              value={`${badgeEmoji[badge] || "🥉"} ${badge}`}
            />
            <Detail label="Joined" value={joined} />
            <Detail label="Last Login" value={lastLogin} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value, editable, name, onChange, inputValue }) => {
  if (!editable) {
    return (
      <div className="p-4 rounded-lg bg-base-200">
        <p className="text-xs opacity-70">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-base-200 flex flex-col">
      <p className="text-xs opacity-70 mb-1">{label}</p>
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={onChange}
        className="input input-sm input-bordered w-full"
      />
    </div>
  );
};

export default MyProfile;
