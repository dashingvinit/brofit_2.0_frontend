import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";

type Crumb = { label: string; href?: string };

// Explicit path → crumb trail. Prefixes (/members/:id etc.) handled below.
const TRAILS: Record<string, Crumb[]> = {
  "/dashboard": [{ label: "Dashboard" }],
  "/members": [{ label: "Members" }],
  "/members/register": [{ label: "Members", href: "/members" }, { label: "Register" }],
  "/memberships": [{ label: "Memberships" }],
  "/memberships/create": [{ label: "Memberships", href: "/memberships" }, { label: "Create" }],
  "/trainings": [{ label: "Trainings" }],
  "/trainings/create": [{ label: "Trainings", href: "/trainings" }, { label: "Create" }],
  "/trainers": [{ label: "Trainers" }],
  "/plans": [{ label: "Plans" }],
  "/offers": [{ label: "Offers" }],
  "/offers/new": [{ label: "Offers", href: "/offers" }, { label: "New" }],
  "/financials": [{ label: "Financials" }],
  "/attendance": [{ label: "Attendance" }],
  "/reception": [{ label: "Reception" }],
  "/inbox": [{ label: "Inbox" }],
  "/profile": [{ label: "Profile" }],
  "/settings/staff": [{ label: "Settings" }, { label: "Staff Access" }],
  "/settings/whatsapp": [{ label: "Settings" }, { label: "WhatsApp" }],
  "/settings/broadcast": [{ label: "Settings" }, { label: "Broadcast" }],
  "/analytics": [{ label: "Analytics" }],
};

const PREFIX_TRAILS: [string, Crumb[]][] = [
  ["/members/", [{ label: "Members", href: "/members" }, { label: "Details" }]],
  ["/memberships/", [{ label: "Memberships", href: "/memberships" }, { label: "Details" }]],
  ["/trainings/", [{ label: "Trainings", href: "/trainings" }, { label: "Details" }]],
  ["/trainers/", [{ label: "Trainers", href: "/trainers" }, { label: "Details" }]],
  ["/offers/", [{ label: "Offers", href: "/offers" }, { label: "Edit" }]],
  ["/platform/orgs/", [{ label: "Platform", href: "/platform" }, { label: "Organization" }]],
];

function resolveCrumbs(pathname: string): Crumb[] {
  if (TRAILS[pathname]) return TRAILS[pathname];
  const prefixMatch = PREFIX_TRAILS.find(([p]) => pathname.startsWith(p));
  if (prefixMatch) return prefixMatch[1];
  return [{ label: "Brofit" }];
}

export function PageBreadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = resolveCrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <BreadcrumbItem key={`${c.label}-${i}`}>
              {isLast || !c.href ? (
                <BreadcrumbPage className="text-foreground/80 font-medium">{c.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
