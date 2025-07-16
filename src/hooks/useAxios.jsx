import { useMemo } from "react";
import axios from "axios";

const useAxios = () => {
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: `http://localhost:5000`,
    });
  }, []);

  return axiosInstance;
};

export default useAxios;
