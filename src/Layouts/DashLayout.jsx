import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet } from 'react-router';
import {
  FaHome, FaThList, FaUser, FaUsers, FaPlus, FaList, FaComments,
  FaUserShield, FaUtensils, FaCalendarAlt, FaWallet,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import useAdmin from '../hooks/useAdmin';
import Loading from '../Pages/Shared/Loading/Loading';
import Navbar from '../Pages/Shared/Navbar/Navbar';

const DashLayout = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [width, setWidth] = useState(window.innerWidth < 768 ? 70 : 240);
  const [dragging, setDragging] = useState(false);
  const sidebarRef = useRef(null);
  const [isAdmin, isLoading] = useAdmin();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
      setCollapsed(nowMobile);
      setWidth(nowMobile ? 70 : 240);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isMobile && dragging) {
        document.body.style.userSelect = 'none';
        let newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
        if (newWidth < 70) newWidth = 70;
        if (newWidth > 200) newWidth = 200;
        setWidth(newWidth);
        setCollapsed(newWidth < 100);
      }
    };
    const handleMouseUp = () => {
      setDragging(false);
      document.body.style.userSelect = 'auto';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };
  }, [dragging, isMobile]);

  const userNavItems = [
    { to: '/dashboard/my-profile', label: 'My Profile', icon: <FaUser /> },
    { to: '/dashboard/requested-meals', label: 'Requested Meals', icon: <FaThList /> },
    { to: '/dashboard/my-reviews', label: 'My Reviews', icon: <FaComments /> },
    { to: '/dashboard/payment-history', label: 'Payment History', icon: <FaWallet /> },
  ];

  const adminNavItems = [
    { to: '/dashboard/admin-profile', label: 'Admin Profile', icon: <FaUserShield /> },
    { to: '/dashboard/manage-users', label: 'Manage Users', icon: <FaUsers /> },
    { to: '/dashboard/add-meal', label: 'Add Meal', icon: <FaPlus /> },
    { to: '/dashboard/all-meals', label: 'All Meals', icon: <FaList /> },
    { to: '/dashboard/all-reviews', label: 'All Reviews', icon: <FaComments /> },
    { to: '/dashboard/serve-meals', label: 'Serve Meals', icon: <FaUtensils /> },
    { to: '/dashboard/upcoming-meals', label: 'Upcoming Meals', icon: <FaCalendarAlt /> },
  ];

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    ...(isAdmin ? adminNavItems : userNavItems),
  ];

  const navItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      key={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-md hover:bg-gray-400 transition-colors ${
          isActive ? 'bg-gray-500 font-semibold' : ''
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="max-w-screen-xl mx-auto flex min-h-screen">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className="relative bg-base-100 shadow-md transition-all duration-300 flex flex-col"
          style={{ width: `${width}px`, flexShrink: 0 }}
        >
          {/* Toggle */}
          <button
            onClick={() => {
              const newCollapsed = !collapsed;
              setCollapsed(newCollapsed);
              setWidth(newCollapsed ? 70 : 200);
            }}
            className="mb-4 btn btn-sm btn-ghost flex items-center justify-center w-full"
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          {/* User Info */}
          <div className="text-center mb-10 px-2">
            <img
              src={user?.photoURL || '/placeholder.png'}
              alt="Profile"
              className="w-12 h-12 rounded-full mx-auto border"
            />
            {!collapsed && (
              <>
                <p className="text-sm font-medium mt-1 truncate">{user?.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs mt-1 font-semibold">{isAdmin ? 'Admin' : 'User'}</p>
              </>
            )}
          </div>

          {/* Links */}
          <nav className="flex flex-col space-y-2 px-2">
            {navItems.map(navItem)}
          </nav>

          {/* Drag bar */}
          {!isMobile && (
            <div
              onMouseDown={() => setDragging(true)}
              className={`w-1 cursor-col-resize h-full absolute right-0 top-0 z-10 ${
                dragging ? 'bg-indigo-500' : 'hover:bg-indigo-300'
              }`}
            />
          )}
        </aside>

        {/* Main */}
        <main className="flex flex-col flex-1 min-h-screen transition-all duration-300 relative">
          <Navbar dashboard={true} />
          <section className="flex-1 overflow-y-auto p-6 w-full">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashLayout;
