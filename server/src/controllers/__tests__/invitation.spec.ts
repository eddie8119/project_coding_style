import { Language } from '@frontend/types/language';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedRequest } from '@/types/requests';
import type { Request, Response } from 'express';

import {
  acceptInvitation,
  createGlobalInvitation,
  createProjectInvitation,
} from '@/controllers/invitation';
import { AppError } from '@/utils/controllerError';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

const mockPickSnakeBody = vi.hoisted(() => vi.fn());

vi.mock('@/utils/bodyTransform', () => ({
  pickSnakeBody: mockPickSnakeBody,
}));

const mockSendCollaboratorInvitation = vi.hoisted(() => vi.fn());

vi.mock('@/services/notification/email.service', () => ({
  emailService: {
    sendCollaboratorInvitation: mockSendCollaboratorInvitation,
  },
}));

const mockHandleControllerError = vi.hoisted(() => vi.fn());

vi.mock('@/utils/controllerError', async () => {
  const actual =
    await vi.importActual<typeof import('@/utils/controllerError')>('@/utils/controllerError');
  return {
    ...actual,
    handleControllerError: mockHandleControllerError,
  };
});

const mockRandomBytes = vi.hoisted(() =>
  vi.fn(() => ({
    toString: () => 'mock-token',
  }))
);

vi.mock('crypto', () => ({
  randomBytes: mockRandomBytes,
}));

type MockResponse = Response & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const createMockResponse = (): MockResponse =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as unknown as MockResponse;

const getJsonPayload = (res: MockResponse) =>
  (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];

const createAuthRequest = (overrides: Partial<AuthenticatedRequest> = {}) =>
  ({
    userId: 'user-123',
    params: {},
    body: {},
    user: { email: 'owner@example.com', name: 'Owner' },
    ...overrides,
  }) as unknown as AuthenticatedRequest & Request;

const createSelectSingleQuery = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(result),
});

const createInsertReturningQuery = (result: { data: unknown; error: unknown }) => ({
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(result),
});

const createInsertMutation = (result: { error: unknown }) => ({
  insert: vi.fn().mockResolvedValue(result),
});

const createUpdateMutation = (result: { error: unknown }) => ({
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue(result),
});

describe('invitation controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReset();
    mockPickSnakeBody.mockReset();
    mockSendCollaboratorInvitation.mockReset();
    mockHandleControllerError.mockReset();
    mockRandomBytes.mockClear();
    process.env.CLIENT_URL = 'https://app.example.com';
  });

  it('creates a project invitation and sends collaborator email', async () => {
    mockPickSnakeBody.mockReturnValue({
      collaborator_email: 'guest@example.com',
      role: 'editor',
      locale: Language.EN,
    });

    const existingInvitationQuery = createSelectSingleQuery({ data: null, error: null });
    const existingCollaboratorQuery = createSelectSingleQuery({ data: null, error: null });
    const insertQuery = createInsertReturningQuery({
      data: {
        id: 'inv-1',
        invitation_token: 'mock-token',
        invitee_email: 'guest@example.com',
      },
      error: null,
    });
    const projectQuery = createSelectSingleQuery({ data: { title: 'Project Nova' }, error: null });

    mockFrom
      .mockReturnValueOnce(existingInvitationQuery)
      .mockReturnValueOnce(existingCollaboratorQuery)
      .mockReturnValueOnce(insertQuery)
      .mockReturnValueOnce(projectQuery);

    const req = createAuthRequest({ params: { projectId: 'proj-1' } });
    const res = createMockResponse();

    await createProjectInvitation(req as Request, res);

    expect(insertQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        invitation_type: 'project',
        project_id: 'proj-1',
        invitee_email: 'guest@example.com',
        role: 'editor',
        invitation_token: 'mock-token',
      }),
    ]);

    expect(mockSendCollaboratorInvitation).toHaveBeenCalledWith(
      'Owner',
      'guest@example.com',
      'project',
      'editor',
      'mock-token',
      'Project Nova',
      Language.EN
    );

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = getJsonPayload(res);
    expect(payload.success).toBe(true);
    expect(payload.data.id).toBe('inv-1');
    expect(payload.data.invitationToken).toBe('mock-token');
  });

  it('delegates to handleControllerError when global invitation already exists', async () => {
    mockPickSnakeBody.mockReturnValue({
      collaborator_email: 'guest@example.com',
      role: 'viewer',
      locale: Language.ZH_TW,
    });

    const existingInvitationQuery = createSelectSingleQuery({
      data: { id: 'existing' },
      error: null,
    });
    mockFrom.mockReturnValueOnce(existingInvitationQuery);

    const req = createAuthRequest();
    const res = createMockResponse();

    await createGlobalInvitation(req as Request, res);

    expect(mockHandleControllerError).toHaveBeenCalledWith(
      res,
      expect.any(AppError),
      'Create global invitation error'
    );
    expect(mockSendCollaboratorInvitation).not.toHaveBeenCalled();
  });

  it('accepts a project invitation and records collaborator', async () => {
    const invitationQuery = createSelectSingleQuery({
      data: {
        id: 'inv-1',
        invitation_type: 'project',
        project_id: 'proj-1',
        inviter_id: 'owner-1',
        invitee_email: 'guest@example.com',
        role: 'viewer',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      error: null,
    });
    const collaboratorInsertQuery = createInsertMutation({ error: null });
    const updateQuery = createUpdateMutation({ error: null });

    mockFrom
      .mockReturnValueOnce(invitationQuery)
      .mockReturnValueOnce(collaboratorInsertQuery)
      .mockReturnValueOnce(updateQuery);

    const req = createAuthRequest({
      userId: 'user-999',
      params: { invitationToken: 'token-123' },
    });
    const res = createMockResponse();

    await acceptInvitation(req as Request, res);

    expect(collaboratorInsertQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        project_id: 'proj-1',
        collaborator_email: 'guest@example.com',
        collaborator_user_id: 'user-999',
        role: 'viewer',
      }),
    ]);
    expect(updateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'accepted' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = getJsonPayload(res);
    expect(payload.success).toBe(true);
    expect(payload.message).toContain('accepted');
  });
});
