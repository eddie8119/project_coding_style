import { jwtDecode } from 'jwt-decode';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearTokens,
  getAccessRole,
  getAccessToken,
  getRefreshToken,
  isAccessTokenValid,
  isRefreshTokenValid,
  isTokenValid,
  setAccessRole,
  setAccessToken,
  setRefreshToken,
} from '@/utils/auth';

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

const mockedJwtDecode = jwtDecode as unknown as ReturnType<typeof vi.fn>;

describe('utils/auth token utilities', () => {
  const originalLocalStorage = global.localStorage;
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).localStorage = localStorageMock;
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).localStorage = originalLocalStorage;
  });

  it('get/set access and refresh tokens', () => {
    setAccessToken('access');
    setRefreshToken('refresh');

    expect(getAccessToken()).toBe('access');
    expect(getRefreshToken()).toBe('refresh');
  });

  it('clearTokens removes all related keys', () => {
    setAccessToken('access');
    setRefreshToken('refresh');
    setAccessRole('admin');

    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getAccessRole()).toBeNull();
  });

  it('isTokenValid returns false for null or invalid token', () => {
    expect(isTokenValid(null)).toBe(false);

    mockedJwtDecode.mockImplementation(() => {
      throw new Error('decode error');
    });

    expect(isTokenValid('invalid')).toBe(false);
  });

  it('isTokenValid returns true when token exp is in the future', () => {
    const now = Date.now() / 1000;
    mockedJwtDecode.mockReturnValue({ exp: now + 100 } as never);

    expect(isTokenValid('valid')).toBe(true);
  });

  it('isTokenValid returns false when token exp is in the past', () => {
    const now = Date.now() / 1000;
    mockedJwtDecode.mockReturnValue({ exp: now - 100 } as never);

    expect(isTokenValid('expired')).toBe(false);
  });

  it('isAccessTokenValid and isRefreshTokenValid delegate to isTokenValid via storage', () => {
    setAccessToken('access-token');
    setRefreshToken('refresh-token');

    const now = Date.now() / 1000;
    mockedJwtDecode.mockReturnValue({ exp: now + 100 } as never);

    expect(isAccessTokenValid()).toBe(true);
    expect(isRefreshTokenValid()).toBe(true);
  });

  it('get/set access role', () => {
    setAccessRole('admin');

    expect(getAccessRole()).toBe('admin');
  });
});
