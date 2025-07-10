import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import SocialLogin from '../SocialLogin/SocialLogin';
import Swal from 'sweetalert2';

const Login = () => {
    const { signInUser, loading, setLoading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const location = useLocation();
    console.log(location)

    const from = location?.state || "/"

    const navigate = useNavigate();


    const onSubmit = (data) => {
        setLoading(true);
        signInUser(data.email, data.password)
            .then((res) => {
                console.log(res.user)
                setLoading(false);
                navigate(from, { replace: true });
                Swal.fire({
                    title: "Login Successful!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                });
            })
            .catch((error) => {
                setLoading(false);
                console.error("Login error:", error.message);
            });
    };

    return (
        <div className='card bg-base-200 w-full max-w-sm shrink-0 shadow-2xl p-8'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset className="fieldset">
                    <h1 className='text-4xl font-bold text-center pb-5'>Welcome Back!</h1>

                    <label htmlFor="email" className="label">Email</label>
                    <input
                        id="email"
                        type="email"
                        {...register('email', { required: true })}
                        className="input focus:outline-none focus:border-gray-600"
                        placeholder="Email"
                    />
                    {errors.email?.type === 'required' && (
                        <p className='text-red-500'>Email Address is Required</p>
                    )}

                    <label htmlFor="password" className="label">Password</label>
                    <input
                        id="password"
                        type="password"
                        {...register('password', { minLength: 6, required: true })}
                        className="input focus:outline-none focus:border-gray-600"
                        placeholder="Password"
                    />
                    {errors.password?.type === 'required' && (
                        <p className='text-red-500'>Password is Required</p>
                    )}
                    {errors.password?.type === 'minLength' && (
                        <p className='text-red-500'>Password must be at least 6 characters or longer</p>
                    )}

                    <div>
                        <Link to="/forgot-password" className="link link-hover">Forgot password?</Link>
                    </div>
                </fieldset>

                <button type="submit" className="btn btn-neutral mt-4" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                <p className='text-xs py-5'>
                    Don't have an Account?{' '}
                    <Link state={{from}} to="/register" className='text-red-400 hover:underline'>Register</Link>
                </p>
            </form>

            {/* Social Login */}

            <SocialLogin></SocialLogin>


        </div>
    );
};

export default Login;
