import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { AuthenticatedRequest } from '@/types/requests';
import type { Request, Response } from 'express';

import {
  createProject,
  getOverviewProjects,
  getProject,
  getProjects,
  updateProject,
} from '@/controllers/project';

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

const snakeCaseProject = {
  id: 'proj-1',
  title: 'Project Alpha',
  type: 'residential',
  user_id: 'user-123',
  is_shared: false,
  construction_container: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  tasks: [
    {
      id: 'task-1',
      title: 'Initial Planning',
      user_id: 'user-123',
      status: 'pending',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      reminder_date_time: null,
      end_date_time: null,
      pin_location: null,
      line_reminder_sent: false,
      email_reminder_sent: false,
      last_reminder_sent_at: null,
    },
  ],
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
  line_reminder_sent: false,
  email_reminder_sent: false,
  last_reminder_sent_at: null,
};

describe('project controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOverviewProjects returns sanitized overview data', async () => {
    const profileQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { name: 'Jane Doe' }, error: null }),
    };

    const projectsQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [snakeCaseProject], error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'Profiles') return profileQuery;
      if (table === 'Projects') return projectsQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest();
    const res = createMockResponse();

    await getOverviewProjects(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data[0].ownerName).toBe('Jane Doe');
    expect(payload.data[0]).not.toHaveProperty('userId');
    expect(payload.data[0].tasks[0]).not.toHaveProperty('userId');
  });

  it('getProjects returns sanitized list', async () => {
    const projectsQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [snakeCaseProject], error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'Projects') return projectsQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest();
    const res = createMockResponse();

    await getProjects(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data[0]).not.toHaveProperty('userId');
  });

  it('getProject returns project with tasks', async () => {
    const projectQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: snakeCaseProject, error: null }),
    };

    const tasksQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [snakeCaseTask], error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'Projects') return projectQuery;
      if (table === 'Tasks') return tasksQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest({ params: { id: 'proj-1' } });
    const res = createMockResponse();

    await getProject(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data.id).toBe('proj-1');
    expect(payload.data.tasks).toHaveLength(1);
    expect(payload.data.tasks[0]).not.toHaveProperty('userId');
  });

  it('createProject inserts project and returns sanitized response', async () => {
    const insertQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: snakeCaseProject, error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'Projects') return insertQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest({
      body: {
        title: 'Project Alpha',
        type: 'residential',
        constructionContainer: 'container',
      },
    });
    const res = createMockResponse();

    await createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data).not.toHaveProperty('userId');
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: 'user-123',
        }),
      ])
    );
  });

  it('updateProject updates existing record', async () => {
    const updateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: snakeCaseProject, error: null }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'Projects') return updateQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createAuthRequest({
      params: { id: 'proj-1' },
      body: {
        title: 'Updated Project',
      },
    });
    const res = createMockResponse();

    await updateProject(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload.data).not.toHaveProperty('userId');
    expect(updateQuery.update).toHaveBeenCalled();
  });
});
