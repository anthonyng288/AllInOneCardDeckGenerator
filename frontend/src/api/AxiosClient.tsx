import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL
});

export default axiosClient;
