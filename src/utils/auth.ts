import axios from 'axios';

const API_BASE = '/api';

interface AuthResponse {
  message: string;
}

interface UserCredentials {
  username: string;
  password: string;
  email?: string;
  licenseKey?: string;
}

export const register = async (credentials: UserCredentials): Promise<AuthResponse> => {
  try {
    const payload = {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      license_key: credentials.licenseKey
    };
    const response = await axios.post(`${API_BASE}/auth/register`, payload, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const login = async (credentials: UserCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axios.post(`${API_BASE}/auth/logout`, {}, {
      withCredentials: true
    });
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

export const getProfile = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE}/user/profile`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch profile');
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await getProfile();
    return true;
  } catch {
    return false;
  }
};