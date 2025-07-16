import React from 'react';
import { useNavigate } from 'react-router';
import useSecureAxios from '../../../../hooks/useSecureAxios';
import useAuth from '../../../../hooks/useAuth';
import Swal from 'sweetalert2';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const RequestedMeals = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch current user info
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => secureAxios.get('/current/user').then(res => res.data),
    enabled: !!user?.email,
  });

  // Fetch posted meal requests
  const { data: postedRequests = [], isLoading: postedLoading } = useQuery({
    queryKey: ['postedMealRequests', user?.email],
    queryFn: () =>
      secureAxios.get(`/meal-requests?userEmail=${user.email}`).then(res => res.data),
    enabled: !!user?.email,
  });

  // Fetch upcoming meal requests
  const { data: upcomingRequests = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ['upcomingMealRequests', user?.email],
    queryFn: () =>
      secureAxios.get(`/upcoming-meal-requests?userEmail=${user.email}`).then(res => res.data),
    enabled: !!user?.email,
  });

  const isLoading = userLoading || postedLoading || upcomingLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-24">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );
  }

  const badge = userData?.badge;

  // Bronze badge or no badge
  if (badge === 'Bronze' || !badge) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-6">
        <p className="text-xl font-semibold">
          No requested meals here to see or add.
          <br />
          Please upgrade your account first.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/membership')}>
          Upgrade Account
        </button>
      </div>
    );
  }

  // Combine posted + upcoming
  const allRequests = [
    ...postedRequests.map(r => ({ ...r, type: 'posted-meal' })),
    ...upcomingRequests.map(r => ({ ...r, type: 'upcoming-meal' })),
  ].sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  if (allRequests.length === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-6">
        <p className="text-xl font-semibold">You have not requested any meals yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/meals')}>
          Request a Meal
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Requested Meals</h2>

      <div className="overflow-x-auto rounded-t-xs rounded-b-2xl border border-gray-300 shadow">
        <table className="table w-full">
          <thead className="bg-gray-400 text-gray-700 text-sm">
            <tr>
              <th className="text-center border-b">#</th>
              <th className="text-center border-b">Meal Title</th>
              <th className="text-center border-b">Type</th>
              <th className="text-center border-b">Status</th>
              <th className="text-center border-b">Requested At</th>
              <th className="text-center border-b">Action</th>
            </tr>
          </thead>

          <tbody>
            {allRequests.map((req, index) => (
              <RequestedMealRow
                key={req._id}
                request={req}
                type={req.type}
                queryClient={queryClient}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RequestedMealRow = ({ request, type, queryClient, index }) => {
  const [mealTitle, setMealTitle] = React.useState('Loading...');
  const secureAxios = useSecureAxios();

  React.useEffect(() => {
    if (!request.mealId) return setMealTitle('Unknown');

    const endpoint = type === 'upcoming-meal' ? '/upcoming-meals' : '/meals';

    secureAxios
      .get(`${endpoint}/${request.mealId}`)
      .then(res => setMealTitle(res.data.title || 'No Title'))
      .catch(() => setMealTitle('No Title'));
  }, [request.mealId, secureAxios, type]);

  return (
    <tr>
      <th className="text-center">{index + 1}</th>
      <td className="text-center">
        <span className="max-w-[200px] truncate block">{mealTitle}</span>
      </td>
      <td className="capitalize text-center">{type.replace('-', ' ')}</td>
      <td className="text-center">
        <span
          className={`badge badge-sm ${request.status === 'approved'
            ? 'badge-success'
            : request.status === 'rejected'
            ? 'badge-error'
            : 'badge-warning'
          }`}
        >
          {request.status}
        </span>
      </td>
      <td className="text-center">{new Date(request.requestedAt).toLocaleString()}</td>
      <td className="text-center">
        <div className="tooltip" data-tip="Click To Remove">
          <CancelRequestButton
            requestId={request._id}
            type={type}
            queryClient={queryClient}
          />
        </div>
      </td>
    </tr>
  );
};

const CancelRequestButton = ({ requestId, type, queryClient }) => {
  const [loading, setLoading] = React.useState(false);
  const secureAxios = useSecureAxios();

  const mutation = useMutation({
    mutationFn: () =>
      secureAxios.delete(
        type === 'upcoming-meal'
          ? `/upcoming-meal-requests/${requestId}`
          : `/meal-requests/${requestId}`
      ),
    onSuccess: () => {
      Swal.fire('Deleted!', 'Your meal request has been cancelled.', 'success');
      queryClient.invalidateQueries({ queryKey: ['postedMealRequests'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingMealRequests'] });
    },
    onError: () => {
      Swal.fire('Failed!', 'Failed to cancel the request. Please try again.', 'error');
    },
    onSettled: () => setLoading(false),
  });

  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to cancel this meal request!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then(result => {
      if (result.isConfirmed) {
        setLoading(true);
        mutation.mutate();
      }
    });
  };

  return (
    <button
      className="btn btn-error btn-sm"
      onClick={handleCancel}
      disabled={loading || mutation.isLoading}
    >
      {loading || mutation.isLoading ? 'Cancelling...' : 'Cancel'}
    </button>
  );
};

export default RequestedMeals;
