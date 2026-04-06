import { useNavigate } from "react-router-dom";
import { ChevronsUpDown, Shield, ShieldCheck, UserRound } from "lucide-react";
import brandLogo from "@/assets/brand_logo.png";
import { ROUTES } from "@/shared/lib/constants";
import { useView, VIEW_LABELS, type View } from "@/shared/hooks/use-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";

const VIEW_CONFIG: Record<View, { icon: typeof Shield; subtitle: string; defaultRoute: string }> = {
  super_admin: {
    icon: ShieldCheck,
    subtitle: "Platform Management",
    defaultRoute: ROUTES.PLATFORM,
  },
  admin: {
    icon: Shield,
    subtitle: "Fitness Management",
    defaultRoute: ROUTES.DASHBOARD,
  },
  staff: {
    icon: UserRound,
    subtitle: "Reception & Attendance",
    defaultRoute: ROUTES.RECEPTION,
  },
};

export function ViewSwitcher() {
  const { view, setView, availableViews } = useView();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const current = VIEW_CONFIG[view];
  const canSwitch = availableViews.length > 1;

  const handleSwitch = (newView: View) => {
    if (newView !== view) setView(newView);
    navigate(VIEW_CONFIG[newView].defaultRoute);
  };

  // If only one view available (staff-only user), show static header
  if (!canSwitch) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
              <img src={brandLogo} alt="Brofit logo" className="size-8 object-contain" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Brofit 2.0</span>
              <span className="truncate text-xs text-muted-foreground">
                {current.subtitle}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                <img src={brandLogo} alt="Brofit logo" className="size-8 object-contain" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Brofit 2.0</span>
                <span className="truncate text-xs text-muted-foreground">
                  {current.subtitle}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch View
            </DropdownMenuLabel>
            {availableViews.map((v) => {
              const config = VIEW_CONFIG[v];
              const Icon = config.icon;
              return (
                <DropdownMenuItem
                  key={v}
                  onClick={() => handleSwitch(v)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Icon className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm">{VIEW_LABELS[v]}</span>
                    <span className="text-xs text-muted-foreground">{config.subtitle}</span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
