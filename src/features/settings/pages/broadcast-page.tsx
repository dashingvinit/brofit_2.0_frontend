import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useBroadcast } from "../hooks/use-notification-settings";
import { PageHeader } from "@/shared/components/page-header";
import type { BroadcastFilter } from "../api/settings-api";

export function BroadcastPage() {
  const { mutate: broadcast, isPending: isBroadcasting } = useBroadcast();
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastFilter, setBroadcastFilter] = useState<BroadcastFilter>("active");
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number; skipped: number; total: number } | null>(null);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  function handleBroadcast() {
    setBroadcastResult(null);
    setBroadcastError(null);
    broadcast(
      { message: broadcastMessage, filter: broadcastFilter },
      {
        onSuccess: (res) => {
          setBroadcastResult(res.data);
          setBroadcastMessage("");
        },
        onError: (err: unknown) => {
          setBroadcastError(
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Failed to send. Check your Twilio credentials."
          );
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Broadcast" />
      <Card>
      <CardHeader>
        <CardTitle>Broadcast Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Send a one-time WhatsApp message to a group of members. Use{" "}
          <code className="text-xs bg-muted px-1 rounded">{"{name}"}</code> to personalise each message.
          Only members who have opted in (replied YES to the welcome message) will receive it.
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

        {broadcastResult && broadcastResult.sent > 0 && (
          <p className="text-sm font-medium text-green-600">
            ✓ Sent {broadcastResult.sent} of {broadcastResult.total} messages
            {broadcastResult.failed > 0 && `, ${broadcastResult.failed} failed`}
            {broadcastResult.skipped > 0 && `, ${broadcastResult.skipped} skipped (not opted in)`}.
          </p>
        )}
        {broadcastResult && broadcastResult.sent === 0 && (
          <p className="text-sm font-medium text-destructive">
            ✗ No messages sent ({broadcastResult.skipped > 0 ? `${broadcastResult.skipped} members haven't opted in yet` : "check your Twilio credentials"}).
          </p>
        )}
        {broadcastError && (
          <p className="text-sm font-medium text-destructive">✗ {broadcastError}</p>
        )}

        <Button onClick={handleBroadcast} disabled={isBroadcasting || !broadcastMessage.trim()}>
          {isBroadcasting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
          Send Broadcast
        </Button>
      </CardContent>
    </Card>
  </div>
  );
}
