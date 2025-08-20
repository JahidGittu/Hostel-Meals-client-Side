// src/Pages/Dashboard/AdminDash/AdminProfile.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../../hooks/useAuth';
import useSecureAxios from '../../../../hooks/useSecureAxios';

const AdminProfile = () => {
  const { user } = useAuth();
  const axiosSecure = useSecureAxios();

  // Load current user info
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await axiosSecure.get('/current-user');
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Load admin meal stats (posted meals & upcoming)
  const { data: mealStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-total-meals'],
    queryFn: async () => {
      const res = await axiosSecure.get('/total-meals');
      return res.data; // { mealsCount, upcomingCount }
    },
    enabled: !!user?.email,
  });

  const loading = userLoading || statsLoading;
  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-pulse w-full max-w-4xl space-y-6">
          <div className="h-40 rounded-xl bg-base-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 rounded-xl bg-base-200" />
            <div className="h-32 rounded-xl bg-base-200" />
          </div>
          <div className="h-64 rounded-xl bg-base-200" />
        </div>
      </div>
    );
  }

  const name =
    userData?.name || user?.displayName || 'Unknown User';
  const email = userData?.email || user?.email || 'unknown@email.com';
  const role = (userData?.role || 'admin').toUpperCase();
  const phone = userData?.phone || 'Not set';
  const address = userData?.address || 'Not set';
  const joined = userData?.created_At
    ? new Date(userData.created_At).toLocaleString()
    : '—';
  const lastLogin = userData?.last_Log_In
    ? new Date(userData.last_Log_In).toLocaleString()
    : '—';

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
      {/* Header / Summary */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-base-100 rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={avatar}
              alt="Profile"
              className="w-24 h-24 rounded-full border object-cover"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{name}</h2>
              <p className="text-sm opacity-80">{email}</p>
              <span className="mt-2 inline-block badge badge-primary">
                {role}
              </span>
            </div>
          </div>

          {/* Admin Stats */}
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
        </div>

        {/* Details */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6 md:p-8 mt-6">
          <h3 className="text-lg font-semibold mb-4">Profile Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Name" value={name} />
            <Detail label="Email" value={email} />
            <Detail label="Phone" value={phone} />
            <Detail label="Address" value={address} />
            <Detail label="Role" value={role} />
            <Detail label="Joined" value={joined} />
            <Detail label="Last Login" value={lastLogin} />
          </div>

          <p className="text-xs opacity-70 mt-6">
            * প্রোফাইল তথ্য পরিবর্তনের প্রয়োজন হলে দয়া করে সিস্টেম অ্যাডমিন/ডেভ টিমকে জানান।
          </p>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="p-4 rounded-lg bg-base-200">
    <p className="text-xs opacity-70">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default AdminProfile;
