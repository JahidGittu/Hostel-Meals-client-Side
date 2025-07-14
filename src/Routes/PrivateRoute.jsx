import React from 'react';
import useAuth from '../hooks/useAuth';
import Loading from '../Pages/Shared/Loading/Loading';
import { Navigate, useLocation } from 'react-router';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }} // ✅ আগের পেজ স্টোর করো এখানে
        replace
      />
    );
  }

  return children;
};

export default PrivateRoute;
