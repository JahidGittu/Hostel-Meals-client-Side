import React from 'react';
import { NavLink, Outlet } from 'react-router';
import Logo from '../Pages/Shared/Logo/Logo';

const DashLayout = () => {
    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

            {/* Drawer content */}
            <div className="drawer-content flex flex-col">
                {/* Mobile Top Navbar */}
                <div className="navbar bg-base-300 md:hidden">
                    <div className="flex-none">
                        <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </label>
                    </div>
                    <div className="flex-1 px-2">Dashboard</div>
                </div>

                {/* Main Page Content */}
                <div className="p-4">
                    <Outlet />
                </div>
            </div>

            {/* Drawer sidebar */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                <ul className="menu p-4 w-60 min-h-full bg-base-200 text-base-content">
                    {/* Sidebar content here */}
                    <Logo></Logo>


                    <li><NavLink to='/dashboard'>Home</NavLink></li>
                    <li><NavLink to='/dashboard/myPercels'>My Parcels</NavLink></li>
                    <li><a>Sidebar Item 2</a></li>
                </ul>
            </div>
        </div>
    );
};

export default DashLayout;
