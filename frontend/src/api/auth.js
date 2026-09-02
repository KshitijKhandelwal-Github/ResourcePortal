import client from './client';

export const loginUser = (username, password) =>
  client.post('/auth/login', { username, password });

export const registerUser = (data) =>
  client.post('/auth/register', data);
