import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
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

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Sign in
      const res = await signInUser(data.email, data.password);
      const user = res.user;

      // Optional: Check if user exists and get role (just to trigger JWT flow if needed)
      await secureAxios.get(`/users/admin/${user.email}`);

      Swal.fire({
        title: 'Login Successful!',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
      });

      navigate('/dashboard', { replace: true });

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
          {errors.email && <p className="text-red-500">Email Address is Required</p>}

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
          <Link to="/register" className="text-red-400 hover:underline">
            Register
          </Link>
        </p>
      </form>

      <SocialLogin />
    </div>
  );
};

export default Login;
