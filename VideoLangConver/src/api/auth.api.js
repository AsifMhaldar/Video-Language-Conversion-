import client from './client';

export const registerUser = (payload) => client.post('/user/register', payload);

export const loginUser = (payload) => client.post('/user/login', payload);

export const logoutUser = () => client.post('/user/logout');
