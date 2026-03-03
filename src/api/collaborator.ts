import type { ApiResponse } from '@/types/request';
import type {
  CollaboratorRole,
  GlobalCollaboratorResponse,
  ProjectCollaboratorResponse,
} from '@/types/response';

import request from '@/utils/request';

interface AddCollaboratorPayload {
  collaboratorEmail: string;
  role?: CollaboratorRole;
}

interface UpdateCollaboratorPayload {
  role: CollaboratorRole;
}

export const collaboratorApi = {
  // ==================== Project Collaborators ====================

  // Get all collaborators across all projects owned by the user
  getAllProjectCollaborators: (): Promise<ApiResponse<ProjectCollaboratorResponse[]>> => {
    return request.get('/collaborators/project/all');
  },

  // Get all collaborators for a specific project
  getProjectCollaborators: (
    projectId: string
  ): Promise<ApiResponse<ProjectCollaboratorResponse[]>> => {
    return request.get(`/collaborators/project/${projectId}`);
  },

  // Add a collaborator to a specific project
  addProjectCollaborator: (
    projectId: string,
    data: AddCollaboratorPayload
  ): Promise<ApiResponse<ProjectCollaboratorResponse>> => {
    return request.post(`/collaborators/project/${projectId}`, data);
  },

  // Update a project collaborator's role
  updateProjectCollaborator: (
    projectId: string,
    collaboratorId: string,
    data: UpdateCollaboratorPayload
  ): Promise<ApiResponse<ProjectCollaboratorResponse>> => {
    return request.patch(`/collaborators/project/${projectId}/${collaboratorId}`, data);
  },

  // Remove a collaborator from a specific project
  removeProjectCollaborator: (
    projectId: string,
    collaboratorId: string
  ): Promise<ApiResponse<void>> => {
    return request.delete(`/collaborators/project/${projectId}/${collaboratorId}`);
  },

  // ==================== Global Collaborators ====================

  // Get all global collaborators
  getGlobalCollaborators: (): Promise<ApiResponse<GlobalCollaboratorResponse[]>> => {
    return request.get('/collaborators/global');
  },

  // Add a global collaborator
  addGlobalCollaborator: (
    data: AddCollaboratorPayload
  ): Promise<ApiResponse<GlobalCollaboratorResponse>> => {
    return request.post('/collaborators/global', data);
  },

  // Update a global collaborator's role
  updateGlobalCollaborator: (
    collaboratorId: string,
    data: UpdateCollaboratorPayload
  ): Promise<ApiResponse<GlobalCollaboratorResponse>> => {
    return request.patch(`/collaborators/global/${collaboratorId}`, data);
  },

  // Remove a global collaborator
  removeGlobalCollaborator: (collaboratorId: string): Promise<ApiResponse<void>> => {
    return request.delete(`/collaborators/global/${collaboratorId}`);
  },
};
