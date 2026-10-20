// src/services/reservationService.js
import axios from 'axios';

const API_URL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000/api';

const base = `${API_URL}/reservations`;

export const createReservation = async (payload) => {
    const response = await axios.post(base, payload);
    return response.data;
};

export const getUserReservations = async () => {
    const response = await axios.get(`${base}/user`);
    return response.data;
};

export const getOwnerReservations = async () => {
    const response = await axios.get(`${base}/owner`);
    return response.data;
};

export const getReservationById = async (id) => {
    const response = await axios.get(`${base}/${id}`);
    return response.data;
};

export const checkAvailability = async (vehicleId, start, end) => {
    const response = await axios.get(
        `${base}/availability/${vehicleId}`,
        { params: { start, end } }
    );
    return response.data;
};

export const getUnavailableVehicles = async (start, end) => {
    const response = await axios.get(`${base}/unavailable`, {
        params: { start, end }
    });
    return response.data;
};

export const updateReservation = async (id, payload) => {
    const response = await axios.put(`${base}/${id}`, payload);
    return response.data;
};

export const cancelReservation = async (id) => {
    const response = await axios.put(`${base}/${id}/cancel`);
    return response.data;
};

export const confirmReservation = async (id) => {
    const response = await axios.put(`${base}/${id}/confirm`);
    return response.data;
};

export const acceptReservation = async (id) => {
    const response = await axios.put(`${base}/${id}/accept`);
    return response.data;
};

export const rejectReservation = async (id) => {
    const response = await axios.put(`${base}/${id}/reject`);
    return response.data;
};

export const closeReservation = async (id) => {
    const response = await axios.put(`${base}/${id}/close`);
    return response.data;
};
