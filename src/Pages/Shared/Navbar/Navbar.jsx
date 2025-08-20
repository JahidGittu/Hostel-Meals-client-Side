import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { FaBell, FaBars, FaMoon, FaSun } from "react-icons/fa";
import Swal from "sweetalert2";
import Logo from "../Logo/Logo";
import useAuth from "../../../hooks/useAuth";
import useAdmin from "../../../hooks/useAdmin";

const Navbar = ({ dashboard = false }) => {
  const { user, logoutUser, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [isAdmin] = useAdmin();

  const location = useLocation();

  const isHomePage = location.pathname === "/";

  // scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "mytheme-dark");
    } else {
      setDarkMode(false);
      document.documentElement.setAttribute("data-theme", "mytheme");
    }
  }, []);

  // logout with SweetAlert
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        logoutUser()
          .then(() =>
            Swal.fire("Logged Out!", "You have been logged out.", "success")
          )
          .catch((err) => console.error(err));
      }
    });
  };

  // dark / light toggle
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.setAttribute(
      "data-theme",
      newTheme ? "mytheme-dark" : "mytheme"
    );
    localStorage.setItem("theme", newTheme ? "dark" : "light"); // save to localStorage
  };

  const navItems = (
    <>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      <li>
        <NavLink to="/meals">Meals</NavLink>
      </li>
      <li>
        <NavLink to="/upcoming-meals">Upcoming Meals</NavLink>
      </li>
    </>
  );

  const navbarWrapperClass = dashboard
    ? "sticky top-0 left-0 w-full z-[999] bg-base-300 shadow"
    : "fixed top-0 left-0 w-full z-[999]";

  return (
    <div className={`${navbarWrapperClass}`}>
      <div>
        <div
          className={`navbar px-4 transition-all duration-300 ${
            isScrolled
              ? "bg-base-300 shadow backdrop-blur-md text-base-content"
              : isHomePage
              ? "bg-transparent text-white"
              : "bg-base-300 text-base-content"
          }`}
        >
          {/* ----------- Mobile Navbar (sm) ----------- */}
          <div className="flex w-full items-center justify-between md:hidden">
            {/* Hamburger */}
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
              >
                <FaBars className="text-xl" />
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-300 text-base-content rounded-box w-32"
              >
                {navItems}
              </ul>
            </div>

            {/* Logo (only image) */}
            <Logo onlyImg className="w-10 h-10" />

            {/* Right side icons */}
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-circle"
                onClick={toggleTheme}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              <button className="btn btn-ghost btn-circle">
                <FaBell className="text-xl" />
              </button>
              {loading ? (
                <span className="loading loading-dots loading-md"></span>
              ) : user ? (
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div className="w-10 rounded-full">
                      <img src={user.photoURL} alt="User Profile" />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-300 text-base-content rounded-box w-52"
                  >
                    <li>
                      <NavLink
                        to={isAdmin ? "/dashboard/admin-profile" : "/dashboard/my-profile"}
                        className="font-semibold text-center"
                      >
                        {user.displayName}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/dashboard">Dashboard</NavLink>
                    </li>
                    <li>
                      <button onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Join Us
                </Link>
              )}
            </div>
          </div>

          {/* ----------- Medium Navbar (md) ----------- */}
          <div className="hidden md:flex lg:hidden w-full items-center justify-between">
            {/* Left: Logo without text */}
            <Logo onlyImg className="w-10 h-10" />

            {/* Center: Nav Items */}
            <ul className="menu menu-horizontal gap-5">{navItems}</ul>

            {/* Right side icons */}
            <div className="flex items-center gap-3">
              <button
                className="btn btn-ghost btn-circle"
                onClick={toggleTheme}>
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              <button className="btn btn-ghost btn-circle">
                <FaBell className="text-xl" />
              </button>
              {user ? (
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div className="w-10 rounded-full">
                      <img src={user.photoURL} alt="User Profile" />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-300 text-shadow-base-content rounded-box w-52">
                    <li> 
                      <NavLink
                        to={isAdmin ? "/dashboard/admin-profile" : "/dashboard/my-profile"}
                        className="font-semibold text-center"
                      >
                        {user.displayName}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/dashboard">Dashboard</NavLink>
                    </li>
                    <li>
                      <button onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Join Us
                </Link>
              )}
            </div>
          </div>

          {/* ----------- Large Navbar (lg & up) ----------- */}
          <div className="hidden lg:flex w-full items-center justify-between">
            {/* Left: Logo + text */}
            <div className="flex items-center gap-2">
              <Logo onlyImg className="w-10 h-10" />
              <span className="font-bold text-xl">Hostel Meals</span>
            </div>

            {/* Center: Nav Items */}
            <ul className="menu menu-horizontal gap-5">{navItems}</ul>

            {/* Right side icons */}
            <div className="flex items-center gap-3">
              <button
                className="btn btn-ghost btn-circle"
                onClick={toggleTheme}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              <button className="btn btn-ghost btn-circle">
                <FaBell className="text-xl" />
              </button>
              {user ? (
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div className="w-10 rounded-full">
                      <img src={user.photoURL} alt="User Profile" />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-300 text-base-content rounded-box w-52"
                  >
                    <li>
                     <NavLink
                        to={isAdmin ? "/dashboard/admin-profile" : "/dashboard/my-profile"}
                        className="font-semibold text-center"
                      >
                        {user.displayName}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/dashboard">Dashboard</NavLink>
                    </li>
                    <li>
                      <button onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Join Us
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
