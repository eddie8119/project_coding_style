import type { CollaboratorInvitationResponse, CollaboratorRole } from '@/types/response';

import { Language } from '@/types/language';
import request from '@/utils/request';

// Get my received invitations
export const getMyInvitations = async (): Promise<CollaboratorInvitationResponse[]> => {
  const response = await request.get('/invitations/received');
  return response.data;
};

// Get sent invitations
export const getSentInvitations = async (): Promise<CollaboratorInvitationResponse[]> => {
  const response = await request.get('/invitations/sent');
  return response.data;
};

const getLocaleLanguage = (): Language => {
  return localStorage.getItem('language') as Language;
};

// Create project invitation
export const createProjectInvitation = async (
  projectId: string,
  collaboratorEmail: string,
  role: CollaboratorRole,
  locale: Language = getLocaleLanguage()
): Promise<CollaboratorInvitationResponse> => {
  const response = await request.post(`/invitations/project/${projectId}`, {
    collaboratorEmail,
    role,
    locale,
  });
  return response.data;
};

// Create global invitation
export const createGlobalInvitation = async (
  collaboratorEmail: string,
  role: CollaboratorRole,
  locale: Language = getLocaleLanguage()
): Promise<CollaboratorInvitationResponse> => {
  const response = await request.post('/invitations/global', {
    collaboratorEmail,
    role,
    locale,
  });
  return response.data;
};

// Accept invitation
export const acceptInvitation = async (invitationToken: string): Promise<void> => {
  await request.post(`/invitations/accept/${invitationToken}`);
};

// Reject invitation
export const rejectInvitation = async (invitationId: string): Promise<void> => {
  await request.post(`/invitations/reject/${invitationId}`);
};

// Cancel invitation (by inviter)
export const cancelInvitation = async (invitationId: string): Promise<void> => {
  await request.delete(`/invitations/${invitationId}`);
};

// Get invitation by token (public, no auth required)
export const getInvitationByToken = async (
  token: string
): Promise<CollaboratorInvitationResponse> => {
  const response = await request.get(`/invitations/token/${token}`);
  return response.data;
};
