import axios from 'axios';
import { useEffect } from 'react';
import useAuth from './useAuth';

const secureAxios = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
});

const useSecureAxios = () => {
    const { user } = useAuth();

    useEffect(() => {
        const interceptor = secureAxios.interceptors.request.use(
            (config) => {
                if (user?.accessToken) {
                    config.headers.Authorization = `Bearer ${user.accessToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 💥 clean up interceptor when component unmounts
        return () => {
            secureAxios.interceptors.request.eject(interceptor);

        };
    }, [user?.accessToken]);

    return secureAxios;
};

export default useSecureAxios;
