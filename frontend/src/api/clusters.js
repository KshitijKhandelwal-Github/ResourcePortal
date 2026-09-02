import client from './client';

export const getClusters = () => client.get('/clusters');

export const createCluster = (data) => client.post('/clusters', data);

export const updateCluster = (id, data) => client.put(`/clusters/${id}`, data);

export const deleteCluster = (id) => client.delete(`/clusters/${id}`);
