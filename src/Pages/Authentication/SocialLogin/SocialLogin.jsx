import React from 'react';
import { FcGoogle } from "react-icons/fc";
import useAuth from '../../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router';
import useAxios from '../../../hooks/useAxios';
import useSecureAxios from '../../../hooks/useSecureAxios';
import Swal from 'sweetalert2';

const SocialLogin = () => {
  const axios = useAxios();           // Public Axios (no token)
  const secureAxios = useSecureAxios(); // Secure Axios (adds token)
  const { googleSignIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || null;

  const roleBasedDashboard = (role) => {
    return role === 'admin' ? '/dashboard/admin-profile' : '/dashboard/my-profile';
  };

  const isRouteAllowedForRole = (pathname, role) => {
    const adminRoutes = ['/dashboard/admin-profile', '/dashboard/manage-users'];
    const userRoutes = ['/dashboard/my-profile', '/dashboard/user-orders'];

    return role === 'admin'
      ? !userRoutes.includes(pathname)
      : !adminRoutes.includes(pathname);
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      const user = res.user;

      const userInfo = {
        name: user.displayName,
        photo: user.photoURL,
        email: user.email,
        role: 'user',
        badge: 'Bronze',
      };

      // Save user to DB (duplicate handling on backend)
      try {
        await axios.post('/users', userInfo);
      } catch (err) {
        console.error('User save error:', err);
      }

      // Get role using secureAxios with auto-token
      const roleRes = await secureAxios.get(`/users/admin/${user.email}`);
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
        text: error.message || 'Something went wrong!',
      });
    }
  };

  return (
    <div className='text-center'>
      <div className="divider">OR</div>
      <button
        onClick={handleGoogleSignIn}
        className="btn bg-white text-black border-[#e5e5e5] flex items-center justify-center gap-2"
      >
        <FcGoogle size={24} /> Login with Google
      </button>
    </div>
  );
};

export default SocialLogin;
