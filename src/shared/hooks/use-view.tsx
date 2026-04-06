import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useRole } from "./use-role";

export type View = "staff" | "admin" | "super_admin";

interface ViewContextValue {
  view: View;
  setView: (view: View) => void;
  availableViews: View[];
}

const ViewContext = createContext<ViewContextValue | null>(null);

const VIEW_LABELS: Record<View, string> = {
  staff: "Staff",
  admin: "Admin",
  super_admin: "Super Admin",
};

export { VIEW_LABELS };

const STORAGE_KEY = "brofit_view";

function getSavedView(): View | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "staff" || saved === "admin" || saved === "super_admin") return saved;
  } catch {}
  return null;
}

export function ViewProvider({ children }: { children: ReactNode }) {
  const { isAdmin, isSuperAdmin, isLoaded } = useRole();

  const availableViews: View[] = [];
  if (isSuperAdmin) availableViews.push("super_admin");
  if (isAdmin || isSuperAdmin) availableViews.push("admin");
  availableViews.push("staff");

  const defaultView: View = isSuperAdmin ? "super_admin" : isAdmin ? "admin" : "staff";

  const [view, setViewState] = useState<View>(getSavedView() ?? "staff");
  const initializedRef = useRef(false);

  const setView = (v: View) => {
    setViewState(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch {}
  };

  // Once roles load: validate that the saved view is still allowed, else reset to default
  useEffect(() => {
    if (isLoaded && !initializedRef.current) {
      initializedRef.current = true;
      const saved = getSavedView();
      if (!saved || !availableViews.includes(saved)) {
        setView(defaultView);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  return (
    <ViewContext.Provider value={{ view, setView, availableViews }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView(): ViewContextValue {
  const ctx = useContext(ViewContext);
  if (!ctx) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return ctx;
}
