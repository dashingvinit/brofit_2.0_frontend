import { useState, useEffect } from "react";
import { Loader2, BellRing, MessageCircle, CreditCard, UserPlus, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useSendTestMessage,
  useRunDigest,
  useDefaultWelcomeMessage,
} from "../hooks/use-notification-settings";
import { PageHeader } from "@/shared/components/page-header";

export function WhatsAppPage() {
  const { data: settings, isLoading } = useNotificationSettings();
  const { data: defaultWelcome } = useDefaultWelcomeMessage();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateNotificationSettings();
  const { mutate: sendTest, isPending: isTesting } = useSendTestMessage();
  const { mutate: runDigest, isPending: isRunningDigest } = useRunDigest();

  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [memberReminderEnabled, setMemberReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [duesReminderEnabled, setDuesReminderEnabled] = useState(false);
  const [duesReminderDaysOld, setDuesReminderDaysOld] = useState(7);
  const [digestRan, setDigestRan] = useState(false);
  const [digestError, setDigestError] = useState<string | null>(null);
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
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Failed to send. Check your Twilio credentials and sandbox opt-in.";
        setTestError(msg);
      },
    });
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
      <PageHeader title="WhatsApp" />
      <Card>
      <CardHeader>
        <CardTitle>WhatsApp Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Owner number */}
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
            <Button variant="outline" size="sm" onClick={handleTest} disabled={isTesting || !ownerWhatsapp.trim()}>
              {isTesting ? <Loader2 className="mr-2 size-3 animate-spin" /> : <Send className="mr-2 size-3" />}
              Send Test
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Include country code (e.g. +91 for India). Daily digests are sent to this number.
          </p>
          {testResult === "sent" && (
            <p className="text-xs text-green-600 font-medium">✓ Test message sent! Check your WhatsApp.</p>
          )}
          {testError && <p className="text-xs text-destructive font-medium">✗ {testError}</p>}
        </div>

        {/* Daily digest */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BellRing className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Daily Digest</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              Receive a WhatsApp message every morning at 7 AM with expiring memberships, recently expired members, and pending dues.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => { setDigestRan(false); setDigestError(null); runDigest(undefined, { onSuccess: () => setDigestRan(true), onError: (err: unknown) => { setDigestError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to run digest. Check your Twilio credentials."); } }); }}
              disabled={isRunningDigest || !ownerWhatsapp.trim()}
            >
              {isRunningDigest ? <Loader2 className="mr-2 size-3 animate-spin" /> : <Send className="mr-2 size-3" />}
              Run Now
            </Button>
            {digestRan && <p className="text-xs text-green-600 font-medium">✓ Digest sent! Check your WhatsApp.</p>}
            {digestError && <p className="text-xs text-destructive font-medium">✗ {digestError}</p>}
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
              Send a WhatsApp reminder to members who have a pending payment older than N days. Runs daily with the morning digest.
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
              Automatically send a WhatsApp welcome message when a new member is added. Use{" "}
              <code className="text-xs bg-muted px-1 rounded">{"{name}"}</code> to personalise.
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
            <p className="text-xs text-muted-foreground">Leave blank to use the default gym etiquette message.</p>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  </div>
  );
}
