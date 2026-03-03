import { flushPromises } from '@vue/test-utils';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthentication } from '@/composables/useAuthentication';

const pushMock = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: pushMock,
  }),
}));

const logoutMock = vi.fn();
vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: () => ({
    logout: logoutMock,
  }),
}));

const logoutApiMock = vi.fn();
vi.mock('@/api/auth', () => ({
  authApi: {
    logout: (payload: unknown) => logoutApiMock(payload),
  },
}));

describe('useAuthentication', () => {
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
    vi.clearAllMocks();
    // mock localStorage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).localStorage = localStorageMock;
    localStorageMock.clear();
  });

  afterAll(() => {
    // 還原原本的 localStorage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).localStorage = originalLocalStorage;
  });

  it('provides default state and authentications list', () => {
    const { currentAuthentication, authentications } = useAuthentication();

    expect(currentAuthentication.value).toBe('');
    expect(authentications.map((a) => a.code)).toEqual(['user', 'logout']);
  });

  it('logoutAction calls API when refresh token exists and clears auth state', async () => {
    localStorage.setItem('refresh_token', 'refresh123');
    localStorage.setItem('access_token', 'access123');
    localStorage.setItem('access_role', 'user');

    logoutApiMock.mockResolvedValue({ success: true });

    const { logoutAction } = useAuthentication();

    await logoutAction();
    await flushPromises();

    expect(logoutApiMock).toHaveBeenCalledWith({ refreshToken: 'refresh123' });
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('access_role')).toBeNull();
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith({ name: 'login' });
  });

  it('logoutAction still clears local state when API throws', async () => {
    localStorage.setItem('refresh_token', 'refresh123');

    logoutApiMock.mockRejectedValue(new Error('network error'));

    const { logoutAction } = useAuthentication();

    await logoutAction();
    await flushPromises();

    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith({ name: 'login' });
  });

  it('handleAuthenticationChange navigates to profile on "user"', () => {
    const { handleAuthenticationChange } = useAuthentication();

    handleAuthenticationChange('user');

    expect(pushMock).toHaveBeenCalledWith({ name: 'profile' });
  });

  it('handleAuthenticationChange triggers logout on "logout"', async () => {
    localStorage.setItem('refresh_token', 'refresh123');
    logoutApiMock.mockResolvedValue({ success: true });

    const { handleAuthenticationChange } = useAuthentication();

    handleAuthenticationChange('logout');
    await flushPromises();

    expect(logoutApiMock).toHaveBeenCalledWith({ refreshToken: 'refresh123' });
    expect(logoutMock).toHaveBeenCalled();
  });
});
