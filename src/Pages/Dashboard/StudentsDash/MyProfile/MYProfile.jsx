import React, { useEffect, useState } from 'react';

import MembershipPage from '../../../MembershipPage/MembershipPage';
import useAuth from '../../../../hooks/useAuth';
import useSecureAxios from '../../../../hooks/useSecureAxios';

const MyProfile = () => {
  const { user } = useAuth();
  const axiosSecure = useSecureAxios();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const badgeEmoji = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
  };

  useEffect(() => {
    if (user?.email) {
      axiosSecure.get('/current/user')
        .then(res => {
          setUserData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load user data:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <p className="text-center py-10">Loading...</p>;

  const badge = userData?.badge || 'Bronze';

  return (
    <div className="p-6 bg-base-100 rounded-xl shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-center">👤 My Profile</h2>

      <div className="text-center">
        <img
          src={userData?.photo || user?.photoURL || '/placeholder.png'}
          alt="Profile"
          className="w-20 h-20 mx-auto rounded-full border"
        />
        <h3 className="text-xl font-semibold mt-2">{userData?.name || user?.displayName}</h3>
        <p className="text-sm text-gray-500">{userData?.email || user?.email}</p>
        <p className="text-md mt-2 font-medium">
          Badge: <span className="text-primary">{badgeEmoji[badge]} {badge}</span>
        </p>
      </div>

      {badge === 'Bronze' && (
       <MembershipPage></MembershipPage>
      )}
    </div>
  );
};

export default MyProfile;
