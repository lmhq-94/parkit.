import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let authToken: string | null = null;

// Request interceptor
client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getAuthToken = (): string | null => authToken;

export default client;
