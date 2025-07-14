import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import useSecureAxios from '../../../hooks/useSecureAxios';
import Swal from 'sweetalert2';
import SocialLogin from '../SocialLogin/SocialLogin';

const Login = () => {
  const { signInUser, loading, setLoading } = useAuth();
  const secureAxios = useSecureAxios();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const location = useLocation();
  const navigate = useNavigate();

  const from = location?.state?.from?.pathname || null;

  // Role-based default route
  const roleBasedDashboard = (role) => {
    if (role === 'admin') return '/dashboard/admin-profile';
    return '/dashboard/my-profile';
  };

  // Role access checker
  const isRouteAllowedForRole = (pathname, role) => {
    const adminRoutes = ['/dashboard/admin-profile', '/dashboard/manage-users'];
    const userRoutes = ['/dashboard/my-profile', '/dashboard/user-orders'];

    if (role === 'admin') {
      return !userRoutes.includes(pathname);
    } else {
      return !adminRoutes.includes(pathname);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await signInUser(data.email, data.password);
      const loggedInUser = res.user;

      // Get role
      const roleRes = await secureAxios.get(`/users/admin/${loggedInUser.email}`);
      const isAdmin = roleRes.data?.isAdmin;
      const role = isAdmin ? 'admin' : 'user';

      Swal.fire({
        title: 'Login Successful!',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
      });

      // Redirection logic
      if (from) {
        if (isRouteAllowedForRole(from, role)) {
          navigate(from, { replace: true });
        } else {
          navigate(roleBasedDashboard(role), { replace: true });
        }
      } else {
        navigate(roleBasedDashboard(role), { replace: true });
      }

    } catch (error) {
      console.error('Login error:', error.message);
      Swal.fire({
        title: 'Login Failed!',
        icon: 'error',
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-200 w-full max-w-sm shrink-0 shadow-2xl p-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="fieldset">
          <h1 className="text-4xl font-bold text-center pb-5">Welcome Back!</h1>

          {/* Email */}
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', { required: true })}
            className="input focus:outline-none focus:border-gray-600"
            placeholder="Email"
          />
          {errors.email?.type === 'required' && (
            <p className="text-red-500">Email Address is Required</p>
          )}

          {/* Password */}
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            {...register('password', { required: true, minLength: 6 })}
            className="input focus:outline-none focus:border-gray-600"
            placeholder="Password"
          />
          {errors.password?.type === 'required' && (
            <p className="text-red-500">Password is Required</p>
          )}
          {errors.password?.type === 'minLength' && (
            <p className="text-red-500">Password must be at least 6 characters</p>
          )}

          <div className="mt-1">
            <Link to="/forgot-password" className="link link-hover">Forgot password?</Link>
          </div>
        </fieldset>

        <button type="submit" className="btn btn-neutral mt-4 w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-xs py-5">
          Don't have an account?{' '}
          <Link to="/register" state={{ from }} className="text-red-400 hover:underline">
            Register
          </Link>
        </p>
      </form>

      {/* Social Login */}
      <SocialLogin />
    </div>
  );
};

export default Login;
