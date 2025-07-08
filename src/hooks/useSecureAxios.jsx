import axios from 'axios';
import React from 'react';


const secureAxios = axios.create({
    baseURL: `http://localhost:5000`,
});

const useSecureAxios = () => {
    return secureAxios
};

export default useSecureAxios;