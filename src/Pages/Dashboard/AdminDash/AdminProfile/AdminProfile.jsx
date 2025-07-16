import React, { useEffect, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';
import useSecureAxios from '../../../../hooks/useSecureAxios';


const AdminProfile = () => {
    const { user } = useAuth();
    const axiosSecure = useSecureAxios();

    const [userData, setUserData] = useState(null);
    const [mealCount, setMealCount] = useState(0);
    const [upcomingCount, setUpcomingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            const fetchData = async () => {
                try {
                    const userRes = await axiosSecure.get('/current-user');
                    const statsRes = await axiosSecure.get('/total-meals');

                    setUserData(userRes.data);
                    setMealCount(statsRes.data.mealsCount || 0);
                    setUpcomingCount(statsRes.data.upcomingCount || 0);
                } catch (err) {
                    console.error('Failed to fetch admin data:', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [user]);

    if (loading) return <p className="text-center py-10">Loading...</p>;

    return (
        <div className="flex justify-center items-center min-h-screen bg-base-200 p-4 -mt-36">
            <div className="w-full max-w-4xl p-8 bg-base-100 rounded-xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-center">🛡️ Admin Profile</h2>

                <div className="text-center">
                    <img
                        src={userData?.photo || user?.photoURL || '/placeholder.png'}
                        alt="Profile"
                        className="w-24 h-24 mx-auto rounded-full border"
                    />
                    <h3 className="text-xl font-semibold mt-2">
                        {userData?.name || user?.displayName || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">{userData?.email || user?.email}</p>
                    <p className="text-md mt-1 font-medium">
                        Role: <span className="text-gray-400">Admin</span>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="bg-success text-white p-6 rounded-md text-center">
                        <h4 className="text-lg font-bold">🍽️ Posted Meals</h4>
                        <p className="text-3xl font-semibold">{mealCount}</p>
                    </div>
                    <div className="bg-warning text-white p-6 rounded-md text-center">
                        <h4 className="text-lg font-bold">📅 Upcoming Meals</h4>
                        <p className="text-3xl font-semibold">{upcomingCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
