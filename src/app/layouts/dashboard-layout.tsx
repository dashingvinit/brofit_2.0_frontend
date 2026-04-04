import { Outlet, Link, useLocation } from "react-router-dom";
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
import { ViewSwitcher } from "@/shared/components/view-switcher";
import { ROUTES } from "@/shared/lib/constants";
import { useRole } from "@/shared/hooks/use-role";
import { useView } from "@/shared/hooks/use-view";
import { useStaffPermissions } from "@/features/settings/hooks/use-staff-permissions";
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  ChevronUp,
  TrendingUp,
  BarChart2,
  ScanLine,
  ConciergeBell,
  CreditCard,
  Dumbbell,
  UserRound,
  LayoutGrid,
  Settings,
  Inbox,
  Tag,
} from "lucide-react";

export function DashboardLayout() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isAdmin } = useRole();
  const { view } = useView();
  const { resolvedPermissions: staffPerms } = useStaffPermissions();
  const location = useLocation();

  // Show admin nav when view is "admin" (includes super_admin users who switched to admin view)
  const showAdminNav = view === "admin";

  const isActive = (path: string) => location.pathname === path;

  // Admin: flat nav split into two visual groups via NavFlat sections
  const adminTopItems = [
    { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, isActive: isActive(ROUTES.DASHBOARD) },
  ];

  const adminPeopleItems = [
    { name: "Members", href: ROUTES.MEMBERS, icon: Users, isActive: isActive(ROUTES.MEMBERS) },
    { name: "Attendance", href: ROUTES.ATTENDANCE, icon: ScanLine, isActive: isActive(ROUTES.ATTENDANCE) },
  ];

  const adminOperationsItems = [
    { name: "Trainers", href: ROUTES.TRAINERS, icon: UserRound, isActive: isActive(ROUTES.TRAINERS) },
    { name: "Memberships", href: ROUTES.MEMBERSHIPS, icon: CreditCard, isActive: isActive(ROUTES.MEMBERSHIPS) },
    { name: "Trainings", href: ROUTES.TRAININGS, icon: Dumbbell, isActive: isActive(ROUTES.TRAININGS) },
  ];

  const adminBusinessItems = [
    { name: "Plans", href: ROUTES.PLANS, icon: LayoutGrid, isActive: isActive(ROUTES.PLANS) },
    { name: "Offers", href: ROUTES.OFFERS, icon: Tag, isActive: isActive(ROUTES.OFFERS) },
    { name: "Financials", href: ROUTES.FINANCIALS, icon: TrendingUp, isActive: isActive(ROUTES.FINANCIALS) },
    { name: "Analytics", href: ROUTES.ANALYTICS, icon: BarChart2, isActive: isActive(ROUTES.ANALYTICS) },
  ];

  const staffFlatItems = [
    { name: "Reception", href: ROUTES.RECEPTION, icon: ConciergeBell, isActive: isActive(ROUTES.RECEPTION) },
    ...(staffPerms.canTakeAttendance
      ? [{ name: "Attendance", href: ROUTES.ATTENDANCE, icon: ScanLine, isActive: isActive(ROUTES.ATTENDANCE) }]
      : []),
    ...(staffPerms.canViewMembers
      ? [{ name: "Members", href: ROUTES.MEMBERS, icon: Users, isActive: isActive(ROUTES.MEMBERS) }]
      : []),
    ...(staffPerms.canCreateMembership
      ? [{ name: "Memberships", href: ROUTES.MEMBERSHIPS, icon: CreditCard, isActive: isActive(ROUTES.MEMBERSHIPS) }]
      : []),
    ...(staffPerms.canCreateTraining
      ? [{ name: "Trainings", href: ROUTES.TRAININGS, icon: Dumbbell, isActive: isActive(ROUTES.TRAININGS) }]
      : []),
  ];

  const allFlatItems = showAdminNav
    ? [...adminTopItems, ...adminPeopleItems, ...adminOperationsItems, ...adminBusinessItems]
    : staffFlatItems;

  const detailTitles: [string, string][] = [
    [ROUTES.REGISTER_MEMBER, "Register Member"],
    [ROUTES.CREATE_MEMBERSHIP, "Create Membership"],
    [ROUTES.CREATE_TRAINING, "Create Training"],
    [ROUTES.PROFILE, "Profile"],
    [ROUTES.SETTINGS, "Settings"],
    [ROUTES.INBOX, "Inbox"],
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
    allFlatItems.find((i) => i.isActive)?.name ??
    detailPageTitle ??
    "Brofit 2.0";

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <ViewSwitcher />
          </SidebarHeader>

          <SidebarContent>
            {showAdminNav ? (
              <>
                <NavFlat items={adminTopItems} />
                <NavFlat items={adminPeopleItems} label="People" />
                <NavFlat items={adminOperationsItems} label="Operations" />
                <NavFlat items={adminBusinessItems} label="Business" />
              </>
            ) : (
              <NavFlat items={staffFlatItems} />
            )}
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(ROUTES.INBOX)} tooltip="Inbox">
                  <Link to={ROUTES.INBOX}>
                    <Inbox />
                    <span>Inbox</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(ROUTES.SETTINGS)} tooltip="Settings">
                  <Link to={ROUTES.SETTINGS}>
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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

          <main className="flex-1 overflow-auto flex flex-col gap-4 p-3 md:p-5 bg-zinc-100 dark:bg-zinc-950">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
