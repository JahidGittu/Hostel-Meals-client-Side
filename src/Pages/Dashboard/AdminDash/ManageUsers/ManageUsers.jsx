import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useSecureAxios from '../../../../hooks/useSecureAxios';
import useAuth from '../../../../hooks/useAuth';

const ManageUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const axiosSecure = useSecureAxios();
  const { user } = useAuth();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/search?query=${searchQuery}`);
      return res.data;
    },
    enabled: !!searchQuery
  });

  const handleRoleUpdate = async (id, makeAdmin) => {
    const actionText = makeAdmin ? 'promote to Admin' : 'remove from Admin';
    const confirmButtonText = makeAdmin ? 'Yes, make Admin' : 'Yes, remove Admin';
    const successMessage = makeAdmin ? 'User has been promoted to Admin.' : 'User has been removed from Admin role.';

    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${actionText}. This action can be reversed later.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: makeAdmin ? '#3085d6' : '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: confirmButtonText
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.patch(`/users/role/${id}`, {
          makeAdmin,
          requesterEmail: user?.email
        });

        if (res.data.success) {
          Swal.fire({
            title: 'Success',
            text: successMessage,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
          refetch();
        }
      } catch (err) {
        const serverMessage = err.response?.data?.message || 'Error updating role';
        Swal.fire({
          title: 'Permission Denied',
          text: serverMessage,
          icon: 'error',
        });
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className='flex flex-col justify-center items-center'>
        <h2 className="text-2xl text-center font-bold mb-4">🔍 Search Users by Email or Name</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type name or email"
          className="input input-bordered w-full max-w-md mb-6"
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500 text-center">No users found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subscription</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name || 'N/A'}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.subscription ? 'badge-success' : 'badge-outline'}`}>
                      {u.subscription ? 'Subscribed' : 'Free'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-success' : 'badge-neutral'}`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td>
                    {u.role === 'admin' ? (
                      <button
                        onClick={() => handleRoleUpdate(u._id, false)}
                        className="btn btn-sm btn-error"
                      >
                        Remove Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleUpdate(u._id, true)}
                        className="btn btn-sm btn-success"
                      >
                        Make Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
