import { api } from './api';
import { ENDPOINTS } from './endpoints';

export interface ContentReport {
  id: string;
  reporterId: string;
  songId: string;
  artistId: string;
  reason: 'copyright' | 'inappropriate' | 'spam' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt: string | null;
  song: {
    title: string;
    artist: {
      artistName: string;
    };
  };
}

export interface ReportsResponse {
  reports: ContentReport[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateReportParams {
  songId: string;
  reason: 'copyright' | 'inappropriate' | 'spam' | 'other';
  description?: string;
}

export interface GetReportsParams {
  page?: number;
  limit?: number;
}

/**
 * Content report service
 */
export class ReportService {
  /**
   * Create a content report
   */
  static async createReport(params: CreateReportParams) {
    const response = await api.post(ENDPOINTS.reports.create, params);
    return response.data.data;
  }

  /**
   * Get current user's reports
   */
  static async getMyReports(params: GetReportsParams = {}): Promise<ReportsResponse> {
    const response = await api.get(ENDPOINTS.reports.myReports, {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
      },
    });
    return response.data.data;
  }
}
