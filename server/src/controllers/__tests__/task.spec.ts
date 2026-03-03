import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedRequest } from '@/types/requests';
import type { Request, Response } from 'express';

import { createTask, getAllTasks, updateTask, updateTasks } from '@/controllers/task';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

type MockResponse = Response & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const createMockResponse = (): MockResponse => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as MockResponse;
  return res;
};

const createAuthRequest = (overrides: Partial<AuthenticatedRequest> = {}) => {
  const req = {
    userId: 'user-123',
    params: {},
    body: {},
    ...overrides,
  } as AuthenticatedRequest as Request;
  return req;
};

const snakeCaseTask = {
  id: 'task-1',
  title: 'Initial Planning',
  user_id: 'user-123',
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  reminder_date_time: null,
  end_date_time: null,
  pin_location: null,
};

const snakeCaseMaterial = {
  id: 'material-1',
  task_id: 'task-1',
  name: 'Wood',
  quantity: 5,
  unit_price: 100,
  unit: 'pcs',
  user_id: 'user-123',
  received_date_time: null,
  note: 'Test note',
};

describe('task controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllTasks returns sanitized list with materials', async () => {
    const tasksQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ ...snakeCaseTask, Materials: [snakeCaseMaterial] }],
        error: null,
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'Tasks') return tasksQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest();
    const res = createMockResponse();

    await getAllTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0]).not.toHaveProperty('userId');
    expect(payload.data[0].materials).toHaveLength(1);
    expect(payload.data[0].materials[0]).toMatchObject({
      name: 'Wood',
      unitPrice: 100,
    });
    expect(payload.data[0].materials[0]).toMatchObject({ userId: 'user-123' });
  });

  it('createTask inserts task and valid materials only', async () => {
    const insertedTask = { ...snakeCaseTask, project_id: 'proj-1' };

    const tasksQuery = {
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: insertedTask, error: null }),
        }),
      }),
    };

    const MaterialsInsert = vi.fn().mockResolvedValue({
      data: [snakeCaseMaterial],
      error: null,
    });

    const materialsQuery = {
      insert: vi.fn().mockReturnValue({
        select: MaterialsInsert,
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'Tasks') return tasksQuery;
      if (table === 'Materials') return materialsQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest({
      params: { projectId: 'proj-1' },
      body: {
        title: 'Create task',
        description: 'desc',
        materials: [
          { name: 'Wood', quantity: 5, unitPrice: 10, note: 'Test note' },
          { name: '   ' },
        ],
      },
    });
    const res = createMockResponse();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data.materials).toHaveLength(1);
    expect(payload.data.materials[0]).toMatchObject({ name: 'Wood' });

    const insertArgs = materialsQuery.insert.mock.calls[0][0];
    expect(insertArgs).toHaveLength(1);
    expect(insertArgs[0]).toMatchObject({
      user_id: 'user-123',
      task_id: 'task-1',
      name: 'Wood',
      note: 'Test note',
    });
  });

  it('updateTask keeps existing materials when none provided', async () => {
    const tasksQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: snakeCaseTask, error: null }),
    };

    const materialsQuery = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [snakeCaseMaterial], error: null }),
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'Tasks') return tasksQuery;
      if (table === 'Materials') return materialsQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest({
      params: { id: 'task-1' },
      body: {
        title: 'Updated',
        status: 'done',
      },
    });

    const res = createMockResponse();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data.materials).toHaveLength(1);
    expect(payload.data.materials[0]).toMatchObject({ name: 'Wood' });
    expect(payload.data.materials[0]).toMatchObject({ userId: 'user-123' });
  });

  it('updateTasks updates batch and returns sanitized payload', async () => {
    const updatedTask = { ...snakeCaseTask, project_id: 'proj-1' };

    const tasksQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedTask, error: null }),
    };

    const materialsDeleteQuery = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    const materialsInsertQuery = {
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [snakeCaseMaterial], error: null }),
      }),
    };

    let materialsCall = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'Tasks') return tasksQuery;
      if (table === 'Materials') {
        materialsCall += 1;
        return materialsCall === 1 ? materialsDeleteQuery : materialsInsertQuery;
      }
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest({
      params: { projectId: 'proj-1' },
      body: {
        tasks: [
          {
            id: 'task-1',
            project_id: 'proj-1',
            title: 'Updated',
            materials: [
              {
                name: 'Wood',
                quantity: 5,
                unit_price: 100,
                unit: 'pcs',
                note: 'Test note',
              },
            ],
          },
        ],
      },
    });

    const res = createMockResponse();

    await updateTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.message).toBe('All tasks updated successfully');
    expect(payload.errors).toBeUndefined();
    expect(payload.data[0]).not.toHaveProperty('userId');
    expect(payload.data[0].materials[0]).toMatchObject({
      name: 'Wood',
      unitPrice: 100,
    });
  });
});
