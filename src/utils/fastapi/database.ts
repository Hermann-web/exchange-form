// src/utils/fastapi/database.ts
import axios from 'axios';
import type {
  DataBaseApiInterface,
  SubmissionData,
  SubmissionMetaDb,
} from '@/types/submissionapi';
import { ApiError } from '@/types/exceptions';
import type { AuthSession } from '@/types/authapi';

const API_BASE_URL = import.meta.env.VITE_CUSTOM_DB_BASE_URL || 'http://localhost:8000';
const STORAGE_KEY = 'fastapi_auth_session';

// Helper to get token (duplicated from auth.ts to avoid circular deps or complex sharing for now)
const getAccessToken = (): string | null => {
  const sessionStr = localStorage.getItem(STORAGE_KEY);
  if (!sessionStr) return null;
  try {
    const session: AuthSession = JSON.parse(sessionStr);
    return session.access_token;
  } catch {
    return null;
  }
};

const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const databaseApi: DataBaseApiInterface = {
  async saveSubmission(submissionData: SubmissionData): Promise<SubmissionMetaDb> {
    try {
      const response = await axios.post(`${API_BASE_URL}/submissions`, submissionData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || error.message || 'Failed to save submission',
        error.response?.status
      );
    }
  },

  async getMySubmission(_email: string): Promise<SubmissionMetaDb | null> {
    try {
      // We ignore the email argument as the backend uses the token to identify the user
      const response = await axios.get(`${API_BASE_URL}/submissions/me`, {
        headers: getAuthHeaders(),
      });
      // If 204 or null content, return null
      if (!response.data) return null;
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new ApiError(
        error.response?.data?.detail || error.message || 'Failed to fetch submission',
        error.response?.status
      );
    }
  },

  async listAllSubmissions(): Promise<SubmissionMetaDb[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/submissions`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || error.message || 'Failed to list submissions',
        error.response?.status
      );
    }
  },
};
