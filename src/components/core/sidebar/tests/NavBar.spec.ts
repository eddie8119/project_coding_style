import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import NavBar from '../NavBar.vue';

import { menu } from '@/constants/menu';

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock router-link
const RouterLinkStub = {
  template: '<a><slot /></a>',
};

describe('NavBar.vue', () => {
  const createWrapper = (props = {}) => {
    return mount(NavBar, {
      props: {
        isSidebarCollapsed: false,
        ...props,
      },
      global: {
        stubs: {
          'router-link': RouterLinkStub,
        },
      },
    });
  };

  it('renders menu items correctly', () => {
    const wrapper = createWrapper();
    const totalItems = menu.flatMap((group) => group.items).length;
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.length).toBe(totalItems);
  });

  it('shows text when not collapsed', () => {
    const wrapper = createWrapper({ isSidebarCollapsed: false });
    const firstLink = wrapper.find('a');
    const span = firstLink.find('span');
    expect(span.isVisible()).toBe(true);
  });

  it('hides text when collapsed', async () => {
    const wrapper = createWrapper({ isSidebarCollapsed: true });
    const firstLink = wrapper.find('a');
    const span = firstLink.find('span');
    // v-show works with display: none, so we check the style
    expect(span.attributes('style')).toContain('display: none;');
  });

  it('applies collapsed class to links when sidebar is collapsed', () => {
    const wrapper = createWrapper({ isSidebarCollapsed: true });
    const link = wrapper.find('a');
    expect(link.classes()).toContain('justify-center');
  });

  it('does not apply collapsed class when sidebar is not collapsed', () => {
    const wrapper = createWrapper({ isSidebarCollapsed: false });
    const link = wrapper.find('a');
    expect(link.classes()).not.toContain('justify-center');
  });
});
