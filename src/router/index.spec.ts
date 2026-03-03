import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NavigationGuard, RouteLocationNormalizedLoaded } from 'vue-router';

// Use vi.hoisted so these shared mocks & arrays exist before any vi.mock factory is hoisted
const { registeredGuards, mockUseAuthStore, mockIsAccessTokenValid } = vi.hoisted(() => ({
  registeredGuards: [] as NavigationGuard[],
  mockUseAuthStore: vi.fn(),
  mockIsAccessTokenValid: vi.fn(),
}));

vi.mock('vue-router', () => ({
  createRouter: () => ({
    beforeEach: (guard: NavigationGuard) => {
      registeredGuards.push(guard);
    },
  }),
  createWebHistory: vi.fn(),
}));

vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('@/utils/auth', () => ({
  isAccessTokenValid: () => mockIsAccessTokenValid(),
}));

// Import router module to register the guard
import '@/router';

describe('router navigation guard', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReset();
    mockIsAccessTokenValid.mockReset();
  });

  const getGuard = () => {
    const guard = registeredGuards[0];
    if (!guard) {
      throw new Error('Navigation guard not registered');
    }
    return guard;
  };

  it('redirects unauthenticated user from protected route to login with redirect query', () => {
    const logout = vi.fn();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      logout,
    });
    mockIsAccessTokenValid.mockReturnValue(false);

    const guard = getGuard();
    const to = {
      path: '/planning',
      fullPath: '/planning',
      name: 'planning-upload',
    } as RouteLocationNormalizedLoaded;
    const from = {} as RouteLocationNormalizedLoaded;
    const next = vi.fn();

    guard(to, from, next);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({
      name: 'login',
      query: { redirect: '/planning' },
    });
  });

  it('allows navigation to public auth page without authentication', () => {
    const logout = vi.fn();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      logout,
    });
    mockIsAccessTokenValid.mockReturnValue(false);

    const guard = getGuard();
    const to = { path: '/auth/login', name: 'login' } as RouteLocationNormalizedLoaded;
    const from = {} as RouteLocationNormalizedLoaded;
    const next = vi.fn();

    guard(to, from, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('redirects authenticated user away from public auth pages to planning-upload', () => {
    const logout = vi.fn();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      logout,
    });
    mockIsAccessTokenValid.mockReturnValue(true);

    const guard = getGuard();
    const to = { path: '/auth/login', name: 'login' } as RouteLocationNormalizedLoaded;
    const from = {} as RouteLocationNormalizedLoaded;
    const next = vi.fn();

    guard(to, from, next);

    expect(next).toHaveBeenCalledWith({ name: 'planning-upload' });
  });

  it('redirects Supabase recovery hash to reset-password route', () => {
    const logout = vi.fn();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      logout,
    });
    mockIsAccessTokenValid.mockReturnValue(false);

    const guard = getGuard();
    const to = {
      path: '/auth/login',
      name: 'login',
      hash: '#type=recovery&token=abc',
    } as RouteLocationNormalizedLoaded;
    const from = {} as RouteLocationNormalizedLoaded;
    const next = vi.fn();

    guard(to, from, next);

    expect(next).toHaveBeenCalledWith({
      name: 'reset-password',
      hash: '#type=recovery&token=abc',
    });
  });
});
