import { computed } from 'vue';

export function useAuth() {
  const isAdmin = computed(() => {
    const role = localStorage.getItem('access_role');
    return role === 'admin';
  });

  return { isAdmin };
}
