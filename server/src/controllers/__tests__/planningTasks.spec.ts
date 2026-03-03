import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedRequest } from '@/types/requests';
import type { Request, Response } from 'express';

import {
  createPlanningTask,
  getPlanningTaskById,
  getPlanningTasksByProjectId,
  updatePlanningTask,
} from '@/controllers/planningTasks';
import { AppError } from '@/utils/controllerError';

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

const mockPickSnakeBody = vi.hoisted(() => vi.fn());

vi.mock('@/utils/bodyTransform', () => ({
  pickSnakeBody: mockPickSnakeBody,
}));

const mockSanitizeAndCamelcase = vi.hoisted(() => vi.fn());
const mockMapSanitizeCamelcase = vi.hoisted(() => vi.fn());

vi.mock('@/utils/formatters', () => ({
  sanitizeAndCamelcase: mockSanitizeAndCamelcase,
  mapSanitizeCamelcase: mockMapSanitizeCamelcase,
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

type MockResponse = Response & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const createMockResponse = (): MockResponse =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as unknown as MockResponse;

const createRequest = (overrides: Partial<Request> = {}) =>
  ({
    params: {},
    body: {},
    ...overrides,
  }) as Request;

const createAuthRequest = (overrides: Partial<AuthenticatedRequest> = {}) =>
  ({
    userId: 'user-123',
    params: {},
    body: {},
    ...overrides,
  }) as AuthenticatedRequest as Request;

describe('planningTasks controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReset();
    mockPickSnakeBody.mockReset();
    mockSanitizeAndCamelcase.mockReset();
    mockMapSanitizeCamelcase.mockReset();
    mockHandleControllerError.mockReset();
  });

  it('getPlanningTaskById returns sanitized payload', async () => {
    const req = createRequest({ params: { id: 'task-1' } });
    const res = createMockResponse();

    const snakeTask = { id: 'task-1', content: 'snake case' };
    mockSanitizeAndCamelcase.mockReturnValue({ id: 'task-1', content: 'camelCase' });

    const planningTaskQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: snakeTask, error: null }),
    };

    mockSupabase.from.mockReturnValue(planningTaskQuery as never);

    await getPlanningTaskById(req, res);

    expect(planningTaskQuery.eq).toHaveBeenCalledWith('id', 'task-1');
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data).toEqual({ id: 'task-1', content: 'camelCase' });
  });

  it('getPlanningTaskById delegates to handleControllerError when id missing', async () => {
    const req = createRequest();
    const res = createMockResponse();

    await getPlanningTaskById(req, res);

    expect(mockHandleControllerError).toHaveBeenCalledWith(
      res,
      expect.any(AppError),
      'Unexpected error fetching planning task'
    );
  });

  it('createPlanningTask inserts new record and returns sanitized payload', async () => {
    mockPickSnakeBody.mockReturnValue({
      content: 'Install wiring',
      construction_type: 'electric',
      start_date: '2024-01-01',
      end_date: '2024-01-03',
    });

    const snakeTask = { id: 'task-99', content: 'snake' };
    mockSanitizeAndCamelcase.mockReturnValue({ id: 'task-99', content: 'camelCase' });

    const single = vi.fn().mockResolvedValue({ data: snakeTask, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    mockSupabase.from.mockReturnValue({ insert } as never);

    const req = createAuthRequest({ params: { projectId: 'proj-1' } });
    const res = createMockResponse();

    await createPlanningTask(req, res);

    const insertArgs = insert.mock.calls[0][0];
    expect(insertArgs).toHaveLength(1);
    expect(insertArgs[0]).toMatchObject({
      project_id: 'proj-1',
      user_id: 'user-123',
      construction_type: 'electric',
      content: 'Install wiring',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data).toEqual({ id: 'task-99', content: 'camelCase' });
  });

  it('createPlanningTask rejects missing content', async () => {
    mockPickSnakeBody.mockReturnValue({ content: undefined });

    const req = createAuthRequest({ params: { projectId: 'proj-1' } });
    const res = createMockResponse();

    await createPlanningTask(req, res);

    expect(mockHandleControllerError).toHaveBeenCalledWith(
      res,
      expect.any(AppError),
      'Unexpected error creating planning task'
    );
  });

  it('updatePlanningTask persists new values and returns sanitized payload', async () => {
    mockPickSnakeBody.mockReturnValue({
      content: 'Updated content',
      construction_type: 'demo',
    });

    const snakeTask = { id: 'task-1', content: 'Updated content' };
    mockSanitizeAndCamelcase.mockReturnValue({ id: 'task-1', content: 'Updated content' });

    const single = vi.fn().mockResolvedValue({ data: snakeTask, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });

    mockSupabase.from.mockReturnValue({ update } as never);

    const req = createRequest({ params: { id: 'task-1' } });
    const res = createMockResponse();

    await updatePlanningTask(req, res);

    expect(eq).toHaveBeenCalledWith('id', 'task-1');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        construction_type: 'demo',
        content: 'Updated content',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data).toEqual({ id: 'task-1', content: 'Updated content' });
  });

  it('getPlanningTasksByProjectId returns sanitized list', async () => {
    const req = createRequest({ params: { projectId: 'proj-1' } });
    const res = createMockResponse();

    const order = vi.fn().mockResolvedValue({ data: [{ id: 'task-1' }], error: null });
    const planningTaskQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order,
    };

    mockMapSanitizeCamelcase.mockReturnValue([{ id: 'task-1', content: 'camel' }]);

    mockSupabase.from.mockReturnValue(planningTaskQuery as never);

    await getPlanningTasksByProjectId(req, res);

    expect(planningTaskQuery.eq).toHaveBeenCalledWith('project_id', 'proj-1');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data).toEqual([{ id: 'task-1', content: 'camel' }]);
  });

  it('getPlanningTasksByProjectId handles missing project id', async () => {
    const req = createRequest();
    const res = createMockResponse();

    await getPlanningTasksByProjectId(req, res);

    expect(mockHandleControllerError).toHaveBeenCalledWith(
      res,
      expect.any(AppError),
      'Unexpected error fetching planning tasks'
    );
  });
});
