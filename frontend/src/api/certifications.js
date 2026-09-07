import client from './client';

export const getCertifications = (employeeId) =>
  client.get(`/resources/${employeeId}/certifications`);

export const addCertification = (employeeId, data) =>
  client.post(`/resources/${employeeId}/certifications`, data);

export const updateCertification = (certId, data) =>
  client.put(`/certifications/${certId}`, data);
