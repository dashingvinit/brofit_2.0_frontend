import {
  MessageCircle, CheckCircle2, Zap, BellRing, UserPlus, CreditCard,
  Send, Calendar, BarChart2, Smartphone, Bot, Megaphone,
  Tag, MessageSquare, Rocket, ArrowRight, Info, Radio,
  RefreshCcw, ScanLine,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/shared/components/page-header";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/lib/constants";
import type { LucideIcon } from "lucide-react";

interface LiveFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ComingSoonFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
}

const liveFeatures: LiveFeature[] = [
  {
    icon: Smartphone,
    title: "WhatsApp Connection",
    description: "Your gym's dedicated WhatsApp Business number. Members receive messages under your gym's name — never a generic sender.",
  },
  {
    icon: BellRing,
    title: "Daily Digest",
    description: "A 7 AM morning summary of expiring memberships, recently expired members, and pending dues — straight to your WhatsApp.",
  },
  {
    icon: MessageCircle,
    title: "Renewal Reminders",
    description: "Auto-remind members before their membership expires. Configurable lead time — 3, 5, or 7 days before expiry.",
  },
  {
    icon: CreditCard,
    title: "Dues Reminders",
    description: "Chase pending payments automatically. Members with outstanding dues receive a friendly nudge after a configurable grace period.",
  },
  {
    icon: UserPlus,
    title: "Welcome Messages",
    description: "Every new member gets a warm WhatsApp welcome on registration. First impression, fully automated.",
  },
];

const comingSoonFeatures: ComingSoonFeature[] = [
  {
    icon: MessageSquare,
    title: "Two-Way Chat",
    description: "Members reply to automated messages and your staff sees the full thread in the Inbox — real conversations, not one-way blasts.",
    tag: "Q2 2025",
  },
  {
    icon: Calendar,
    title: "Birthday Greetings",
    description: "Delight members on their birthday with a personalised WhatsApp message. Auto-scheduled, zero manual effort.",
    tag: "Q2 2025",
  },
  {
    icon: ScanLine,
    title: "Attendance Confirmations",
    description: "Notify members the moment they're marked present — a real-time check-in confirmation that makes your gym feel premium.",
    tag: "Q3 2025",
  },
  {
    icon: Bot,
    title: "Member Chatbot",
    description: "Members message your number to check expiry, pending dues, or membership status — no staff intervention needed.",
    tag: "Q3 2025",
  },
  {
    icon: Radio,
    title: "Campaign Broadcast",
    description: "Design rich WhatsApp campaigns. Target segments — active, expiring, lapsed — and schedule blasts in advance.",
    tag: "Q3 2025",
  },
  {
    icon: RefreshCcw,
    title: "Re-engagement Flows",
    description: "Detect lapsed members automatically and trigger a multi-step re-engagement sequence to win them back.",
    tag: "Q4 2025",
  },
  {
    icon: Tag,
    title: "Offer Promotions",
    description: "Push new plan launches and special offers directly to members' WhatsApp — targeted by plan type, gender, or status.",
    tag: "Q4 2025",
  },
  {
    icon: BarChart2,
    title: "Messaging Analytics",
    description: "Track delivery rates, read rates, and renewal conversions per message type. Know exactly what drives results.",
    tag: "Q4 2025",
  },
];

const heroStats = [
  { label: "Messages sent", value: "1,248", icon: Send },
  { label: "Delivery rate", value: "98.2%", icon: CheckCircle2 },
  { label: "Credits available", value: "186", icon: Zap },
];

export function WhatsAppHubPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="WhatsApp"
        description="Automated member communication via WhatsApp Business"
      />

      {/* Hero Banner */}
      <Card className="border-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 text-white overflow-hidden relative">
        <div className="absolute -top-10 -right-10 size-52 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-16 -left-6 size-72 rounded-full bg-white/5 pointer-events-none" />
        <CardContent className="p-5 relative">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <MessageCircle className="size-5 shrink-0" />
                <span className="font-semibold text-lg">WhatsApp Business Hub</span>
                <Badge className="bg-white/20 text-white border-0 text-xs hover:bg-white/20">
                  <span className="mr-1 inline-block size-1.5 rounded-full bg-white animate-pulse" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-emerald-100 max-w-md">
                Your gym's automated messaging backbone. Renewals, dues, welcomes, and soon much more — all delivered from your own WhatsApp Business number.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {heroStats.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm"
                  >
                    <Icon className="size-3.5" />
                    <span className="font-semibold">{value}</span>
                    <span className="text-emerald-200 text-xs">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="shrink-0 bg-white/20 hover:bg-white/30 text-white border-0 shadow-none"
            >
              <Link to={ROUTES.SETTINGS_WHATSAPP}>
                Configure
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Today */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Today</span>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {liveFeatures.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-t-2 border-t-emerald-500 animate-in fade-in zoom-in-95 duration-300">
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
                      <Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium">{title}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 text-xs shrink-0"
                  >
                    Live
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Rocket className="size-4 text-violet-600 dark:text-violet-400" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coming Soon</span>
          <Badge variant="outline" className="text-xs text-violet-600 border-violet-300 dark:border-violet-700">
            Roadmap
          </Badge>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoonFeatures.map(({ icon: Icon, title, description, tag }) => (
            <Card key={title} className="relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 to-transparent dark:from-violet-950/20 dark:to-transparent pointer-events-none" />
              <CardContent className="p-4 space-y-2.5 relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-violet-50 dark:bg-violet-950/50 shrink-0">
                    <Icon className="size-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs text-violet-600 border-violet-200 bg-violet-50 dark:bg-violet-950/50 dark:border-violet-800 shrink-0"
                  >
                    {tag}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-muted-foreground">
        <Info className="size-4 shrink-0 text-amber-500 mt-0.5" />
        <p className="text-xs leading-relaxed">
          All WhatsApp features use your gym's own connected Business number — members always see{" "}
          <span className="font-medium text-foreground">your gym's name</span> as the sender, never a third-party service. New capabilities roll out progressively and are available to all gyms at no extra cost.
        </p>
      </div>
    </div>
  );
}
