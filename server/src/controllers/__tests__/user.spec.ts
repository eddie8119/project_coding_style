import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Request, Response } from 'express';

import { getCurrentUser, register, updateUser } from '@/controllers/user';

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(),
  auth: {
    admin: {
      createUser: vi.fn(),
      inviteUserByEmail: vi.fn(),
      deleteUser: vi.fn(),
    },
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    signInWithPassword: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

const mockPickSnakeBody = vi.hoisted(() => vi.fn());

vi.mock('@/utils/bodyTransform', () => ({
  pickSnakeBody: mockPickSnakeBody,
}));

const mockSanitizeAndCamelcase = vi.hoisted(() =>
  vi.fn((record: Record<string, unknown> | null | undefined) =>
    record ? { ...record, sanitized: true } : null
  )
);

vi.mock('@/utils/formatters', () => ({
  sanitizeAndCamelcase: mockSanitizeAndCamelcase,
}));

type MockResponse = Response & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

const createMockResponse = (): MockResponse => {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as MockResponse;
};

type RequestOverrides = Partial<Request> & {
  user?: {
    id: string;
    email: string;
  };
};

const createRequest = (overrides: RequestOverrides = {}) => {
  return {
    body: {},
    params: {},
    user: { id: 'user-123', email: 'jane@example.com' },
    ...overrides,
  } as Request;
};

const getJsonPayload = (res: MockResponse) => {
  return (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
};

describe('user controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLIENT_URL = 'https://app.example.com';
  });

  it('register creates profile and returns sanitized document', async () => {
    const snakeProfile = {
      id: 'user-123',
      email: 'jane@example.com',
      name: 'Jane Doe',
      user_id: 'user-123',
    };

    mockPickSnakeBody.mockReturnValue({
      email: 'jane@example.com',
      password: 'secret123',
      name: 'Jane Doe',
    });

    mockSupabase.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const profileInsertQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: snakeProfile, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'Profiles') return profileInsertQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    mockSupabase.auth.admin.inviteUserByEmail.mockResolvedValue({ error: null });

    const req = createRequest();
    const res = createMockResponse();

    await register(req, res);

    expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'jane@example.com' })
    );
    expect(mockSupabase.from).toHaveBeenCalledWith('Profiles');
    expect(profileInsertQuery.insert).toHaveBeenCalled();
    expect(mockSupabase.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'jane@example.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/auth/account-activation') })
    );
    expect(mockSanitizeAndCamelcase).toHaveBeenCalledWith(snakeProfile);
    expect(res.status).toHaveBeenCalledWith(201);

    const payload = getJsonPayload(res);
    expect(payload.success).toBe(true);
    expect(payload.data.userDoc).toMatchObject({ email: 'jane@example.com', sanitized: true });
    expect(payload.data.emailSent).toBe(true);
  });

  it('getCurrentUser returns sanitized profile document', async () => {
    const snakeProfile = {
      id: 'user-123',
      email: 'jane@example.com',
      user_id: 'user-123',
    };

    const profileQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: snakeProfile, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'Profiles') return profileQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createRequest();
    const res = createMockResponse();

    await getCurrentUser(req, res);

    expect(profileQuery.eq).toHaveBeenCalledWith('id', 'user-123');
    expect(mockSanitizeAndCamelcase).toHaveBeenCalledWith(snakeProfile);

    const payload = getJsonPayload(res);
    expect(payload.success).toBe(true);
    expect(payload.data.userDoc).toMatchObject({ sanitized: true, email: 'jane@example.com' });
  });

  it('updateUser applies safe updates and returns sanitized profile', async () => {
    const snakeProfile = {
      id: 'user-123',
      email: 'jane@example.com',
      name: 'Updated Name',
      user_id: 'user-123',
    };

    mockPickSnakeBody.mockReturnValue({ name: 'Updated Name' });

    const profileUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: snakeProfile, error: null }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'Profiles') return profileUpdateQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const req = createRequest();
    const res = createMockResponse();

    await updateUser(req, res);

    expect(mockPickSnakeBody).toHaveBeenCalled();
    expect(profileUpdateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated Name' })
    );
    expect(profileUpdateQuery.eq).toHaveBeenCalledWith('id', 'user-123');
    expect(mockSanitizeAndCamelcase).toHaveBeenCalledWith(snakeProfile);

    const payload = getJsonPayload(res);
    expect(payload.success).toBe(true);
    expect(payload.data.userDoc).toMatchObject({ name: 'Updated Name', sanitized: true });
  });
});
