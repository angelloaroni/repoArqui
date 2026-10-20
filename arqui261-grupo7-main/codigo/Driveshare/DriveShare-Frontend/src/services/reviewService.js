import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api';

const base = `${API_URL}/reviews`;

export const getReviews = async () => {
  const response = await axios.get(base);
  return response.data;
};

export const getVehicleReviews = async (vehicleId) => {
  const response = await axios.get(`${base}/vehicle/${vehicleId}`);
  return response.data;
};

export const getUserReviews = async () => {
  const response = await axios.get(`${base}/user`);
  return response.data;
};

export const createReview = async (payload) => {
  const response = await axios.post(base, payload);
  return response.data;
};

export const updateReview = async (id, payload) => {
  const response = await axios.put(`${base}/${id}`, payload);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await axios.delete(`${base}/${id}`);
  return response.data;
};
