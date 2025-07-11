import React from 'react';
import useAuth from '../hooks/useAuth';
import Loading from '../Pages/Shared/Loading/Loading';
import { Navigate, useLocation } from 'react-router';

const PrivateRoute = ({ children }) => {

    const { user, loading } = useAuth()

    const location = useLocation()
    console.log(location)

    const from = location.pathname

    if (loading) {
        return <Loading></Loading>
    }

    if (!user) {
        return <Navigate state={from} replace to='/login'></Navigate>
    }

    return children
};

export default PrivateRoute;