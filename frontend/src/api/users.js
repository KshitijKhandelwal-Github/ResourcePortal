import client from './client';

export const getUsers = () => client.get('/users');

export const getCurrentUser = () => client.get('/users/me');

export const updateUser = (id, data) => client.put(`/users/${id}`, data);

export const deleteUser = (id) => client.delete(`/users/${id}`);
