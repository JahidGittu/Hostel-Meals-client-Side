import React from 'react';
import { FcGoogle } from "react-icons/fc";
import useAuth from '../../../hooks/useAuth';
import { useNavigate } from 'react-router';
import useAxios from '../../../hooks/useAxios';
import Swal from 'sweetalert2';

const SocialLogin = () => {
  const axios = useAxios();
  const { googleSignIn } = useAuth();
  const navigate = useNavigate();

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

      // Save user to DB (duplicate-safe on backend)
      try {
        await axios.post('/users', userInfo);
      } catch (err) {
        console.error('User save error:', err);
      }

      Swal.fire({
        title: 'Login Successful!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      navigate('/dashboard', { replace: true });

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
