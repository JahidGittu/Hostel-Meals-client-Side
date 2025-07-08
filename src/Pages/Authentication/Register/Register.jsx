import React from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { Link } from 'react-router';
import SocialLogin from '../SocialLogin/SocialLogin';
import Swal from 'sweetalert2';

const Register = () => {
    const { createUser, setUser, setLoading, updateUser, loading } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        setLoading(true);
        createUser(data.email, data.password)
            .then(res => {
                updateUser({ displayName: data.name, photoURL: data.photo })
                    .then(() => {
                        const updatedUser = { ...res.user, displayName: data.name, photoURL: data.photo };
                        setUser(updatedUser);
                        setLoading(false);

                        Swal.fire({
                            title: "Registration Successful!",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    })
                    .catch(error => {
                        setLoading(false);
                        Swal.fire({
                            title: "Profile update failed!",
                            icon: "error",
                            text: error.message,
                        });
                    });
            })
            .catch(error => {
                setLoading(false);
                Swal.fire({
                    title: "Registration Failed!",
                    icon: "error",
                    text: error.message,
                });
            });
    };


    return (
        <div className='card bg-base-200 w-full max-w-sm shrink-0 shadow-2xl p-8'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset className="fieldset">
                    <h1 className='text-4xl font-bold text-center pb-5'>Register Now!</h1>

                    {/* Name Field */}
                    <label className="label">Your Name</label>
                    <input
                        type="text"
                        {...register('name', { required: true })}
                        className="input focus:outline-none focus:border-gray-600"
                        placeholder="Your Name"
                    />
                    {errors.name && <p className='text-red-500'>Name is required</p>}

                    {/* Photo URL Field */}
                    <label className="label">Your Photo</label>
                    <input
                        type="url"
                        {...register('photo', { required: true })}
                        className="input focus:outline-none focus:border-gray-600"
                        placeholder="Photo URL"
                    />
                    {errors.photo && <p className='text-red-500'>Photo URL is required</p>}

                    {/* Email Field */}
                    <label className="label">Email</label>
                    <input
                        type="email"
                        {...register('email', { required: true })}
                        className="input focus:outline-none focus:border-gray-600"
                        placeholder="Email"
                    />
                    {errors.email && <p className='text-red-500'>Email is required</p>}

                    {/* Password Field */}
                    <label className="label">Password</label>
                    <input
                        type="password"
                        {...register('password', { required: true, minLength: 6 })}
                        className="input focus:outline-none focus:border-gray-600"
                        placeholder="Password"
                    />
                    {errors.password?.type === 'required' && <p className='text-red-500'>Password is required</p>}
                    {errors.password?.type === 'minLength' && <p className='text-red-500'>Password must be at least 6 characters</p>}

                    <div><a className="link link-hover">Forgot password?</a></div>
                </fieldset>

                <button type="submit" className="btn btn-neutral mt-4" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>


                <p className='text-xs py-5'>
                    Already have an account?{" "}
                    <Link className='text-red-400 hover:underline' to='/login'>Login</Link>
                </p>
            </form>

            {/* Social Login */}
            <SocialLogin />
        </div>
    );
};

export default Register;
