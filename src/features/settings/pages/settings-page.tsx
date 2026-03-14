import { useState, useEffect } from "react";
import { Loader2, MessageCircle, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { PageHeader } from "@/shared/components/page-header";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "../hooks/use-notification-settings";

export function SettingsPage() {
  const { data: settings, isLoading } = useNotificationSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateNotificationSettings();

  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [memberReminderEnabled, setMemberReminderEnabled] = useState(false);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);

  useEffect(() => {
    if (settings) {
      setOwnerWhatsapp(settings.ownerWhatsapp ?? "");
      setDigestEnabled(settings.digestEnabled);
      setMemberReminderEnabled(settings.memberReminderEnabled);
      setReminderDaysBefore(settings.reminderDaysBefore);
    }
  }, [settings]);

  function handleSave() {
    updateSettings({
      ownerWhatsapp: ownerWhatsapp.trim() || null,
      digestEnabled,
      memberReminderEnabled,
      reminderDaysBefore,
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
      <PageHeader title="Settings" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            WhatsApp Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Owner number */}
          <div className="space-y-2">
            <Label htmlFor="owner-whatsapp">Your WhatsApp Number</Label>
            <Input
              id="owner-whatsapp"
              placeholder="+91 98765 43210"
              value={ownerWhatsapp}
              onChange={(e) => setOwnerWhatsapp(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g. +91 for India). Daily digests are sent to this number.
            </p>
          </div>

          {/* Daily digest toggle */}
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
            </div>
            <Switch checked={digestEnabled} onCheckedChange={setDigestEnabled} />
          </div>

          {/* Member reminder toggle */}
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

          {/* Reminder days — only shown when member reminders are on */}
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

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
