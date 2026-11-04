import type { Resume, ResumeDetail, ResumeTemplateId, TailorProposal } from '@monolenz/types/entities';
import type {
  ResumeCreateInput,
  ResumeTailorApplyInput,
  ResumeTailorInput,
  ResumeUpdateInput,
} from '@monolenz/types/validation/resume-schemas';
import type { ApiResponse } from '@monolenz/types/api';
import type { ApiClient } from './common';

type ResumeListResponse = ApiResponse<Resume[]>;
type ResumeDetailResponse = ApiResponse<ResumeDetail>;
type TailorProposalResponse = ApiResponse<TailorProposal>;

export function createResumeApi(client: ApiClient) {
  const BASE_PATH = '/api/v1/resumes';

  return {
    async list(): Promise<Resume[]> {
      const response = await client.get<ResumeListResponse>(BASE_PATH);
      return response.data ?? [];
    },

    async create(payload: ResumeCreateInput = {}): Promise<ResumeDetail> {
      const response = await client.post<ResumeDetailResponse, ResumeCreateInput>(BASE_PATH, payload);
      if (!response.data) throw new Error('Failed to create resume');
      return response.data;
    },

    async get(id: string): Promise<ResumeDetail> {
      const response = await client.get<ResumeDetailResponse>(`${BASE_PATH}/${id}`);
      if (!response.data) throw new Error('Failed to load resume');
      return response.data;
    },

    async update(id: string, payload: ResumeUpdateInput): Promise<ResumeDetail> {
      const response = await client.put<ResumeDetailResponse, ResumeUpdateInput>(`${BASE_PATH}/${id}`, payload);
      if (!response.data) throw new Error('Failed to update resume');
      return response.data;
    },

    async delete(id: string): Promise<void> {
      await client.delete(`${BASE_PATH}/${id}`);
    },

    async downloadPdf(id: string): Promise<{ blob: Blob; filename: string }> {
      const { blob, filename } = await client.getBlob(`${BASE_PATH}/${id}/pdf`);
      return { blob, filename: filename || 'resume.pdf' };
    },

    async tailor(id: string, payload: ResumeTailorInput): Promise<TailorProposal> {
      const response = await client.post<TailorProposalResponse, ResumeTailorInput>(
        `${BASE_PATH}/${id}/tailor`,
        payload
      );
      if (!response.data) throw new Error('Failed to tailor resume');
      return response.data;
    },

    async applyTailor(id: string, payload: ResumeTailorApplyInput): Promise<ResumeDetail> {
      const response = await client.post<ResumeDetailResponse, ResumeTailorApplyInput>(
        `${BASE_PATH}/${id}/tailor/apply`,
        payload
      );
      if (!response.data) throw new Error('Failed to create tailored resume');
      return response.data;
    },
  };
}

export type ResumeApi = ReturnType<typeof createResumeApi>;
export type { ResumeTemplateId };
