// src/Pages/Dashboard/StudentsDash/StudentDash.jsx
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { FaMedal, FaWallet, FaComments, FaUtensils } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import useSecureAxios from '../../../hooks/useSecureAxios';

// Recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#6366F1'];

const StudentDash = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();

  // Fetch dashboard data
  const { data = {}, isLoading } = useQuery({
    queryKey: ['user-dashboard', user?.email],
    queryFn: async () => {
      const res = await secureAxios.get(`/user-dashboard?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Destructure with defaults
  const {
    badge = 'N/A',
    requestedMealCount = 0,
    totalReviews = 0,
    totalPayments = 0,
    userInfo = {},
    recentRequestedMeals = [],
    recentReviews = [],
  } = data || {};

  // ---------- Charts ----------
  // 1) Requested meals last 7 days (area)
  const last7Data = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = moment().subtract(6 - i, 'days').startOf('day');
      return { key: d.format('YYYY-MM-DD'), label: d.format('DD MMM') };
    });

    const counts = recentRequestedMeals.reduce((acc, m) => {
      const key = moment(m.requestedAt).startOf('day').format('YYYY-MM-DD');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return days.map(d => ({ name: d.label, value: counts[d.key] || 0 }));
  }, [recentRequestedMeals]);

  // 2) Status distribution (pie)
  const statusData = useMemo(() => {
    const counts = recentRequestedMeals.reduce((acc, m) => {
      const k = (m.status || 'pending').toLowerCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(counts).map(([name, value]) => ({
      name: name[0].toUpperCase() + name.slice(1),
      value,
    }));
    return entries.length ? entries : [{ name: 'Pending', value: 0 }];
  }, [recentRequestedMeals]);

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

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Badge" value={badge} icon={<FaMedal />} />
        <Card title="Requested Meals" value={requestedMealCount} icon={<FaUtensils />} />
        <Card title="Total Reviews" value={totalReviews} icon={<FaComments />} />
        <Card title="Payments" value={totalPayments} icon={<FaWallet />} />
      </div>

      {/* My Info */}
      <div className="bg-base-100 rounded-xl p-5 shadow">
        <h3 className="text-lg font-semibold mb-4">👤 My Info</h3>
        <div className="flex items-center gap-4">
          <img
            src={
              userInfo?.photo ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userInfo?.name || userInfo?.email || 'User')}`
            }
            alt="User"
            className="w-16 h-16 rounded-full border object-cover"
          />
          <div>
            <p className="font-semibold">{userInfo?.name}</p>
            <p className="text-sm opacity-70">{userInfo?.email}</p>
            <p className="text-sm mt-1">
              Badge: <span className="font-medium">{badge}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requested meals last 7 days */}
        <div className="bg-base-100 rounded-xl shadow p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">📅 Requested Meals — Last 7 Days</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Data}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366F1" fillOpacity={1} fill="url(#colorReq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-base-100 rounded-xl shadow p-5">
          <h3 className="font-semibold mb-3">🍽️ Request Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 text-sm grid grid-cols-2 gap-2">
            {statusData.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="opacity-80">{s.name}</span>
                <span className="ml-auto font-semibold">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Requested Meals */}
        <div className="bg-base-100 rounded-xl p-5 shadow">
          <h3 className="text-lg font-semibold mb-4">🍽️ Recent Requested Meals</h3>
          {recentRequestedMeals?.length > 0 ? (
            <ul className="space-y-3">
              {recentRequestedMeals.slice(0, 3).map((meal, i) => (
                <li key={i} className="flex justify-between items-center text-sm border-b pb-3">
                  <div>
                    <p className="font-medium">{meal.title}</p>
                    <p className="text-xs opacity-70">Type: {meal.type}</p>
                    <p className="text-xs opacity-60">{moment(meal.requestedAt).fromNow()}</p>
                  </div>
                  <span className={`badge ${meal.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>
                    {meal.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="opacity-70">No recent requests found.</p>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-base-100 rounded-xl p-5 shadow">
          <h3 className="text-lg font-semibold mb-4">💬 Recent Reviews</h3>
          {recentReviews?.length > 0 ? (
            <ul className="space-y-4">
              {recentReviews.slice(0, 2).map((rev, i) => (
                <li key={i} className="border-b pb-3">
                  <p className="text-sm font-medium">{rev.mealTitle}</p>
                  <p className="opacity-80 text-sm">{rev.reviewText}</p>
                  <p className="text-xs opacity-60">{moment(rev.createdAt).fromNow()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="opacity-70">No recent reviews yet.</p>
          )}
        </div>
      </div>

      {/* Upgrade Banner */}
      {(badge === 'Bronze' || badge === 'Silver') && (
        <div className="bg-gradient-to-r from-yellow-800 to-yellow-600 text-white p-6 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold mb-2">🚀 Upgrade Your Experience</h3>
          <p className="text-sm mb-4">
            Upgrade to <span className="font-bold">Gold</span> for exclusive meal access and premium perks!
          </p>
          <a href="/membership" className="btn btn-warning btn-sm">Upgrade Now</a>
        </div>
      )}
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="bg-base-100 rounded-xl shadow p-5 h-28 flex items-center justify-between">
    <div className="text-3xl opacity-80">{icon}</div>
    <div className="text-right">
      <p className="text-sm opacity-70">{title}</p>
      <h3 className="text-2xl font-bold leading-tight">{value}</h3>
    </div>
  </div>
);

export default StudentDash;
