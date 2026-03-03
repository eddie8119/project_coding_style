export function hasCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return true;
    }
  } catch (_) {
    // ignore
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  return /Android|iPhone|iPad|iPod/i.test(ua);
}
