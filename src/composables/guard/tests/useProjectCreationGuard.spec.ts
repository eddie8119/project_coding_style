import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { useProjectsMock, warningMock, subscriptionRefs } = vi.hoisted(() => ({
  useProjectsMock: vi.fn(),
  warningMock: vi.fn(),
  subscriptionRefs: {
    canCreateProject: { value: true },
    maxProjects: { value: 3 },
  },
}));

vi.mock('@/composables/query/useProjects', () => ({
  useProjects: () => useProjectsMock(),
}));

vi.mock('element-plus', () => ({
  ElMessage: {
    warning: warningMock,
  },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => ({ key, params }),
  }),
}));

vi.mock('@/stores/useSubscriptionStore', () => ({
  useSubscriptionStore: () => ({
    canCreateProject: subscriptionRefs.canCreateProject,
    maxProjects: subscriptionRefs.maxProjects,
  }),
}));

vi.mock('pinia', () => ({
  storeToRefs: (store: unknown) => store,
}));

let useProjectCreationGuard: (typeof import('@/composables/guard/useProjectCreationGuard'))['useProjectCreationGuard'];

describe('useProjectCreationGuard', () => {
  beforeAll(async () => {
    ({ useProjectCreationGuard } = await import('@/composables/guard/useProjectCreationGuard'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    subscriptionRefs.canCreateProject.value = true;
    subscriptionRefs.maxProjects.value = 3;
  });

  it('initializes projects syncing and re-exports refs', () => {
    const { canCreateProject, maxProjects } = useProjectCreationGuard();

    expect(useProjectsMock).toHaveBeenCalledTimes(1);
    expect(canCreateProject).toBe(subscriptionRefs.canCreateProject);
    expect(maxProjects).toBe(subscriptionRefs.maxProjects);
  });

  it('returns true without warning when project creation is allowed', () => {
    const { ensureCanCreateProject } = useProjectCreationGuard();

    const result = ensureCanCreateProject();

    expect(result).toBe(true);
    expect(warningMock).not.toHaveBeenCalled();
  });

  it('shows warning and returns false when project creation is blocked', () => {
    subscriptionRefs.canCreateProject.value = false;
    subscriptionRefs.maxProjects.value = 5;
    const { ensureCanCreateProject } = useProjectCreationGuard();

    const result = ensureCanCreateProject();

    expect(result).toBe(false);
    expect(warningMock).toHaveBeenCalledWith({
      key: 'message.error.project_limit_reached',
      params: { limit: 5 },
    });
  });
});
