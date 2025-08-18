import React from 'react';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { FaMedal, FaWallet, FaComments, FaUtensils } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import useSecureAxios from '../../../hooks/useSecureAxios';

const StudentDash = () => {
    const { user } = useAuth();
    const secureAxios = useSecureAxios();

    const { data, isLoading } = useQuery({
        queryKey: ['user-dashboard', user?.email],
        queryFn: async () => {
            const res = await secureAxios.get(`/user-dashboard?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    if (isLoading) {
        return <div className="text-center py-20 text-xl font-semibold">Loading your dashboard...</div>;
    }

    const {
        badge,
        requestedMealCount,
        totalReviews,
        totalPayments,
        userInfo,
        recentRequestedMeals,
        recentReviews
    } = data || {};


    // console.log(recentRequestedMeals)

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Badge" value={badge} icon={<FaMedal />} gradient="from-indigo-600 to-purple-800" />
                <Card title="Requested Meals" value={requestedMealCount} icon={<FaUtensils />} gradient="from-blue-600 to-blue-800" />
                <Card title="Total Reviews" value={totalReviews} icon={<FaComments />} gradient="from-green-600 to-green-800" />
                <Card title="Payments" value={totalPayments} icon={<FaWallet />} gradient="from-pink-600 to-pink-800" />
            </div>

            {/* User Info */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-xl p-6 shadow">
                <h3 className="text-lg font-semibold mb-4">👤 My Info</h3>
                <div className="flex items-center space-x-4">
                    <img src={userInfo?.photo} alt="User" className="w-16 h-16 rounded-full border-2 border-white" />
                    <div>
                        <p className="font-semibold">{userInfo?.name}</p>
                        <p className="text-sm text-gray-300">{userInfo?.email}</p>
                        <p className="text-sm mt-1">
                            Badge: <span className="font-medium text-yellow-400">{badge}</span> |
                            {/* Subscription: <span className="font-medium text-emerald-400">{subscription}</span> */}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requested Meals */}
                {/* Requested Meals */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-xl p-6 shadow">
                    <h3 className="text-lg font-semibold mb-4">🍽️ Recent Requested Meals</h3>
                    {recentRequestedMeals?.length > 0 ? (
                        <ul className="space-y-3">
                            {recentRequestedMeals.slice(0, 3).map((meal, i) => (
                                <li key={i} className="flex justify-between items-center text-sm border-b border-gray-600 mb-8">
                                    <div>
                                        <p className="font-medium">{meal.title}</p>
                                        <p className="text-xs text-gray-400">Type: {meal.type}</p>
                                        <p className="text-xs text-gray-500">{moment(meal.requestedAt).fromNow()}</p>
                                    </div>
                                    <span className={`badge ${meal.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>
                                        {meal.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No recent requests found.</p>
                    )}
                </div>


                {/* Reviews */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-xl p-6 shadow">
                    <h3 className="text-lg font-semibold mb-4">💬 Recent Reviews</h3>
                    {recentReviews?.length > 0 ? (
                        <ul className="space-y-4">
                            {recentReviews.slice(0, 2).map((rev, i) => (
                                <li key={i} className="border-b border-gray-600 pb-3">
                                    <p className="text-sm font-medium">{rev.mealTitle}</p>
                                    <p className="text-gray-300 text-sm">{rev.reviewText}</p>
                                    <p className="text-xs text-gray-400">{moment(rev.createdAt).fromNow()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No recent reviews yet.</p>
                    )}
                </div>
            </div>

            {/* Upgrade Banner */}
            {(badge === 'Bronze' || badge === 'Silver') && (
                <div className="bg-gradient-to-r from-yellow-800 to-yellow-600 text-white p-6 rounded-xl shadow text-center">
                    <h3 className="text-lg font-semibold mb-2">🚀 Upgrade Your Experience</h3>
                    <p className="text-sm mb-4">
                        Upgrade to <span className="font-bold text-yellow-200">Gold</span> for exclusive meal access and premium perks!
                    </p>
                    <a href="/membership" className="btn btn-warning btn-sm">Upgrade Now</a>
                </div>
            )}
        </div>
    );
};

const Card = ({ title, value, icon, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} text-white p-5 rounded-xl shadow flex items-center space-x-4`}>
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-sm">{title}</p>
            <h3 className="text-xl font-bold">{value}</h3>
        </div>
    </div>
);

export default StudentDash;
