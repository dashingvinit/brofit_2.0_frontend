import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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

export function ViewProvider({ children }: { children: ReactNode }) {
  const { isAdmin, isStaff, isSuperAdmin, isLoaded } = useRole();

  const availableViews: View[] = [];
  if (isSuperAdmin) availableViews.push("super_admin");
  if (isAdmin || isSuperAdmin) availableViews.push("admin");
  // Staff can only see staff view; admins and super admins can also switch to it
  availableViews.push("staff");

  // Default view based on highest role
  const defaultView: View = isSuperAdmin
    ? "super_admin"
    : isAdmin
      ? "admin"
      : "staff";

  const [view, setView] = useState<View>(defaultView);

  // Sync default view when role loads
  useEffect(() => {
    if (isLoaded) {
      setView(defaultView);
    }
  }, [isLoaded, defaultView]);

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
