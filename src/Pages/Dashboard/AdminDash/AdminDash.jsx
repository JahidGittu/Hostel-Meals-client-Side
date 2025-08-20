// src/Pages/Dashboard/AdminDash/AdminDash.jsx
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

// Recharts
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4'];

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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-pulse w-full space-y-6">
          <div className="h-24 bg-base-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-base-200 rounded-xl" />)}
          </div>
          <div className="h-72 bg-base-200 rounded-xl" />
        </div>
      </div>
    );
  }

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
    latest2Users = [],
  } = stats || {};

  // ---------- Chart Data ----------
  const usersByRoleData = (userRoles || []).map((r) => ({
    name: (r?._id || 'user').toUpperCase(),
    value: r?.count || 0,
  }));

  const todayOverviewData = [
    { name: 'New Users', value: todayUserCount || 0 },
    { name: 'Meal Req', value: todayMealRequests || 0 },
    { name: 'Upcoming Req', value: todayUpcomingMealRequests || 0 },
  ];

  const mealsOverviewData = [
    { name: 'Posted', value: totalMeals || 0 },
    { name: 'Upcoming', value: upcomingMealsCount || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FaUtensils />} label="Your Posted Meals" value={totalMeals} />
        <StatCard icon={<FaUsers />} label="Total Users" value={totalUsers} />
        <StatCard icon={<FaHourglassHalf />} label="Pending Meal Requests" value={pendingRequests} />
        <StatCard icon={<FaHourglassHalf />} label="Pending Upcoming Requests" value={pendingUpcomingRequests} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role (Pie) */}
        <div className="bg-base-100 rounded-xl shadow p-5">
          <h3 className="font-semibold mb-3">🧑‍💼 Users by Role</h3>
          {usersByRoleData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usersByRoleData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {usersByRoleData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
          <ul className="mt-4 text-sm grid grid-cols-2 gap-2">
            {usersByRoleData.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="opacity-80">{r.name}</span>
                <span className="ml-auto font-semibold">{r.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Today Overview (Bar) */}
        <div className="bg-base-100 rounded-xl shadow p-5">
          <h3 className="font-semibold mb-3">📈 Today Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={todayOverviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meals Overview (Bar) */}
        <div className="bg-base-100 rounded-xl shadow p-5">
          <h3 className="font-semibold mb-3">🍽️ Meals Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealsOverviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Extra Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="🥇 Top Meal Distributor">
          {mostMealsAddedBy ? (
            <p className="text-sm">
              Email:{' '}
              <span className="font-medium">{mostMealsAddedBy._id}</span>
              <br />
              Total Meals:{' '}
              <span className="font-bold">{mostMealsAddedBy.count}</span>
            </p>
          ) : (
            <p className="text-sm opacity-70">No data found.</p>
          )}
        </InfoCard>

        <InfoCard title="💬 Total Reviews">
          <p className="text-3xl font-bold">{totalReviews}</p>
        </InfoCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-base-100 rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">🚀 Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <ActionButton to="/dashboard/add-meal" icon={<FaPlus />} label="Add Meal" />
          <ActionButton to="/dashboard/manage-users" icon={<FaUserShield />} label="Manage Users" />
          <ActionButton to="/dashboard/all-reviews" icon={<FaComments />} label="All Reviews" />
        </div>
      </div>

      {/* Recent Pending Requests + Latest Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentRequestsCard
          className="lg:col-span-2"
          title="🛠️ Recent Meal Requests"
          requests={last3PendingMealRequests}
          fallbackText="No recent meal requests."
        />
        <RecentRequestsCard
          title="🛠️ Recent Upcoming Meal Requests"
          requests={last3PendingUpcomingRequests}
          fallbackText="No recent upcoming meal requests."
        />
      </div>

      <div className="bg-base-100 p-5 rounded-xl shadow">
        <h3 className="text-md font-semibold mb-4">👥 Latest Users</h3>
        {latest2Users?.length === 0 ? (
          <p className="text-sm opacity-70">No new users.</p>
        ) : (
          <ul className="space-y-3">
            {latest2Users.map((u, i) => (
              <li key={i} className="flex items-center gap-3">
                <img
                  src={u.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u?.name || u?.email || 'User')}`}
                  alt="User"
                  className="w-10 h-10 rounded-full border object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs opacity-70">{u.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ------- UI bits -------
const StatCard = ({ icon, label, value }) => (
  <div className="bg-base-100 rounded-xl shadow p-5 h-28 flex items-center justify-between">
    <div className="text-3xl opacity-80">{icon}</div>
    <div className="text-right">
      <p className="text-sm opacity-70">{label}</p>
      <p className="text-2xl font-bold leading-tight">{value}</p>
    </div>
  </div>
);

const InfoCard = ({ title, children }) => (
  <div className="bg-base-100 rounded-xl shadow p-5">
    <h3 className="font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

const ActionButton = ({ to, icon, label }) => (
  <Link
    to={to}
    className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
  >
    {icon} {label}
  </Link>
);

const RecentRequestsCard = ({ title, requests = [], fallbackText, className = '' }) => (
  <div className={`bg-base-100 p-5 rounded-xl shadow ${className}`}>
    <h3 className="text-md font-semibold mb-4">{title}</h3>
    {requests?.length ? (
      <ul className="space-y-4">
        {requests.map((req, idx) => (
          <li key={idx} className="border-b pb-2">
            <p className="text-sm font-medium">🍽️ Meal ID: {req.mealId}</p>
            <p className="text-xs opacity-80">User: {req.userEmail}</p>
            <p className="text-xs">Status: <span className="font-medium">{req.status}</span></p>
            <p className="text-xs opacity-60">{moment(req.requestedAt).fromNow()}</p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm opacity-70">{fallbackText}</p>
    )}
  </div>
);

const EmptyChart = () => (
  <div className="h-72 grid place-items-center">
    <p className="text-sm opacity-70">No data to visualize.</p>
  </div>
);

export default AdminDash;
