// src/Pages/Dashboard/StudentsDash/MyProfile.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../../hooks/useAuth';
import useSecureAxios from '../../../../hooks/useSecureAxios';

const badgeEmoji = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
};

const MyProfile = () => {
  const { user } = useAuth();
  const axiosSecure = useSecureAxios();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await axiosSecure.get('/current-user');
      return res.data;
    },
    enabled: !!user?.email,
  });

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

  const name =
    userData?.name || user?.displayName || 'Unknown User';
  const email = userData?.email || user?.email || 'unknown@email.com';
  const phone = userData?.phone || 'Not set';
  const address = userData?.address || 'Not set';
  const badge = userData?.badge || 'Bronze';
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

  return (
    <div className="min-h-[70vh] py-6">
      <div className="w-full max-w-3xl mx-auto">
        {/* Profile Summary */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={avatar}
              alt="Profile"
              className="w-20 h-20 rounded-full border object-cover"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{name}</h2>
              <p className="text-sm opacity-80">{email}</p>
              <span className="mt-2 inline-flex items-center gap-2 badge badge-primary">
                <span className="text-lg leading-none">
                  {badgeEmoji[badge] || '🥉'}
                </span>
                <span>{badge}</span>
              </span>
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
            <Detail label="Badge" value={`${badgeEmoji[badge] || '🥉'} ${badge}`} />
            <Detail label="Joined" value={joined} />
            <Detail label="Last Login" value={lastLogin} />
          </div>

          {(badge === 'Bronze' || badge === 'Silver') && (
            <div className="mt-6 rounded-xl p-5 bg-gradient-to-r from-yellow-800 to-yellow-600 text-white text-center">
              <h4 className="font-semibold">🚀 Upgrade Your Membership</h4>
              <p className="text-sm opacity-90 mt-1">
                Gold / Platinum ব্যাজে আপগ্রেড করলে প্রিমিয়াম বেনিফিট পাবেন।
              </p>
              <a href="/membership" className="btn btn-warning btn-sm mt-3">
                Upgrade Now
              </a>
            </div>
          )}

          <p className="text-xs opacity-70 mt-6">
            * যদি ফোন/ঠিকানা আপডেট করতে চান, দয়া করে সাপোর্ট/অ্যাডমিনকে জানান।
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

export default MyProfile;
