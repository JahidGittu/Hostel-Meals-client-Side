import React from 'react';
import { FcGoogle } from "react-icons/fc";
import useAuth from '../../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router';
import useAxios from '../../../hooks/useAxios';

const SocialLogin = () => {

    const axiosInstance = useAxios();

    const { googleSignIn } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const from = location?.state || "/";

    const handleGoogleSignIn = () => {
        googleSignIn()
            .then(async (res) => {
                const user = res.user;
                console.log(user);

                // Optional: Save user info to your DB
                const userInfo = {
                    name: user.displayName,
                    photo: user.photoURL,
                    email: user.email,
                    role: 'user',
                    badge: 'Bronze',
                };

                try {
                    const userRes = await axiosInstance.post('/users', userInfo);
                    console.log(userRes.data);
                } catch (error) {
                    console.error("Error saving user info:", error);
                }

                navigate(from);
            })
            .catch(error => {
                console.error(error);
            });
    }

    return (
        <div className='text-center'>
            <div className="divider">OR</div>
            {/* Google Login Button */}
            <button onClick={handleGoogleSignIn} className="btn bg-white text-black border-[#e5e5e5]">
                <FcGoogle size={24} />  Login with Google
            </button>
        </div>
    );
};

export default SocialLogin;
