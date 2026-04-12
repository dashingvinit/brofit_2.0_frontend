import { useLocation } from 'react-router-dom';

/** Resolve the target a child page should return to: prefer `location.state.from`, else fallback. */
export function useReturnTo(fallback: string): string {
  const from = (useLocation().state as { from?: string } | null)?.from;
  return from || fallback;
}

/** Nav state to pass when opening a child page, so it knows where to return. */
export function useFromState() {
  const { pathname, search } = useLocation();
  return { state: { from: pathname + search } };
}
