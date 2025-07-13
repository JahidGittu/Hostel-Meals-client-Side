import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import SocialLogin from '../SocialLogin/SocialLogin';
import Swal from 'sweetalert2';
import useSecureAxios from '../../../hooks/useSecureAxios';

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

  const from = location?.state || '/';

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await signInUser(data.email, data.password);
      const loggedInUser = res.user;

      // ✅ Check role from backend
      const roleRes = await secureAxios.get(`/users/admin/${loggedInUser.email}`);
      const isAdmin = roleRes.data?.isAdmin;

      Swal.fire({
        title: 'Login Successful!',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
      });

      // ✅ Redirect based on role
      if (isAdmin) {
        navigate('/dashboard/admin-profile', { replace: true });
      } else {
        navigate('/dashboard/my-profile', { replace: true });
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

          <label htmlFor="email" className="label">
            Email
          </label>
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

          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password', { minLength: 6, required: true })}
            className="input focus:outline-none focus:border-gray-600"
            placeholder="Password"
          />
          {errors.password?.type === 'required' && (
            <p className="text-red-500">Password is Required</p>
          )}
          {errors.password?.type === 'minLength' && (
            <p className="text-red-500">Password must be at least 6 characters or longer</p>
          )}

          <div>
            <Link to="/forgot-password" className="link link-hover">
              Forgot password?
            </Link>
          </div>
        </fieldset>

        <button type="submit" className="btn btn-neutral mt-4" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-xs py-5">
          Don't have an Account?{' '}
          <Link state={{ from }} to="/register" className="text-red-400 hover:underline">
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
