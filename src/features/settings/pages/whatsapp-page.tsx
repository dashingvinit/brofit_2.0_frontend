import { useState, useEffect, useCallback } from "react";
import {
  Loader2, BellRing, MessageCircle, CreditCard, UserPlus,
  Send, RotateCcw, Smartphone, Zap, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useRunDigest,
  useSendWelcomeToAll,
  useWelcomeStatus,
  useResetWelcome,
} from "../hooks/use-notification-settings";
import {
  useWhatsappConnection,
  useConnectWhatsapp,
  useDisconnectWhatsapp,
} from "../hooks/use-whatsapp-connection";
import { PageHeader } from "@/shared/components/page-header";

const META_APP_ID = import.meta.env.VITE_META_APP_ID as string;

// ─── Credit Bar ───────────────────────────────────────────────────────────────

function CreditBar({ credits }: { credits: number }) {
  const max = 300;
  const pct = Math.min((credits / max) * 100, 100);
  const color = credits <= 15 ? "bg-red-500" : credits <= 60 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium flex items-center gap-1.5">
          <Zap className="size-3.5 text-amber-500" />
          WhatsApp Credits
        </span>
        <span className={credits <= 15 ? "text-red-600 font-semibold" : "text-muted-foreground"}>
          {credits} remaining
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {credits <= 15 && (
        <p className="text-xs text-red-600 font-medium">
          Low credits — contact us to top up before automated messages stop.
        </p>
      )}
    </div>
  );
}

// ─── Connection Section ───────────────────────────────────────────────────────

function ConnectionCard() {
  const { data: connection, isLoading } = useWhatsappConnection();
  const { mutate: connect, isPending: isConnecting } = useConnectWhatsapp();
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectWhatsapp();
  const [error, setError] = useState<string | null>(null);

  const launchEmbeddedSignup = useCallback(() => {
    setError(null);

    if (!META_APP_ID) {
      setError("VITE_META_APP_ID is not configured.");
      return;
    }

    // @ts-ignore — Meta SDK injected globally
    if (typeof window.FB === "undefined") {
      setError("Meta SDK not loaded. Refresh the page and try again.");
      return;
    }

    // @ts-ignore
    window.FB.login(
      (response: { authResponse?: { code?: string } }) => {
        const code = response.authResponse?.code;
        if (!code) {
          setError("WhatsApp signup was cancelled or failed.");
          return;
        }
        connect(code, {
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? "Failed to connect. Please try again.");
          },
        });
      },
      {
        scope: "whatsapp_business_management,whatsapp_business_messaging",
        extras: { setup: {}, featureType: "", sessionInfoVersion: "2" },
      }
    );
  }, [connect]);

  // Inject Meta JS SDK on mount
  useEffect(() => {
    if (document.getElementById("meta-sdk")) return;
    const script = document.createElement("script");
    script.id = "meta-sdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // @ts-ignore
      window.FB.init({ appId: META_APP_ID, version: "v19.0", cookie: true, xfbml: false });
    };
    document.body.appendChild(script);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Loader2 className="animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = connection?.isConnected;

  return (
    <Card className={isConnected ? "border-t-2 border-t-emerald-500" : ""}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone className="size-4" />
          WhatsApp Number
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{connection.displayName}</p>
                <p className="text-xs text-muted-foreground">{connection.phoneNumber}</p>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50">
                <CheckCircle2 className="mr-1 size-3" />
                Connected
              </Badge>
            </div>

            {!connection.templatesCreated && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <AlertCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  WhatsApp templates are being submitted for Meta approval. This can take up to 48 hours. Automated messages will start once approved.
                </p>
              </div>
            )}

            <CreditBar credits={connection.credits} />

            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => disconnect()}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : <XCircle className="mr-1.5 size-3" />}
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Connect your gym's WhatsApp number to send automated messages to your members. Each gym uses their own number — members will see your gym's name as the sender.
            </p>
            <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <p className="font-medium">Before connecting:</p>
              <p>• You'll need a phone number not already on WhatsApp</p>
              <p>• You'll log in with Facebook and select/create your WhatsApp Business account</p>
              <p>• 50 free credits are included to get started</p>
            </div>
            {error && (
              <p className="text-xs text-destructive font-medium">✗ {error}</p>
            )}
            <Button onClick={launchEmbeddedSignup} disabled={isConnecting}>
              {isConnecting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Smartphone className="mr-2 size-4" />
              )}
              Connect WhatsApp Number
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Notification Settings ────────────────────────────────────────────────────

export function WhatsAppPage() {
  const { data: connection } = useWhatsappConnection();
  const { data: settings, isLoading } = useNotificationSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateNotificationSettings();
  const { mutate: runDigest, isPending: isRunningDigest } = useRunDigest();
  const { mutate: sendWelcomeToAll, isPending: isSendingWelcome } = useSendWelcomeToAll();
  const { mutate: resetWelcome, isPending: isResetting } = useResetWelcome();
  const { data: welcomeStatus } = useWelcomeStatus();

  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [memberReminderEnabled, setMemberReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [duesReminderEnabled, setDuesReminderEnabled] = useState(false);
  const [duesReminderDaysOld, setDuesReminderDaysOld] = useState(7);
  const [digestRan, setDigestRan] = useState(false);
  const [digestError, setDigestError] = useState<string | null>(null);
  const [welcomeAllResult, setWelcomeAllResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [welcomeAllError, setWelcomeAllError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ reset: number } | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setOwnerWhatsapp(settings.ownerWhatsapp ?? "");
      setDigestEnabled(settings.digestEnabled);
      setMemberReminderEnabled(settings.memberReminderEnabled);
      setReminderDaysBefore(settings.reminderDaysBefore);
      setWelcomeEnabled(settings.welcomeEnabled);
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
      duesReminderEnabled,
      duesReminderDaysOld,
    });
  }

  const isConnected = connection?.isConnected;

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

      <ConnectionCard />

      {isConnected && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-6">

            {/* Owner number for digest */}
            <div className="space-y-2">
              <Label htmlFor="owner-whatsapp">Your WhatsApp Number (for daily digest)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="owner-whatsapp"
                  placeholder="+91 98765 43210"
                  value={ownerWhatsapp}
                  onChange={(e) => setOwnerWhatsapp(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Include country code (e.g. +91). Digests are sent as free-form messages — send any message to your gym's connected number first to open the 24h reply window.
              </p>
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
                  onClick={() => {
                    setDigestRan(false);
                    setDigestError(null);
                    runDigest(undefined, {
                      onSuccess: () => setDigestRan(true),
                      onError: (err: unknown) => setDigestError(
                        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to run digest."
                      ),
                    });
                  }}
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
                  Automatically send a WhatsApp reminder to members before their membership expires. Uses 1 credit per member.
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
                  Send a WhatsApp reminder to members who have a pending payment older than N days. Runs daily with the morning digest. Uses 1 credit per member.
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
                  Automatically send a WhatsApp welcome when a new member is added. Uses 1 credit per member. Template must be approved by Meta first.
                </p>
              </div>
              <Switch checked={welcomeEnabled} onCheckedChange={setWelcomeEnabled} />
            </div>

            {/* Welcome status breakdown */}
            {welcomeStatus && (
              <div className="border-t pt-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-lg font-semibold">{welcomeStatus.optedIn}</p>
                  <p className="text-xs text-muted-foreground">Opted in</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-lg font-semibold">{welcomeStatus.sentNotOptedIn}</p>
                  <p className="text-xs text-muted-foreground">Sent, awaiting reply</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-lg font-semibold">{welcomeStatus.notSent}</p>
                  <p className="text-xs text-muted-foreground">Not sent yet</p>
                </div>
              </div>
            )}

            {/* Send welcome to all */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Send Welcome to Existing Members</p>
              <p className="text-xs text-muted-foreground">
                Send the welcome template to all active members who haven't received it yet.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setWelcomeAllResult(null);
                  setWelcomeAllError(null);
                  sendWelcomeToAll(undefined, {
                    onSuccess: (res) => setWelcomeAllResult(res.data),
                    onError: (err: unknown) => setWelcomeAllError(
                      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to send."
                    ),
                  });
                }}
                disabled={isSendingWelcome}
              >
                {isSendingWelcome ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
                Send Welcome to All
              </Button>
              {welcomeAllResult && (
                <p className="text-xs font-medium text-green-600">
                  ✓ Sent {welcomeAllResult.sent} of {welcomeAllResult.total} messages
                  {welcomeAllResult.failed > 0 && ` (${welcomeAllResult.failed} failed)`}.
                </p>
              )}
              {welcomeAllError && <p className="text-xs text-destructive font-medium">✗ {welcomeAllError}</p>}
            </div>

            {/* Reset welcome */}
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Reset Welcome Status</p>
              <p className="text-xs text-muted-foreground">
                Clear the sent status so members can receive the welcome message again (useful if template was pending approval).
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setResetResult(null);
                  setResetError(null);
                  resetWelcome(undefined, {
                    onSuccess: (res) => setResetResult(res.data),
                    onError: (err: unknown) => setResetError(
                      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to reset."
                    ),
                  });
                }}
                disabled={isResetting}
              >
                {isResetting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RotateCcw className="mr-2 size-4" />}
                Reset All Welcome Status
              </Button>
              {resetResult && (
                <p className="text-xs font-medium text-green-600">
                  ✓ Reset {resetResult.reset} member{resetResult.reset !== 1 ? "s" : ""}.
                </p>
              )}
              {resetError && <p className="text-xs text-destructive font-medium">✗ {resetError}</p>}
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {!isConnected && (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <Smartphone className="mx-auto mb-3 size-8 opacity-40" />
          <p className="text-sm">Connect a WhatsApp number above to configure automated notifications for your members.</p>
        </div>
      )}
    </div>
  );
}
