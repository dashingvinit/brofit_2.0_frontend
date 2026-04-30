import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import {
  useStaffPermissions,
  useUpdateStaffPermissions,
  useOrgStaffList,
  useUpdateStaffMemberPermissions,
} from "../hooks/use-staff-permissions";
import type { PermissionFlags } from "../api/staff-permissions-api";

const PERMISSION_ROWS: { key: keyof PermissionFlags; label: string; desc: string }[] = [
  { key: "canTakeAttendance", label: "Take Attendance", desc: "Check members in and out" },
  { key: "canRegisterMember", label: "Register New Members", desc: "Add new gym members" },
  { key: "canCreateMembership", label: "Create Memberships", desc: "Assign membership plans to members" },
  { key: "canCreateTraining", label: "Create Trainings", desc: "Assign training plans to members" },
  { key: "canRecordPayment", label: "Record Payments", desc: "Log cash, UPI, or card payments" },
  { key: "canViewReports", label: "View Reports", desc: "Access expiry, dues, and reception summaries" },
];

export function StaffAccessPage() {
  const { data: staffPerms, isLoading: isLoadingPerms, resolvedPermissions } = useStaffPermissions();
  const { mutate: updatePerms, isPending: isSavingPerms } = useUpdateStaffPermissions();
  const [perms, setPerms] = useState<PermissionFlags>(resolvedPermissions);

  const { data: staffList, isLoading: isLoadingStaff } = useOrgStaffList();
  const { mutate: updateStaffMember, isPending: isSavingMember } = useUpdateStaffMemberPermissions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [staffEdits, setStaffEdits] = useState<Record<string, PermissionFlags>>({});

  useEffect(() => {
    if (staffPerms) {
      setPerms({
        canTakeAttendance: staffPerms.canTakeAttendance,
        canRegisterMember: staffPerms.canRegisterMember,
        canCreateMembership: staffPerms.canCreateMembership,
        canCreateTraining: staffPerms.canCreateTraining,
        canRecordPayment: staffPerms.canRecordPayment,
        canViewReports: staffPerms.canViewReports,
      });
    }
  }, [staffPerms]);

  function handleExpandMember(userId: string) {
    if (expandedId === userId) { setExpandedId(null); return; }
    setExpandedId(userId);
    const member = staffList?.find((m) => m.userId === userId);
    if (member && !staffEdits[userId]) {
      setStaffEdits((prev) => ({ ...prev, [userId]: member.staffPermissions ?? resolvedPermissions }));
    }
  }

  function handleSaveMember(userId: string) {
    if (!staffEdits[userId]) return;
    updateStaffMember({ clerkUserId: userId, data: staffEdits[userId] });
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Staff Access" />
      <Card>
        <CardHeader>
          <CardTitle>Default Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Applied to any staff member who has no individual overrides set below.
          </p>
          {isLoadingPerms ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading…</span>
            </div>
          ) : (
            <>
              {PERMISSION_ROWS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-1">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={perms[key]} onCheckedChange={(val) => setPerms((p) => ({ ...p, [key]: val }))} />
                </div>
              ))}
              <Button className="mt-1" onClick={() => updatePerms(perms)} disabled={isSavingPerms}>
                {isSavingPerms && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Defaults
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Overrides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Override defaults for a specific staff member. Changes take effect on their next login.
          </p>
          {isLoadingStaff ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading staff…</span>
            </div>
          ) : !staffList || staffList.length === 0 ? (
            <EmptyState message="No staff members in this organization." className="py-2 text-left" />
          ) : (
            <div className="space-y-2">
              {staffList.map((member) => {
                const isExpanded = expandedId === member.userId;
                const edits = staffEdits[member.userId];
                const initials = `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`;
                return (
                  <div key={member.userId} className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => handleExpandMember(member.userId)}
                    >
                      <Avatar className="h-8 w-8 rounded-lg shrink-0">
                        <AvatarImage src={member.imageUrl} alt={member.firstName ?? ""} />
                        <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.identifier}</p>
                      </div>
                      {member.staffPermissions !== null && (
                        <Badge variant="secondary" className="shrink-0 text-xs">Customised</Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    {isExpanded && edits && (
                      <div className="px-3 pb-3 pt-1 border-t space-y-3">
                        {PERMISSION_ROWS.map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between gap-4 py-0.5">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <Switch
                              checked={edits[key]}
                              onCheckedChange={(val) =>
                                setStaffEdits((prev) => ({
                                  ...prev,
                                  [member.userId]: { ...prev[member.userId], [key]: val },
                                }))
                              }
                            />
                          </div>
                        ))}
                        <Button size="sm" className="mt-1" onClick={() => handleSaveMember(member.userId)} disabled={isSavingMember}>
                          {isSavingMember && <Loader2 className="mr-2 size-3 animate-spin" />}
                          Save for {member.firstName}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
