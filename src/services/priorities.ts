import axiosInstance from '@/axios';
import { CreatePriorityDto, Priority, WeekStatusUpdate } from '@/types/priority';

interface UpdateWeekStatusPayload {
  weekStatusUpdates: WeekStatusUpdate[];
}
export const PriorityService = {
  async getAllPriorities(): Promise<Priority[]> {
    const response = await axiosInstance.get('/priorities');
    return response.data;
  },

  // async getPrioritiesByType(type: 'individual' | 'team' | 'company'): Promise<Priority[]> {
  //   const response = await axiosInstance.get(`/priorities/type/${type}`);
  //   return response.data;
  // },
  async getPrioritiesByType(type): Promise<Priority[]> {
    const response = await axiosInstance.post(`/priorities/type`,type);
    return response.data;
  },

  async getPriority(id: string): Promise<Priority> {
    const response = await axiosInstance.get(`/priorities/${id}`);
    return response.data;
  },

  async createPriority(priority: CreatePriorityDto): Promise<Priority> {
    const response = await axiosInstance.post('/priorities', priority);
    return response.data;
  },

  async updatePriority(id: string, priority: any): Promise<Priority> {
    const response = await axiosInstance.patch(`/priorities/${id}`, priority);
    return response.data;
  },
  
    async updatePriorityWeekStatusData(id: string, weekStatusUpdate: UpdateWeekStatusPayload): Promise<Priority> {
    const response = await axiosInstance.patch(`/priorities/${id}/week-status`, weekStatusUpdate);
    return response.data;
  },
  // `${API_BASE_URL}/priorities/${priority._id}/week-status`,

  async getPriorityHistory(id: string): Promise<any[]> {
    const response = await axiosInstance.get(`/priorities/${id}/history`);
    return response.data;
  },

  async deletePriority(id: string): Promise<void> {
    await axiosInstance.delete(`/priorities/${id}`);
  }
};