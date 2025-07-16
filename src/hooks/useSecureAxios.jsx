import axios from 'axios';
import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';

const secureAxios = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

const useSecureAxios = () => {
  useEffect(() => {
    const auth = getAuth();

    const interceptor = secureAxios.interceptors.request.use(
      async (config) => {
        const user = auth.currentUser;

        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      secureAxios.interceptors.request.eject(interceptor);
    };
  }, []);

  return secureAxios;
};

export default useSecureAxios;
