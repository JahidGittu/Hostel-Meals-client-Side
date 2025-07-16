import React from 'react';
import { Navigate, useLocation } from 'react-router';
import useAdmin from '../hooks/useAdmin';
import Loading from '../Pages/Shared/Loading/Loading';
import useAuth from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
    const location = useLocation();

    const { user } = useAuth();

    const [isAdmin, isLoading] = useAdmin();

    if (isLoading) {
        return <Loading />;
    }

    if (!user) return <Navigate to="/login" />


    if (!isAdmin) {
        return <Navigate to="/dashboard" state={{ from: location.pathname }} replace />;
    }


    return children;
};

export default AdminRoute;
