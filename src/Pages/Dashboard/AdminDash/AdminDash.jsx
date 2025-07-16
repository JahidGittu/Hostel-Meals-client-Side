import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FaUsers,
  FaUtensils,
  FaHourglassHalf,
  FaCalendarAlt,
  FaPlus,
  FaUserShield,
  FaComments
} from 'react-icons/fa';
import { Link } from 'react-router';
import moment from 'moment';
import useAuth from '../../../hooks/useAuth';
import useSecureAxios from '../../../hooks/useSecureAxios';

const AdminDash = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['admin-stats', user?.email],
    queryFn: async () => {
      const res = await secureAxios.get(`/admin-dashboard?email=${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  if (isLoading) return <p className="text-center text-xl py-20">Loading Admin Dashboard...</p>;

  const {
    totalMeals = 0,
    totalUsers = 0,
    pendingRequests = 0,
    pendingUpcomingRequests = 0,
    upcomingMealsCount = 0,
    todayUserCount = 0,
    todayMealRequests = 0,
    todayUpcomingMealRequests = 0,
    userRoles = [],
    mostMealsAddedBy = null,
    totalReviews = 0,
    last3PendingMealRequests = [],
    last3PendingUpcomingRequests = [],
    latest2Users = []
  } = stats || {};

  return (
    <div className="space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FaUtensils />} label="Your Posted Meals" value={totalMeals} gradient="from-purple-500 to-purple-700" />
        <StatCard icon={<FaUsers />} label="Total Users" value={totalUsers} gradient="from-blue-500 to-blue-700" />
        <StatCard icon={<FaHourglassHalf />} label="Pending Meal Requests" value={pendingRequests} gradient="from-orange-500 to-orange-700" />
        <StatCard icon={<FaHourglassHalf />} label="Pending Upcoming Requests" value={pendingUpcomingRequests} gradient="from-pink-500 to-pink-700" />
      </div>

      {/* Today Stats + Total Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<FaUsers />} label="Today's New Users" value={todayUserCount} gradient="from-indigo-500 to-indigo-700" />
        <StatCard icon={<FaUtensils />} label="Today's Meal Requests" value={todayMealRequests} gradient="from-teal-500 to-teal-700" />
        <StatCard icon={<FaUtensils />} label="Today's Upcoming Requests" value={todayUpcomingMealRequests} gradient="from-yellow-500 to-yellow-700" />
      </div>

      {/* Extra Stats */}
      <div className="px-36 grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard icon={<FaCalendarAlt />} label="Your Upcoming Meals" value={upcomingMealsCount} gradient="from-green-500 to-green-700" />
        <StatCard icon={<FaComments />} label="Total Reviews" value={totalReviews} gradient="from-rose-500 to-rose-700" />
      </div>

      {/* User Roles + Top Distributor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow">
          <h2 className="text-lg font-semibold mb-3">🧑‍💼 Users by Role</h2>
          <ul className="space-y-2">
            {(userRoles || []).map((role, i) => (
              <li key={i} className="flex justify-between text-sm border-b pb-1 border-gray-700">
                <span className="capitalize">{role._id || 'User'}</span>
                <span>{role.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow">
          <h2 className="text-lg font-semibold mb-3">🥇 Top Meal Distributor</h2>
          {mostMealsAddedBy ? (
            <p className="text-sm">
              Email: <span className="font-medium text-yellow-300">{mostMealsAddedBy._id}</span><br />
              Total Meals: <span className="font-bold">{mostMealsAddedBy.count}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400">No data found.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">🚀 Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <ActionButton to="/dashboard/add-meal" icon={<FaPlus />} label="Add Meal" />
          <ActionButton to="/dashboard/manage-users" icon={<FaUserShield />} label="Manage Users" />
          <ActionButton to="/dashboard/all-reviews" icon={<FaComments />} label="All Reviews" />
        </div>
      </div>

      {/* Recent Pending Requests and Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Meal Requests */}
        <RecentRequestsCard
          title="🛠️ Recent Meal Requests"
          requests={last3PendingMealRequests}
          fallbackText="No recent meal requests."
        />
        {/* Recent Upcoming Requests */}
        <RecentRequestsCard
          title="🛠️ Recent Upcoming Meal Requests"
          requests={last3PendingUpcomingRequests}
          fallbackText="No recent upcoming meal requests."
        />
      </div>

      {/* Latest Users */}
      <div className="bg-gradient-to-br from-slate-800 to-gray-900 p-6 rounded-xl shadow text-white">
        <h3 className="text-md font-semibold mb-4">👥 Latest Users</h3>
        {latest2Users?.length === 0 ? (
          <p className="text-sm text-gray-400">No new users.</p>
        ) : (
          <ul className="space-y-3">
            {latest2Users.map((u, i) => (
              <li key={i} className="flex items-center gap-3">
                <img src={u.photo} alt="User" className="w-10 h-10 rounded-full border border-gray-600" />
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, gradient }) => (
  <div className={`p-6 rounded-xl shadow text-white bg-gradient-to-r ${gradient}`}>
    <div className="flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm">{label}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
    </div>
  </div>
);

// Action Button Component
const ActionButton = ({ to, icon, label }) => (
  <Link to={to} className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
    {icon} {label}
  </Link>
);

// Recent Requests Card Component
const RecentRequestsCard = ({ title, requests = [], fallbackText }) => (
  <div className="bg-gradient-to-br from-slate-800 to-gray-900 p-6 rounded-xl shadow text-white">
    <h3 className="text-md font-semibold mb-4">{title}</h3>
    {requests.length === 0 ? (
      <p className="text-sm text-gray-400">{fallbackText}</p>
    ) : (
      <ul className="space-y-4">
        {requests.map((req, idx) => (
          <li key={idx} className="border-b border-gray-700 pb-2">
            <p className="text-sm font-medium">🍽️ Meal ID: {req.mealId}</p>
            <p className="text-xs">User: {req.userEmail}</p>
            <p className="text-xs">Status: {req.status}</p>
            <p className="text-xs text-gray-400">{moment(req.requestedAt).fromNow()}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default AdminDash;
