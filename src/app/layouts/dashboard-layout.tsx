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
  SidebarGroup,
  SidebarGroupLabel,
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
import { PwaInstallPrompt } from "@/shared/components/pwa-install-prompt";
import { NavFlat } from "@/shared/components/nav-flat";
import { PageBreadcrumbs } from "@/shared/components/page-breadcrumbs";
import { NavMain } from "@/shared/components/nav-main";
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
  MessageCircle,
  MessageSquare,
  Radio,
  Trash2,
} from "lucide-react";

export function DashboardLayout() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isAdmin } = useRole();
  const { view } = useView();
  const { resolvedPermissions: staffPerms } = useStaffPermissions();
  const location = useLocation();

  // Show admin nav when view is "admin" or "super_admin" inside the dashboard layout
  const showAdminNav = view === "admin" || view === "super_admin";

  const isActive = (path: string) => location.pathname === path;

  // Admin: flat nav split into two visual groups via NavFlat sections
  const adminTopItems = [
    { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, isActive: isActive(ROUTES.DASHBOARD) },
  ];

  const adminPeopleItems = [
    { name: "Members", href: ROUTES.MEMBERS, icon: Users, isActive: isActive(ROUTES.MEMBERS) },
    { name: "Attendance", href: ROUTES.ATTENDANCE, icon: ScanLine, isActive: isActive(ROUTES.ATTENDANCE) },
    { name: "Recycle Bin", href: ROUTES.RECYCLE_BIN, icon: Trash2, isActive: isActive(ROUTES.RECYCLE_BIN) },
  ];

  const adminBusinessItems = [
    { name: "Analytics", href: ROUTES.ANALYTICS, icon: BarChart2, isActive: isActive(ROUTES.ANALYTICS) },
    { name: "Financials", href: ROUTES.FINANCIALS, icon: TrendingUp, isActive: isActive(ROUTES.FINANCIALS) },
  ];

  const adminRecordsGroup = {
    label: "Records",
    icon: CreditCard,
    items: [
      { name: "Memberships", href: ROUTES.MEMBERSHIPS, icon: CreditCard, isActive: isActive(ROUTES.MEMBERSHIPS) },
      { name: "Trainings", href: ROUTES.TRAININGS, icon: Dumbbell, isActive: isActive(ROUTES.TRAININGS) },
    ],
  };

  const adminCatalogGroup = {
    label: "Catalog",
    icon: LayoutGrid,
    items: [
      { name: "Plans", href: ROUTES.PLANS, icon: LayoutGrid, isActive: isActive(ROUTES.PLANS) },
      { name: "Offers", href: ROUTES.OFFERS, icon: Tag, isActive: isActive(ROUTES.OFFERS) },
    ],
  };

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

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden print:block print:h-auto print:overflow-visible">
        <Sidebar collapsible="icon" className="print:hidden">
          <SidebarHeader>
            <ViewSwitcher />
          </SidebarHeader>

          <SidebarContent>
            {showAdminNav ? (
              <>
                <NavFlat items={adminTopItems} />
                <NavFlat items={adminBusinessItems} label="Business" />
                <NavFlat items={adminPeopleItems} label="People" />
                <SidebarGroup>
                  <SidebarGroupLabel>Manage</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive(ROUTES.TRAINERS)} tooltip="Trainers">
                        <Link to={ROUTES.TRAINERS}>
                          <UserRound />
                          <span>Trainers</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <NavMain groups={[adminRecordsGroup, adminCatalogGroup]} />
                </SidebarGroup>
                <SidebarGroup>
                  <SidebarGroupLabel>System</SidebarGroupLabel>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive(ROUTES.INBOX)} tooltip="Inbox">
                      <Link to={ROUTES.INBOX}>
                        <Inbox />
                        <span>Inbox</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive(ROUTES.WHATSAPP)} tooltip="WhatsApp">
                      <Link to={ROUTES.WHATSAPP}>
                        <MessageSquare />
                        <span>WhatsApp</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <NavMain groups={[
                    {
                      label: "Settings",
                      icon: Settings,
                      defaultOpen: location.pathname.startsWith(ROUTES.SETTINGS),
                      items: [
                        { name: "Staff Access", href: ROUTES.SETTINGS_STAFF, icon: Users, isActive: isActive(ROUTES.SETTINGS_STAFF) },
                        { name: "WhatsApp", href: ROUTES.SETTINGS_WHATSAPP, icon: MessageCircle, isActive: isActive(ROUTES.SETTINGS_WHATSAPP) },
                        { name: "Broadcast", href: ROUTES.SETTINGS_BROADCAST, icon: Radio, isActive: isActive(ROUTES.SETTINGS_BROADCAST) },
                      ],
                    },
                  ]} />
                </SidebarGroup>
              </>
            ) : (
              <NavFlat items={staffFlatItems} />
            )}
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

        <SidebarInset className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible print:w-full">
          <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-4 print:hidden">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between gap-2">
              <PageBreadcrumbs />
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

          <main className="flex-1 overflow-auto flex flex-col gap-4 p-3 md:p-5 bg-zinc-100 dark:bg-zinc-950 print:block print:overflow-visible print:bg-white print:p-0">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
      <PwaInstallPrompt />
    </SidebarProvider>
  );
}
