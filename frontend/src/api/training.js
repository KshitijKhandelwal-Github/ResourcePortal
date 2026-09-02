import client from './client';

export const getTraining = (employeeId) =>
  client.get(`/resources/${employeeId}/training`);

export const addTraining = (employeeId, data) =>
  client.post(`/resources/${employeeId}/training`, data);

export const updateTraining = (trainingId, data) =>
  client.put(`/training/${trainingId}`, data);
