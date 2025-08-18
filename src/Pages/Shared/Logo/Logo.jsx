import React from 'react';
import logo from '../../../assets/logo5.png'
import { Link } from 'react-router';

const Logo = () => {
    return (
        <Link to="/">
            <div className='flex items-center justify-center gap-1'>
                <img className='w-16' src={logo} alt="" />
                {/* <p className='text-2xl font-extrabold'>Hostel Meals</p> */}
            </div>
        </Link>
    );
};

export default Logo;