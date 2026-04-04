import { useState, useEffect } from "react";
import {
  Loader2,
  MessageCircle,
  BellRing,
  Send,
  UserPlus,
  CreditCard,
  Radio,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PageHeader } from "@/shared/components/page-header";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useSendTestMessage,
  useBroadcast,
  useRunDigest,
  useDefaultWelcomeMessage,
} from "../hooks/use-notification-settings";
import {
  useStaffPermissions,
  useUpdateStaffPermissions,
  useOrgStaffList,
  useUpdateStaffMemberPermissions,
} from "../hooks/use-staff-permissions";
import type { PermissionFlags } from "../api/staff-permissions-api";
import type { BroadcastFilter } from "../api/settings-api";

const PERMISSION_ROWS: { key: keyof PermissionFlags; label: string; desc: string }[] = [
  { key: "canTakeAttendance",  label: "Take Attendance",     desc: "Check members in and out" },
  { key: "canViewMembers",     label: "View Members",        desc: "Browse the members list and member details" },
  { key: "canRegisterMember",  label: "Register New Members",desc: "Add new gym members" },
  { key: "canCreateMembership",label: "Create Memberships",  desc: "Assign membership plans to members" },
  { key: "canCreateTraining",  label: "Create Trainings",    desc: "Assign training plans to members" },
  { key: "canRecordPayment",   label: "Record Payments",     desc: "Log cash, UPI, or card payments" },
  { key: "canViewReports",     label: "View Reports",        desc: "Access expiry, dues, and reception summaries" },
];

export function SettingsPage() {
  const { data: settings, isLoading } = useNotificationSettings();
  const { data: defaultWelcome } = useDefaultWelcomeMessage();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateNotificationSettings();
  const { mutate: sendTest, isPending: isTesting } = useSendTestMessage();
  const { mutate: broadcast, isPending: isBroadcasting } = useBroadcast();
  const { mutate: runDigest, isPending: isRunningDigest } = useRunDigest();

  const { data: staffPerms, isLoading: isLoadingPerms, resolvedPermissions } = useStaffPermissions();
  const { mutate: updatePerms, isPending: isSavingPerms } = useUpdateStaffPermissions();
  const [perms, setPerms] = useState<PermissionFlags>(resolvedPermissions);

  // Per-staff state
  const { data: staffList, isLoading: isLoadingStaff } = useOrgStaffList();
  const { mutate: updateStaffMember, isPending: isSavingMember } = useUpdateStaffMemberPermissions();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [staffEdits, setStaffEdits] = useState<Record<string, PermissionFlags>>({});

  // Core settings
  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [memberReminderEnabled, setMemberReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);

  // Welcome
  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  // Dues reminder
  const [duesReminderEnabled, setDuesReminderEnabled] = useState(false);
  const [duesReminderDaysOld, setDuesReminderDaysOld] = useState(7);

  // Broadcast
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastFilter, setBroadcastFilter] = useState<BroadcastFilter>("active");
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [digestRan, setDigestRan] = useState(false);

  // Test message feedback
  const [testResult, setTestResult] = useState<"sent" | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setOwnerWhatsapp(settings.ownerWhatsapp ?? "");
      setDigestEnabled(settings.digestEnabled);
      setMemberReminderEnabled(settings.memberReminderEnabled);
      setReminderDaysBefore(settings.reminderDaysBefore);
      setWelcomeEnabled(settings.welcomeEnabled);
      setWelcomeMessage(settings.welcomeMessage ?? "");
      setDuesReminderEnabled(settings.duesReminderEnabled);
      setDuesReminderDaysOld(settings.duesReminderDaysOld);
    }
  }, [settings]);

  useEffect(() => {
    if (staffPerms) {
      setPerms({
        canTakeAttendance: staffPerms.canTakeAttendance,
        canRegisterMember: staffPerms.canRegisterMember,
        canCreateMembership: staffPerms.canCreateMembership,
        canCreateTraining: staffPerms.canCreateTraining,
        canRecordPayment: staffPerms.canRecordPayment,
        canViewMembers: staffPerms.canViewMembers,
        canViewReports: staffPerms.canViewReports,
      });
    }
  }, [staffPerms]);

  function handleExpandMember(userId: string) {
    if (expandedId === userId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(userId);
    // Populate edit buffer from current per-user overrides, or fall back to org defaults
    const member = staffList?.find((m) => m.userId === userId);
    if (member && !staffEdits[userId]) {
      setStaffEdits((prev) => ({
        ...prev,
        [userId]: member.staffPermissions ?? resolvedPermissions,
      }));
    }
  }

  function handleSaveMember(userId: string) {
    if (!staffEdits[userId]) return;
    updateStaffMember({ clerkUserId: userId, data: staffEdits[userId] });
  }

  function handleSave() {
    updateSettings({
      ownerWhatsapp: ownerWhatsapp.trim() || null,
      digestEnabled,
      memberReminderEnabled,
      reminderDaysBefore,
      welcomeEnabled,
      welcomeMessage: welcomeMessage.trim() || null,
      duesReminderEnabled,
      duesReminderDaysOld,
    });
  }

  function handleTest() {
    setTestResult(null);
    setTestError(null);
    sendTest(undefined, {
      onSuccess: () => setTestResult("sent"),
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? "Failed to send. Check your Twilio credentials and sandbox opt-in.";
        setTestError(msg);
      },
    });
  }

  function handleBroadcast() {
    setBroadcastResult(null);
    broadcast(
      { message: broadcastMessage, filter: broadcastFilter },
      {
        onSuccess: (res) => {
          setBroadcastResult(res.data);
          setBroadcastMessage("");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" />

      {/* ── Staff Permissions ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" />
            Staff Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* ── Org-level defaults ── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Default Permissions</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Applied to any staff member who has no individual overrides set below.
              </p>
            </div>
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
                    <Switch
                      checked={perms[key]}
                      onCheckedChange={(val) => setPerms((p) => ({ ...p, [key]: val }))}
                    />
                  </div>
                ))}
                <Button
                  className="mt-1"
                  onClick={() => updatePerms(perms)}
                  disabled={isSavingPerms}
                >
                  {isSavingPerms && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Defaults
                </Button>
              </>
            )}
          </div>

          <div className="border-t" />

          {/* ── Per-staff overrides ── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Individual Overrides</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Override defaults for a specific staff member. Changes take effect on their next login.
              </p>
            </div>
            {isLoadingStaff ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading staff…</span>
              </div>
            ) : !staffList || staffList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No staff members in this organization.</p>
            ) : (
              <div className="space-y-2">
                {staffList.map((member) => {
                  const isExpanded = expandedId === member.userId;
                  const edits = staffEdits[member.userId];
                  const initials = `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`;
                  return (
                    <div key={member.userId} className="border rounded-lg overflow-hidden">
                      {/* Row header */}
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
                          <p className="text-sm font-medium truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{member.identifier}</p>
                        </div>
                        {member.staffPermissions !== null && (
                          <Badge variant="secondary" className="shrink-0 text-xs">Customised</Badge>
                        )}
                        {isExpanded
                          ? <ChevronUp className="size-4 text-muted-foreground shrink-0" />
                          : <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                        }
                      </button>

                      {/* Expanded permission toggles */}
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
                          <Button
                            size="sm"
                            className="mt-1"
                            onClick={() => handleSaveMember(member.userId)}
                            disabled={isSavingMember}
                          >
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
          </div>

        </CardContent>
      </Card>

      {/* ── WhatsApp configuration ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            WhatsApp Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Owner number + test button */}
          <div className="space-y-2">
            <Label htmlFor="owner-whatsapp">Your WhatsApp Number</Label>
            <div className="flex items-center gap-2">
              <Input
                id="owner-whatsapp"
                placeholder="+91 98765 43210"
                value={ownerWhatsapp}
                onChange={(e) => setOwnerWhatsapp(e.target.value)}
                className="max-w-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTesting || !ownerWhatsapp.trim()}
              >
                {isTesting ? (
                  <Loader2 className="mr-2 size-3 animate-spin" />
                ) : (
                  <Send className="mr-2 size-3" />
                )}
                Send Test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Include country code (e.g. +91 for India). Daily digests are sent to this number.
            </p>
            {testResult === "sent" && (
              <p className="text-xs text-green-600 font-medium">✓ Test message sent! Check your WhatsApp.</p>
            )}
            {testError && (
              <p className="text-xs text-destructive font-medium">✗ {testError}</p>
            )}
          </div>

          {/* Daily digest */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BellRing className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Daily Digest</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Receive a WhatsApp message every morning at 7 AM with expiring memberships,
                recently expired members, and pending dues.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => {
                  setDigestRan(false);
                  runDigest(undefined, { onSuccess: () => setDigestRan(true) });
                }}
                disabled={isRunningDigest || !ownerWhatsapp.trim()}
              >
                {isRunningDigest ? (
                  <Loader2 className="mr-2 size-3 animate-spin" />
                ) : (
                  <Send className="mr-2 size-3" />
                )}
                Run Now
              </Button>
              {digestRan && (
                <p className="text-xs text-green-600 font-medium">✓ Digest sent! Check your WhatsApp.</p>
              )}
            </div>
            <Switch checked={digestEnabled} onCheckedChange={setDigestEnabled} />
          </div>

          {/* Member renewal reminders */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Member Renewal Reminders</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Automatically send a WhatsApp reminder to members before their membership expires.
              </p>
            </div>
            <Switch checked={memberReminderEnabled} onCheckedChange={setMemberReminderEnabled} />
          </div>

          {memberReminderEnabled && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label htmlFor="reminder-days">Days before expiry to send reminder</Label>
              <Input
                id="reminder-days"
                type="number"
                min={1}
                max={30}
                value={reminderDaysBefore}
                onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                className="max-w-[100px]"
              />
            </div>
          )}

          {/* Dues reminder */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dues Reminders</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Send a WhatsApp reminder to members who have a pending payment older than N days.
                Runs daily with the morning digest.
              </p>
            </div>
            <Switch checked={duesReminderEnabled} onCheckedChange={setDuesReminderEnabled} />
          </div>

          {duesReminderEnabled && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label htmlFor="dues-days">Remind after payment is overdue by (days)</Label>
              <Input
                id="dues-days"
                type="number"
                min={1}
                max={90}
                value={duesReminderDaysOld}
                onChange={(e) => setDuesReminderDaysOld(Number(e.target.value))}
                className="max-w-[100px]"
              />
            </div>
          )}

          {/* Welcome message */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Welcome Message</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm">
                Automatically send a WhatsApp welcome message when a new member is added.
                Use <code className="text-xs bg-muted px-1 rounded">{"{name}"}</code> to personalise.
              </p>
            </div>
            <Switch checked={welcomeEnabled} onCheckedChange={setWelcomeEnabled} />
          </div>

          {welcomeEnabled && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label htmlFor="welcome-msg">Welcome message</Label>
              <Textarea
                id="welcome-msg"
                rows={8}
                placeholder={defaultWelcome ?? "Loading default…"}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use the default gym etiquette message.
              </p>
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* ── Broadcast ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="size-4" />
            Broadcast Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send a one-time WhatsApp message to a group of members. Use{" "}
            <code className="text-xs bg-muted px-1 rounded">{"{name}"}</code> to personalise each message.
          </p>

          <div className="space-y-2">
            <Label>Send to</Label>
            <Select value={broadcastFilter} onValueChange={(v) => setBroadcastFilter(v as BroadcastFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active members</SelectItem>
                <SelectItem value="all">All members</SelectItem>
                <SelectItem value="expiring">Expiring this week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="broadcast-msg">Message</Label>
            <Textarea
              id="broadcast-msg"
              rows={5}
              placeholder="Hi {name}! Exciting news from your gym…"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
          </div>

          {broadcastResult && (
            <p className="text-sm font-medium text-green-600">
              ✓ Sent {broadcastResult.sent} of {broadcastResult.total} messages
              {broadcastResult.failed > 0 && ` (${broadcastResult.failed} failed)`}.
            </p>
          )}

          <Button
            onClick={handleBroadcast}
            disabled={isBroadcasting || !broadcastMessage.trim()}
          >
            {isBroadcasting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Send Broadcast
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
