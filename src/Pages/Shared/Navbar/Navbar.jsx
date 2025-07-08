import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { FaBell } from 'react-icons/fa';
import Logo from '../Logo/Logo';
import useAuth from '../../../hooks/useAuth';

const Navbar = () => {
    const { user, logoutUser } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);

    // Scroll Detection
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logoutUser()
            .then(() => console.log('User logged out'))
            .catch(err => console.error(err));
    };

    const navItems = (
        <>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/meals">Meals</NavLink></li>
            <li><NavLink to="/upcoming-meals">Upcoming Meals</NavLink></li>
        </>
    );

    return (
        <div className="fixed top-0 left-0 w-full z-[999] transition-all duration-300">
            <div className="max-w-7xl mx-auto">
                <div
                    className={`navbar px-4 text-white transition-all duration-300 
                        ${isScrolled ? 'bg-gray/10 shadow backdrop-blur-md' : 'bg-transparent'}
                    `}
                >
                    {/* Left: Logo */}
                    <div className="navbar-start">
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                            <Logo />
                        </Link>
                    </div>

                    {/* Center: Menu */}
                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal gap-5">{navItems}</ul>
                    </div>

                    {/* Right: Notification + User/Profile */}
                    <div className="navbar-end gap-3">
                        <button className="btn btn-ghost btn-circle">
                            <FaBell className="text-xl" />
                        </button>

                        {user ? (
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                    <div className="w-10 rounded-full">
                                        <img src={user.photoURL} alt="User Profile" />
                                    </div>
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 text-black rounded-box w-52"
                                >
                                    <li><p className="font-semibold text-center">{user.displayName}</p></li>
                                    <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                                    <li><button onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary">Join Us</Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
