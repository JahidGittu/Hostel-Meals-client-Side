import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useSecureAxios from './useSecureAxios';

const useAdmin = () => {
  const { user } = useAuth();
  const secureAxios = useSecureAxios();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['isAdmin', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await secureAxios.get(`/users/admin/${user.email}`);
      return res.data?.isAdmin;
    }
  });

  return [isAdmin, isLoading];
};

export default useAdmin;
