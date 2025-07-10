import React from 'react';

import { createBrowserRouter, } from "react-router";
import RootLayout from '../Layouts/RootLayout';
import Home from '../Pages/Home/Home';
import AuthLayout from '../Layouts/AuthLayout';
import Login from '../Pages/Authentication/Login/Login';
import Register from '../Pages/Authentication/Register/Register';
import PrivateRoutes from '../Routes/PrivateRoutes';
import DashLayout from '../Layouts/DashLayout';
import AdminRoute from '../Routes/AdminRoutes';
import Unauthorized from '../Pages/Dashboard/AdminDash/Unauthorized/Unauthorized';
import ManageUsers from '../Pages/Dashboard/AdminDash/ManageUsers/ManageUsers';
import AddMeal from '../Pages/Dashboard/AdminDash/AddMeal/AddMeal';


const Router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout></RootLayout>,
        errorElement: <p>Error</p>,
        children: [
            {
                index: true,
                element: <Home></Home>
            },
        ]
    },
    {
        path: '/',
        element: <AuthLayout></AuthLayout>,
        children: [
            {
                path: 'login',
                element: <Login></Login>
            },
            {
                path: 'register',
                element: <Register></Register>
            }
        ]
    },
    {
        path: '/dashboard',
        element: <PrivateRoutes> <DashLayout></DashLayout> </PrivateRoutes>,
        children: [
            {
                path: 'unauthorized',
                element: <Unauthorized />
            },
            {
                path: 'manage-users',
                element: <AdminRoute><ManageUsers></ManageUsers></AdminRoute>
            },
            {
                path: 'add-meal',
                element: <PrivateRoutes><AdminRoute><AddMeal></AddMeal></AdminRoute></PrivateRoutes>
            }

        ]
    }
])

export default Router;