import axiosInstance from "@/axios";

export const DashboardService = {
  async getUserById(id: string) {
    return // Return remove when dashboard is go to the deployment
    const response = await axiosInstance.get(`/dashboard/teamById/${id}`);
    return response.data;
  },
  async getteamById(id: string) {
    return // Return remove when dashboard is go to the deployment
    const response = await axiosInstance.post(`/dashboard/teamById`,id);
    return response.data;
  },
  // New Dashboard Data API (KPIs & Priorities)
  async getAllData(data:any) {
    const response = await axiosInstance.post(`/dashboard/my-dashboard`, data);
    return response.data;
  },
  // New Dashboard 16-07-2025
  async getAllDataKP(data:any) {
    const response = await axiosInstance.post(`/dashboard/dashboard-team`, data);
    return response.data;
  },
}