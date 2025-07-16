import React from 'react';
import useAdmin from '../../../hooks/useAdmin';
import Loading from '../../Shared/Loading/Loading';
import AdminDash from '../AdminDash/AdminDash';
import StudentDash from '../StudentsDash/StudentDash';


const DashboardHome = () => {
  const [isAdmin, isLoading] = useAdmin();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center">
      {isAdmin ? <AdminDash /> : <StudentDash />}
    </div>
  );
};

export default DashboardHome;
