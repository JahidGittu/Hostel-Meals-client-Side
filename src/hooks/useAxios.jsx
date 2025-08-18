import { useMemo } from "react";
import axios from "axios";

const useAxios = () => {
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: `https://hostel-management-system-server-nu.vercel.app`,
    });
  }, []);

  return axiosInstance;
};

export default useAxios;
