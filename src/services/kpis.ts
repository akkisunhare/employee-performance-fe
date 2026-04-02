import axiosInstance from "@/axios";

export const KpiService = {
  async getCurrentYearQuaters(yearStr: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get("/quarters/search", {
        params: { year: yearStr },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update team");
    }
  },
  async getAllKpis(params: any): Promise<any> {
    try {
      const response = await axiosInstance.post(`/kpis/getAll`,
        params
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get all KPI");
    }
  },
  async findAllByType(params: any): Promise<any> {
    try {
      const response = await axiosInstance.post(`/kpis/find-by-type`, params);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get all KPI");
    }
  },

  async getOneKpiById(id: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/kpis/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update team");
    }
  },
};
