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
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  function handleBroadcast() {
    setBroadcastResult(null);
    broadcast(
      { message: broadcastMessage, filter: broadcastFilter },
      {
        onSuccess: (res) => {
          setBroadcastResult(res.data);
          setBroadcastMessage("");
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

        <Button onClick={handleBroadcast} disabled={isBroadcasting || !broadcastMessage.trim()}>
          {isBroadcasting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
          Send Broadcast
        </Button>
      </CardContent>
    </Card>
  </div>
  );
}
