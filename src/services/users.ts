import axiosInstance from '@/axios';
import { ApiResponse } from '@/types/api-response';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role?: string;
  designation?: string;
  avatar?: string;
}

export class UserService {
  static async getUserById(id: string): Promise<User> {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  }

  static async getUsers(): Promise<User[]> {
    const response = await axiosInstance.get('/users');
    return response.data;
  }

  static async getAllUsers(role: any): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>('/users/all-user', role);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }
}