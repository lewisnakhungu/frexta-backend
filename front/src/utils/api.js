import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.access_token) {
    req.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return req;
});

export default API;