import axios from "axios";
import CryptoJS from "crypto-js";

const API_BASE = "/api";
const SECRET_KEY = "your-secure-key"; 

interface AuthResponse {
  message: string;
}

interface UserCredentials {
  username: string;
  password: string;
  email?: string;
  licenseKey?: string;
}

interface LicenseKeyOnly {
  licenseKey?: string;
}

// Encrypt Username Before Storing in SessionStorage
const encryptUsername = (username: string): string => {
  return CryptoJS.AES.encrypt(username, SECRET_KEY).toString();
};

// Decrypt Username When Retrieving
export const decryptUsername = (encryptedUsername: string | null): string | null => {
  if (!encryptedUsername) return null;
  const bytes = CryptoJS.AES.decrypt(encryptedUsername, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Store Encrypted Username in SessionStorage
export const storeUsername = (username: string) => {
  const encryptedUsername = encryptUsername(username);
  sessionStorage.setItem("currentUser", encryptedUsername);
};

// Retrieve & Decrypt Username from SessionStorage
export const getCurrentUser = (): string | null => {
  const encryptedUsername = sessionStorage.getItem("currentUser");
  return decryptUsername(encryptedUsername);
};

// Modify Register Function
export const register = async (credentials: UserCredentials): Promise<AuthResponse> => {
  try {
    const payload = {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      license_key: credentials.licenseKey,
    };
    const response = await axios.post(`${API_BASE}/auth/register`, payload, {
      withCredentials: true,
    });

    storeUsername(credentials.username); // Store encrypted username after successful registration

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Registration failed - please try again");
  }
};

// Modify Login Function
export const login = async (credentials: UserCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials, {
      withCredentials: true,
    });

    storeUsername(credentials.username); // Store encrypted username after successful login

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw error.response?.status
    }
    else throw new Error("Invalid username or password");
  }
};

// Modify License Function
export const license = async (credentials: LicenseKeyOnly): Promise<AuthResponse> => {
  try {
    const payload = {
      license_key: credentials.licenseKey,
    };
    const response = await axios.post(`${API_BASE}/auth/license`, payload, {
      withCredentials: true,
    });

    storeUsername(response.data.username); // Store encrypted username from response

    return response.data.message;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "License validation failed");
  }
};

// Clear Encrypted Username on Logout
export const logout = async (): Promise<void> => {
  try {
    await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });

    sessionStorage.removeItem("currentUser"); // Remove encrypted username
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const getProfile = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE}/user/profile`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch profile");
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return user !== null; 
  } catch {
    return false;
  }
};