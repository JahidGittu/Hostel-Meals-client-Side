import React from 'react';
import { Outlet } from 'react-router';
import loginImg from '../assets/logo.png'
import Logo from '../Pages/Shared/Logo/Logo';

const AuthLayout = () => {

    return (
        <div>
            <div className="bg-base-300 p-16 min-h-screen" >
                <div className=" overflow-hidden">

                    <div className='py-10'>
                        <Logo></Logo>
                    </div>

                    <div className="hero-content flex-col lg:flex-row-reverse ps-28">
                        <div className='flex-1'>
                            <img
                                src={loginImg}
                                className="max-w-sm rounded-lg shadow-2xl"
                            />
                        </div>
                        <div className='flex-1'>
                            <Outlet></Outlet>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthLayout;