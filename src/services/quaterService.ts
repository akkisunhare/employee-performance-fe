import axiosInstance from '@/axios';


export const QuarterService = {
  async getCurrentYearQuaters(yearStr:string): Promise<any[]> {
    const response = await axiosInstance.get("/quarters/search", {
        params: { year: yearStr },
      });
    return response.data;
  },
  async editPermission(id:string, value: any): Promise<any[]> {
    const response = await axiosInstance.patch(`/users/edit-toggle/${id}?value=${value}`);
    return response.data;
  },

//   async getPrioritiesByType(type: 'individual' | 'team' | 'company'): Promise<Priority[]> {
//     const response = await axiosInstance.get(`/priorities/type/${type}`);
//     return response.data;
//   },

//   async getPriority(id: string): Promise<Priority> {
//     const response = await axiosInstance.get(`/priorities/${id}`);
//     return response.data;
//   },

//   async createPriority(priority: CreatePriorityDto): Promise<Priority> {
//     const response = await axiosInstance.post('/priorities', priority);
//     return response.data;
//   },

//   async updatePriority(id: string, priority: any): Promise<Priority> {
//     const response = await axiosInstance.patch(`/priorities/${id}`, priority);
//     return response.data;
//   },

//   async getPriorityHistory(id: string): Promise<any[]> {
//     const response = await axiosInstance.get(`/priorities/${id}/history`);
//     return response.data;
//   },

//   async deletePriority(id: string): Promise<void> {
//     await axiosInstance.delete(`/priorities/${id}`);
//   }
};