import { useQuery } from "@tanstack/react-query";
import { dashboardGetStats, type DashboardGetStatsResponse } from "@vibe/shared";
import { request } from "@/lib/api-helper";

export const useDashboard = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ["dashboard", params],
    queryFn: () =>
      request<DashboardGetStatsResponse>(
        dashboardGetStats({ query: params }) as any,
      ),
  });
};
