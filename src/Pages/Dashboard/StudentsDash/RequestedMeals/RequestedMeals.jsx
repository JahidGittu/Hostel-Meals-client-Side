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

    // Fetch current user info (to get badge)
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => secureAxios.get('/current/user').then(res => res.data),
        enabled: !!user?.email,
    });

    // Fetch meal requests of the user
    const { data: requests = [], isLoading: requestsLoading } = useQuery({
        queryKey: ['mealRequests', user?.email],
        queryFn: () => secureAxios.get(`/meal-requests?userEmail=${user.email}`).then(res => res.data),
        enabled: !!user?.email,
    });

    if (userLoading || requestsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen -mt-24">
                <span className="loading loading-spinner loading-lg text-success"></span>
            </div>
        );
    }

    const badge = userData?.badge;

    // Bronze badge অথবা badge না থাকলে আপগ্রেড পেজে পাঠাও
    if (badge === 'Bronze' || !badge) {
        return (
            <div className="text-center py-20 max-w-md mx-auto space-y-6">
                <p className="text-xl font-semibold">
                    No requested meals here to see or add.
                    <br />
                    Please upgrade your account first.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/membership')}
                >
                    Upgrade Account
                </button>
            </div>
        );
    }

    // প্রিমিয়াম কিন্তু কোনো রিকোয়েস্ট নেই
    if (requests.length === 0) {
        return (
            <div className="text-center py-20 max-w-md mx-auto space-y-6">
                <p className="text-xl font-semibold">
                    You have not requested any meals yet.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/meals')}
                >
                    Request a Meal
                </button>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Your Requested Meals</h2>
            <table className="table w-full border rounded-lg">
                <thead>
                    <tr>
                        <th>Meal Title</th>
                        <th>Status</th>
                        <th>Requested At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <RequestedMealRow key={req._id} request={req} queryClient={queryClient} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const RequestedMealRow = ({ request, queryClient }) => {
    const [mealTitle, setMealTitle] = React.useState('Loading...');
    const secureAxios = useSecureAxios();

    React.useEffect(() => {
        if (!request.mealId) {
            setMealTitle('Unknown');
            return;
        }

        secureAxios.get(`/meals/${request.mealId}`)
            .then(res => setMealTitle(res.data.title || 'No Title'))
            .catch(() => setMealTitle('No Title'));
    }, [request.mealId, secureAxios]);

    return (
        <tr>
            <td>{mealTitle}</td>
            <td className="capitalize">{request.status}</td>
            <td>{new Date(request.requestedAt).toLocaleString()}</td>
            <td>
                <CancelRequestButton requestId={request._id} queryClient={queryClient} />
            </td>
        </tr>
    );
};

const CancelRequestButton = ({ requestId, queryClient }) => {
    const [loading, setLoading] = React.useState(false);
    const secureAxios = useSecureAxios();

    const mutation = useMutation({
        mutationFn: () => secureAxios.delete(`/meal-requests/${requestId}`),
        onSuccess: () => {
            Swal.fire('Deleted!', 'Your meal request has been cancelled.', 'success');
            queryClient.invalidateQueries({ queryKey: ['mealRequests'] });
        },
        onError: () => {
            Swal.fire('Failed!', 'Failed to cancel the request. Please try again.', 'error');
        },
        onSettled: () => {
            setLoading(false);
        }
    });

    const handleCancel = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to cancel this meal request!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
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
