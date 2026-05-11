import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ReportService,
  type CreateReportParams,
  type GetReportsParams,
} from '@/services/report.service';

export const REPORT_KEYS = {
  all: ['reports'] as const,
  myReports: (params: GetReportsParams) => [...REPORT_KEYS.all, 'my', params] as const,
};

/**
 * Hook to create a content report
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateReportParams) => ReportService.createReport(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all });
    },
  });
}

/**
 * Hook to fetch user's reports
 */
export function useMyReports(params: GetReportsParams = {}) {
  return useQuery({
    queryKey: REPORT_KEYS.myReports(params),
    queryFn: () => ReportService.getMyReports(params),
  });
}
