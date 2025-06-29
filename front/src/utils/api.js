import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.access_token) {
    req.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return req;
});

export default API;