import client from './client';

export const getDashboardSummary = (params = {}) =>
  client.get('/dashboard/summary', { params });

export const getDashboardSkills = (params = {}) =>
  client.get('/dashboard/skills', { params });

export const getDashboardLocation = (params = {}) =>
  client.get('/dashboard/location', { params });

export const getDashboardExperience = (params = {}) =>
  client.get('/dashboard/experience', { params });

export const getDashboardTraining = (params = {}) =>
  client.get('/dashboard/training', { params });

export const getDashboardAvailability = (params = {}) =>
  client.get('/dashboard/availability', { params });
