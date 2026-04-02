import axiosInstance from '@/axios';
import type { Team } from '@/types/team';
import type { ApiResponse } from '@/types/api-response';

export interface CreateTeamDto {
  name: string;
  owner: {
    id: string;
    name: string;
  };
  memberIds: string[];
}

export interface UpdateTeamDto {
  name?: string;
  owner?: {
    id: string;
    name: string;
  };
  memberIds?: string[];
  lastUpdatedBy?: string;
}

export const TeamService = {
  async getTeams(): Promise<ApiResponse<Team[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Team[]>>(`/teams`);
      // const response = await axiosInstance.post<ApiResponse<Team[]>>(`/teams/all-teams`,data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams');
    }
  },
  async getTeamById(id:string): Promise<ApiResponse<Team[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<Team[]>>(`/teams/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams');
    }
  },
  
  async createTeam(team: CreateTeamDto): Promise<ApiResponse<Team>> {
    try {
      const response = await axiosInstance.post<ApiResponse<Team>>('/teams', team);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create team');
    }
  },

  async updateTeam(id: string, team: UpdateTeamDto): Promise<ApiResponse<Team>> {
    try {
      const response = await axiosInstance.put<ApiResponse<Team>>(`/teams/${id}`, team);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update team');
    }
  },

  async deleteTeam(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/teams/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete team');
    }
  }
};