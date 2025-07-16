import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../../hooks/useAuth';
import useSecureAxios from '../../../../hooks/useSecureAxios';

const PaymentHistory = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['my-payments', user?.email],
    queryFn: async () => {
      const res = await secureAxios.get(`/my-payments?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  if (payments.length === 0) {
    return (
      <div className="text-center py-10 text-lg text-gray-600">
        You have not made any payments yet.
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
