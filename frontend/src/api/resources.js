import client from './client';

export const getResources = (params = {}) =>
  client.get('/resources', { params });

export const getResource = (employeeId) =>
  client.get(`/resources/${employeeId}`);

export const createResource = (data) =>
  client.post('/resources', data);

export const updateResource = (employeeId, data) =>
  client.put(`/resources/${employeeId}`, data);

export const deleteResource = (employeeId) =>
  client.delete(`/resources/${employeeId}`);
