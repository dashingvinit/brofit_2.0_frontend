import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, Users, Dumbbell, LayoutGrid, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PageHeader } from "@/shared/components/page-header";
import { ROUTES } from "@/shared/lib/constants";
import { useOrgs } from "../hooks/use-platform";
import { CreateOrgDialog } from "../components/create-org-dialog";
import type { Organization } from "@/shared/types/common.types";

function OrgCard({ org, onClick }: { org: Organization; onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-4.5 w-4.5 text-primary" />
            </div>
            <CardTitle className="text-base leading-tight">{org.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {org.isActive === false && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Suspended</Badge>
            )}
            <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">Members</span>
            </div>
            <p className="text-lg font-semibold">{org._count?.members ?? 0}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Dumbbell className="h-3.5 w-3.5" />
              <span className="text-xs">Trainers</span>
            </div>
            <p className="text-lg font-semibold">{org._count?.trainers ?? 0}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-xs">Plans</span>
            </div>
            <p className="text-lg font-semibold">{org._count?.planTypes ?? 0}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-right mt-3">
          Added {new Date(org.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </CardContent>
    </Card>
  );
}

function OrgCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PlatformPage() {
  const navigate = useNavigate();
  const { data: orgs, isLoading, isError, error } = useOrgs();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Organizations"
        description="Manage all gyms on the platform"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Organization
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <OrgCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <p className="text-sm font-medium text-destructive">Failed to load organizations</p>
          <p className="text-xs text-muted-foreground">
            {(error as any)?.response?.data?.message ?? (error as any)?.message ?? "Unknown error"}
          </p>
        </div>
      ) : !orgs?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
          <Building2 className="h-10 w-10 opacity-30" />
          <p className="text-sm">No organizations yet. Create the first one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              onClick={() => navigate(`${ROUTES.PLATFORM_ORG_DETAIL}/${org.id}`)}
            />
          ))}
        </div>
      )}

      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
