import client from './client';

export const getSkills = () => client.get('/skills');

export const createSkill = (data) => client.post('/skills', data);

export const updateSkill = (id, data) => client.put(`/skills/${id}`, data);

export const deleteSkill = (id) => client.delete(`/skills/${id}`);
