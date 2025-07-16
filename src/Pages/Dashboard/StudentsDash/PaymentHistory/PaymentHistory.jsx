import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../../hooks/useAuth';
import useSecureAxios from '../../../../hooks/useSecureAxios';
import MembershipPage from '../../../MembershipPage/MembershipPage';

const PaymentHistory = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();

  const { data: userDetails = {}, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => secureAxios.get('/current-user').then(res => res.data),
    enabled: !!user?.email,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['my-payments', user?.email],
    queryFn: async () => {
      const res = await secureAxios.get(`/my-payments?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  if (userLoading || paymentsLoading)
    return <div className="text-center py-10">Loading...</div>;

  // যদি পেমেন্ট না থাকে অথবা ব্যাজ Bronze হয়
  if (payments.length === 0 || userDetails.badge === 'Bronze') {
    return (
      <div className="text-center py-10 space-y-6">
        {payments.length === 0 && (
          <p className="text-lg text-gray-600">
            You have not made any payments yet.
          </p>
        )}
        {userDetails.badge === 'Bronze' && (
          <p className="text-lg text-green-600 font-semibold">
            Your current membership is Bronze. Upgrade to premium to enjoy full benefits.
          </p>
        )}
        <div className="">
          <MembershipPage />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">💳 My Payment History</h2>
      <div className="overflow-x-auto rounded shadow">
        <table className="table w-full text-sm">
          <thead className="bg-base-200">
            <tr>
              <th>#</th>
              <th>Package</th>
              <th>Price</th>
              <th>Transaction ID</th>
              <th>Method</th>
              <th>Currency</th>
              <th>Gateway</th>
              <th>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={p._id} className="hover">
                <td>{i + 1}</td>
                <td>{p.packageName}</td>
                <td>৳{p.price}</td>
                <td className="text-xs">{p.transactionId}</td>
                <td>{p.method}</td>
                <td>{p.currency}</td>
                <td>{p.gateway}</td>
                <td>{new Date(p.paidAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
