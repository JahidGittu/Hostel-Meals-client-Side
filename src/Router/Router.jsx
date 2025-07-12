import React from 'react';

import { createBrowserRouter, } from "react-router";
import RootLayout from '../Layouts/RootLayout';
import Home from '../Pages/Home/Home';
import AuthLayout from '../Layouts/AuthLayout';
import Login from '../Pages/Authentication/Login/Login';
import Register from '../Pages/Authentication/Register/Register';
import DashLayout from '../Layouts/DashLayout';
import Unauthorized from '../Pages/Dashboard/AdminDash/Unauthorized/Unauthorized';
import ManageUsers from '../Pages/Dashboard/AdminDash/ManageUsers/ManageUsers';
import AddMeal from '../Pages/Dashboard/AdminDash/AddMeal/AddMeal';
import AllMeals from '../Pages/Dashboard/AdminDash/AllMeals/AllMeals';
import PrivateRoute from '../Routes/PrivateRoute';
import AdminRoute from '../Routes/AdminRoute';
import UpcomingMeals from '../Pages/Dashboard/AdminDash/UpcomingMeal/UpcomingMeals';
import Meals from '../Pages/Meals/Meals';
import MealDetails from '../Pages/Meals/MealDetails/MealDetails';
import UpcomingMealsPage from '../Pages/UpcomingMeals/UpcomingMealsPage';


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
            {
                path: 'meals',
                element: <Meals></Meals>
            },
            {
                path: 'meal-details/:id',
                element: <PrivateRoute><MealDetails></MealDetails></PrivateRoute>
            },
            {
                path: 'upcoming-meals',
                element: <UpcomingMealsPage></UpcomingMealsPage>
            }
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
        element: <PrivateRoute> <DashLayout></DashLayout> </PrivateRoute>,
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
                element: <PrivateRoute><AdminRoute><AddMeal></AddMeal></AdminRoute></PrivateRoute>
            },
            {
                path: 'all-meals',
                element: <PrivateRoute><AdminRoute> <AllMeals></AllMeals> </AdminRoute></PrivateRoute>
            },
            {
                path: 'upcoming-meals',
                element: <PrivateRoute><AdminRoute>  <UpcomingMeals></UpcomingMeals> </AdminRoute></PrivateRoute>
            }

        ]
    }
])

export default Router;