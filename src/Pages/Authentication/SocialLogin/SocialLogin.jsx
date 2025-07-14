import React from 'react';
import { FcGoogle } from "react-icons/fc";
import useAuth from '../../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router';
import useAxios from '../../../hooks/useAxios';
import Swal from 'sweetalert2';

const SocialLogin = () => {
  const axiosInstance = useAxios();
  const { googleSignIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || null;

  const roleBasedDashboard = (role) => {
    if (role === 'admin') return '/dashboard/admin-profile';
    return '/dashboard/my-profile';
  };

  const isRouteAllowedForRole = (pathname, role) => {
    const adminRoutes = ['/dashboard/admin-profile', '/dashboard/manage-users'];
    const userRoutes = ['/dashboard/my-profile', '/dashboard/user-orders'];

    if (role === 'admin') {
      return !userRoutes.includes(pathname);
    } else {
      return !adminRoutes.includes(pathname);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      const user = res.user;

      // Save or update user in DB
      const userInfo = {
        name: user.displayName,
        photo: user.photoURL,
        email: user.email,
        role: 'user',
        badge: 'Bronze',
      };

      try {
        await axiosInstance.post('/users', userInfo); // Backend should handle duplication
      } catch (err) {
        console.error('User save error:', err);
      }

      // Check user role
      const roleRes = await axiosInstance.get(`/users/admin/${user.email}`);
      const isAdmin = roleRes.data?.isAdmin;
      const role = isAdmin ? 'admin' : 'user';

      Swal.fire({
        title: 'Login Successful!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      if (from && isRouteAllowedForRole(from, role)) {
        navigate(from, { replace: true });
      } else {
        navigate(roleBasedDashboard(role), { replace: true });
      }

    } catch (error) {
      console.error('Google sign-in error:', error);
      Swal.fire({
        title: 'Login Failed!',
        icon: 'error',
        text: error.message,
      });
    }
  };

  return (
    <div className='text-center'>
      <div className="divider">OR</div>
      <button
        onClick={handleGoogleSignIn}
        className="btn bg-white text-black border-[#e5e5e5]"
      >
        <FcGoogle size={24} /> Login with Google
      </button>
    </div>
  );
};

export default SocialLogin;
