import React, { createContext, useState, useContext } from 'react';
import { registerUser, loginUser, logoutUser } from '../api/auth.api';

const AuthContext = createContext(null);

const loadStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const extractErrorMessage = (error) => {
  if (error.response) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    return data?.message || `Request failed (${error.response.status})`;
  }
  return error.message || 'Something went wrong';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadStoredUser);
  const loading = false;

  const persistUser = (userData) => {
    const userInfo = {
      id: userData.id || userData._id,
      name: `${userData.firstname} ${userData.lastname}`.trim(),
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.emailId,
      role: userData.role
    };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const register = async ({ firstname, lastname, email, password }) => {
    try {
      const res = await registerUser({
        firstname,
        lastname,
        emailId: email,
        password
      });

      const registeredUser = res.data?.data?.user;
      const userInfo = persistUser(registeredUser);
      return { success: true, data: userInfo };
    } catch (error) {
      return { success: false, error: extractErrorMessage(error) };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const res = await loginUser({ emailId: email, password });

      const loggedInUser = res.data?.data?.user;
      const userInfo = persistUser(loggedInUser);
      return { success: true, data: userInfo };
    } catch (error) {
      return { success: false, error: extractErrorMessage(error) };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout API errors, clear local state anyway
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
