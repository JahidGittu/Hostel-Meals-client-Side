import axios from 'axios';
import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';

const secureAxios = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

const useSecureAxios = () => {
  useEffect(() => {
    const interceptor = secureAxios.interceptors.request.use(
      async (config) => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const token = await user.getIdToken(); // ✅ actual token
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      secureAxios.interceptors.request.eject(interceptor);
    };
  }, []);

  return secureAxios;
};

export default useSecureAxios;
