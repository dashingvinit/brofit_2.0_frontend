import { Outlet, Link, useLocation } from "react-router-dom";
import brandLogo from "@/assets/brand_logo.png";
import { useClerk, useUser, OrganizationSwitcher } from "@clerk/clerk-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { NavFlat } from "@/shared/components/nav-flat";
import { NavMain } from "@/shared/components/nav-main";
import { ROUTES } from "@/shared/lib/constants";
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  ChevronUp,
  Receipt,
  Settings2,
  type LucideIcon,
} from "lucide-react";

export function DashboardLayout() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const flatItems = [
    { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, isActive: isActive(ROUTES.DASHBOARD) },
    { name: "Members", href: ROUTES.MEMBERS, icon: Users, isActive: isActive(ROUTES.MEMBERS) },
  ];

  const navGroups: { label: string; icon: LucideIcon; items: { name: string; href: string; isActive: boolean }[] }[] = [
    {
      label: "Subscriptions",
      icon: Receipt,
      items: [
        { name: "Memberships", href: ROUTES.MEMBERSHIPS, isActive: isActive(ROUTES.MEMBERSHIPS) },
        { name: "Trainings", href: ROUTES.TRAININGS, isActive: isActive(ROUTES.TRAININGS) },
      ],
    },
    {
      label: "Configuration",
      icon: Settings2,
      items: [
        { name: "Plans", href: ROUTES.PLANS, isActive: isActive(ROUTES.PLANS) },
        { name: "Trainers", href: ROUTES.TRAINERS, isActive: isActive(ROUTES.TRAINERS) },
      ],
    },
  ];

  const detailTitles: [string, string][] = [
    [ROUTES.REGISTER_MEMBER, "Register Member"],
    [ROUTES.CREATE_MEMBERSHIP, "Create Membership"],
    [ROUTES.CREATE_TRAINING, "Create Training"],
    [ROUTES.PROFILE, "Profile"],
  ];
  const detailPrefixes: [string, string][] = [
    ["/members/", "Member Details"],
    ["/memberships/", "Membership Details"],
    ["/trainings/", "Training Details"],
  ];
  const detailPageTitle =
    detailTitles.find(([path]) => location.pathname === path)?.[1] ??
    detailPrefixes.find(([prefix]) => location.pathname.startsWith(prefix))?.[1] ??
    null;

  const currentPageName =
    flatItems.find((i) => i.isActive)?.name ??
    navGroups.flatMap((g) => g.items).find((i) => i.isActive)?.name ??
    detailPageTitle ??
    "Brofit 2.0";

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                <img src={brandLogo} alt="Brofit logo" className="size-8 object-contain" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                <span className="font-semibold">Brofit 2.0</span>
                <span className="text-xs text-muted-foreground">
                  Fitness Management
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <NavFlat items={flatItems} />
            <NavMain groups={navGroups} />
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user?.imageUrl}
                          alt={user?.fullName || ""}
                        />
                        <AvatarFallback className="rounded-lg">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.fullName}
                        </span>
                        <span className="truncate text-xs">
                          {user?.primaryEmailAddress?.emailAddress}
                        </span>
                      </div>
                      <ChevronUp className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage
                            src={user?.imageUrl}
                            alt={user?.fullName || ""}
                          />
                          <AvatarFallback className="rounded-lg">
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {user?.fullName}
                          </span>
                          <span className="truncate text-xs">
                            {user?.primaryEmailAddress?.emailAddress}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={ROUTES.PROFILE} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between gap-2">
              <h1 className="truncate text-sm font-medium text-foreground/80">{currentPageName}</h1>
              <div className="flex items-center gap-2 md:gap-3">
                <OrganizationSwitcher
                  hidePersonal
                  afterCreateOrganizationUrl={ROUTES.DASHBOARD}
                  afterSelectOrganizationUrl={ROUTES.DASHBOARD}
                  appearance={{
                    elements: {
                      rootBox: "flex items-center",
                      organizationSwitcherTrigger:
                        "px-2 py-1.5 md:px-3 md:py-2 rounded-md hover:bg-accent text-foreground text-sm",
                    },
                  }}
                />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto flex flex-col gap-4 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
