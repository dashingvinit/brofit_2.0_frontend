import { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  LogIn,
  LogOut,
  Users,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Hash,
  Delete,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { PageHeader } from "@/shared/components/page-header";
import {
  useAttendanceInside,
  useAttendanceTodayStats,
  useAttendanceByDate,
  useCheckIn,
  useCheckOut,
} from "../hooks/use-attendance";
import { useSearchMembers } from "@/features/members/hooks/use-members";
import type { AttendanceRecord } from "@/shared/types/common.types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(entryIso: string, exitIso: string | null) {
  const entry = new Date(entryIso);
  const exit = exitIso ? new Date(exitIso) : new Date();
  const mins = Math.floor((exit.getTime() - entry.getTime()) / 60_000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPeakHour(records: { entryTime: string }[]): { label: string; count: number } | null {
  if (records.length === 0) return null;
  const buckets: Record<number, number> = {};
  for (const r of records) {
    const h = new Date(r.entryTime).getHours();
    buckets[h] = (buckets[h] ?? 0) + 1;
  }
  const peakHour = Number(
    Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0],
  );
  const count = buckets[peakHour];
  const fmt = (h: number) =>
    new Date(0, 0, 0, h).toLocaleTimeString("en-IN", {
      hour: "numeric",
      hour12: true,
    });
  return { label: `${fmt(peakHour)} – ${fmt(peakHour + 1)}`, count };
}

// ─── Inside member card (right column) ────────────────────────────────────────

function InsideCard({
  record,
  onCheckOut,
  checkingOut,
}: {
  record: AttendanceRecord;
  onCheckOut: (id: string) => void;
  checkingOut: boolean;
}) {
  const name = record.member
    ? `${record.member.firstName} ${record.member.lastName}`
    : "—";
  const initials = record.member
    ? `${record.member.firstName[0]}${record.member.lastName[0]}`
    : "?";
  const phone = record.member?.phone ?? "";
  const activePlan = record.member?.memberships?.[0];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group">
      {/* Avatar */}
      <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-400 select-none">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{phone}</p>
        {activePlan ? (
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5 truncate">
            {activePlan.planVariant.planType.name} · {activePlan.planVariant.durationLabel}
          </p>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-0.5">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            No active plan
          </p>
        )}
      </div>

      {/* Time + checkout */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <Clock className="h-3 w-3" />
          {formatTime(record.entryTime)}
        </div>
        <div className="text-[11px] text-muted-foreground/70 tabular-nums">
          {formatDuration(record.entryTime, null)}
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
        onClick={() => onCheckOut(record.id)}
        disabled={checkingOut}
      >
        <LogOut className="h-3 w-3" />
        Out
      </Button>
    </div>
  );
}

// ─── Daily log row ─────────────────────────────────────────────────────────────

function LogRow({
  record,
  isInside,
  onCheckOut,
  checkingOut,
}: {
  record: AttendanceRecord;
  isInside: boolean;
  onCheckOut: (id: string) => void;
  checkingOut: boolean;
}) {
  const name = record.member
    ? `${record.member.firstName} ${record.member.lastName}`
    : "—";
  const initials = record.member
    ? `${record.member.firstName[0]}${record.member.lastName[0]}`
    : "?";
  const phone = record.member?.phone ?? "";
  const activePlan = record.member?.memberships?.[0];

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 border-b last:border-0 hover:bg-muted/30 transition-colors group">
      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-[11px] font-semibold text-muted-foreground select-none">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">{phone}</p>
        {activePlan ? (
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
            {activePlan.planVariant.planType.name} · {activePlan.planVariant.durationLabel}
          </p>
        ) : (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
            No active plan
          </p>
        )}
      </div>
      {/* Times */}
      <div className="hidden sm:flex items-center gap-4 text-xs tabular-nums text-muted-foreground shrink-0">
        <span className="text-foreground font-medium">{formatTime(record.entryTime)}</span>
        <span>{record.exitTime ? formatTime(record.exitTime) : "—"}</span>
        <span>{formatDuration(record.entryTime, record.exitTime)}</span>
      </div>
      {/* Status / action */}
      <div className="shrink-0">
        {isInside ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => onCheckOut(record.id)}
            disabled={checkingOut}
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">Check Out</span>
            <span className="sm:hidden">Out</span>
          </Button>
        ) : (
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            Left
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [checkOutTarget, setCheckOutTarget] = useState<string | null>(null);
  const [checkInMode, setCheckInMode] = useState<"search" | "keypad">("search");
  const [keypadDigits, setKeypadDigits] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const isToday = selectedDate === toDateString(new Date());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (checkInMode !== "keypad") return;
    if (keypadDigits.length >= 3) {
      setDebouncedSearch(keypadDigits);
    } else {
      setDebouncedSearch("");
    }
  }, [keypadDigits, checkInMode]);

  function handleKeypadPress(digit: string) {
    if (keypadDigits.length >= 10) return;
    setKeypadDigits((prev) => prev + digit);
  }

  function handleKeypadDelete() {
    setKeypadDigits((prev) => prev.slice(0, -1));
  }

  function handleKeypadClear() {
    setKeypadDigits("");
    setDebouncedSearch("");
  }

  function switchMode(mode: "search" | "keypad") {
    setCheckInMode(mode);
    setSearchQuery("");
    setDebouncedSearch("");
    setKeypadDigits("");
  }

  const { data: statsRes, isLoading: isLoadingStats } = useAttendanceTodayStats();
  const { data: insideRes, isLoading: isLoadingInside } = useAttendanceInside();
  const { data: byDateRes, isLoading: isLoadingByDate, refetch: refetchByDate } =
    useAttendanceByDate(isToday ? undefined : selectedDate);

  const { data: searchRes, isLoading: isSearching } = useSearchMembers({
    q: debouncedSearch,
    limit: 6,
  });

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const stats = statsRes?.data;
  const insideRecords = insideRes?.data?.records ?? [];
  const logRecords = isToday ? (byDateRes?.data?.records ?? []) : (byDateRes?.data?.records ?? []);
  const searchResults = searchRes?.data ?? [];

  const insideMemberMap = new Map(insideRecords.map((r) => [r.memberId, r.id]));
  const checkedInMemberIds = new Set(insideRecords.map((r) => r.memberId));
  const insideMemberIds = new Set(insideRecords.map((r) => r.memberId));

  function handleCheckIn(memberId: string) {
    setSearchQuery("");
    setDebouncedSearch("");
    checkInMutation.mutate({ memberId });
  }

  function handleCheckOut(attendanceId: string) {
    setCheckOutTarget(attendanceId);
  }

  function confirmCheckOut() {
    if (!checkOutTarget) return;
    checkOutMutation.mutate(checkOutTarget, {
      onSettled: () => setCheckOutTarget(null),
    });
  }

  function navigateDate(dir: -1 | 1) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    if (d > new Date()) return;
    setSelectedDate(toDateString(d));
  }

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const peak = getPeakHour(byDateRes?.data?.records ?? []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance"
        description={todayLabel()}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchByDate()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      {/* ── Two-column layout on desktop ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ══ LEFT COLUMN — sticky action zone ══ */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-4 space-y-3">

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-2">
            {/* Currently Inside */}
            <div className="rounded-lg border bg-card px-3 py-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Inside</span>
              </div>
              {isLoadingStats ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <span className="text-xl font-bold tabular-nums leading-none">{stats?.currentlyInside ?? 0}</span>
              )}
            </div>

            {/* Total Today */}
            <div className="rounded-lg border bg-card px-3 py-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Today</span>
              </div>
              {isLoadingStats ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <span className="text-xl font-bold tabular-nums leading-none">{stats?.totalToday ?? 0}</span>
              )}
            </div>

            {/* Peak Hour */}
            <div className="rounded-lg border bg-card px-3 py-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-violet-500" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Peak</span>
              </div>
              {isLoadingByDate ? (
                <Skeleton className="h-6 w-14" />
              ) : (
                <span className="text-sm font-bold leading-none truncate">{peak ? peak.label : "—"}</span>
              )}
            </div>
          </div>

          {/* Check-in card */}
          <div className="rounded-lg border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold">Check In</span>
              </div>
              {/* Mode toggle */}
              <div className="flex items-center rounded-md border p-0.5 bg-muted/50">
                <button
                  onClick={() => switchMode("search")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    checkInMode === "search"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Search className="h-3 w-3" />
                  Search
                </button>
                <button
                  onClick={() => switchMode("keypad")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    checkInMode === "keypad"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Hash className="h-3 w-3" />
                  Keypad
                </button>
              </div>
            </div>

            <div className="px-4 pb-4 space-y-3">
              {checkInMode === "search" ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchRef}
                    type="text"
                    placeholder="Name or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-10"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setDebouncedSearch("");
                        searchRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                /* Phone Keypad */
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2.5">
                    <span className="text-lg font-mono tracking-widest font-semibold min-w-0 flex-1">
                      {keypadDigits || (
                        <span className="text-muted-foreground text-sm font-normal font-sans">Enter phone number</span>
                      )}
                    </span>
                    {keypadDigits && (
                      <button
                        onClick={handleKeypadDelete}
                        className="text-muted-foreground hover:text-foreground transition-colors ml-2"
                      >
                        <Delete className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["1","2","3","4","5","6","7","8","9","*","0","#"].map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (key !== "*" && key !== "#") handleKeypadPress(key);
                        }}
                        disabled={key === "*" || key === "#"}
                        className={`rounded-lg border py-3 text-base font-semibold transition-colors select-none
                          ${key === "*" || key === "#"
                            ? "opacity-0 pointer-events-none"
                            : "bg-background hover:bg-muted active:scale-95 active:bg-muted"
                          }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                  {keypadDigits && (
                    <button
                      onClick={handleKeypadClear}
                      className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Search results */}
              {debouncedSearch && (
                <div className="rounded-lg border bg-background divide-y overflow-hidden shadow-sm">
                  {isSearching ? (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-7 w-16 rounded-md" />
                        </div>
                      ))}
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No members found
                    </div>
                  ) : (
                    searchResults.map((member) => {
                      const alreadyIn = checkedInMemberIds.has(member.id);
                      const plan = member.memberships?.[0];
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-2.5 p-2.5 hover:bg-muted/40 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground select-none">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight truncate">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{member.phone}</p>
                            {plan ? (
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                                {plan.planVariant.planType.name} · {plan.planVariant.durationLabel}
                              </p>
                            ) : (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                No active plan
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5">
                            {!member.isActive && (
                              <Badge variant="secondary" className="text-[10px]">
                                Inactive
                              </Badge>
                            )}
                            {alreadyIn ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                onClick={() => {
                                  const recordId = insideMemberMap.get(member.id);
                                  if (recordId) {
                                    handleCheckOut(recordId);
                                    if (checkInMode === "keypad") handleKeypadClear();
                                    else { setSearchQuery(""); setDebouncedSearch(""); }
                                  }
                                }}
                                disabled={checkOutMutation.isPending}
                              >
                                <LogOut className="h-3 w-3" />
                                Out
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  handleCheckIn(member.id);
                                  if (checkInMode === "keypad") handleKeypadClear();
                                }}
                                disabled={checkInMutation.isPending}
                              >
                                <LogIn className="h-3 w-3" />
                                In
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {!debouncedSearch && checkInMode === "search" && (
                <p className="text-xs text-muted-foreground">
                  Type a name or phone number to find a member.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN — live state + log ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Currently Inside */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm font-semibold">Currently Inside</span>
                {!isLoadingInside && (
                  <Badge variant="secondary" className="text-xs">
                    {insideRecords.length}
                  </Badge>
                )}
              </div>
            </div>

            {isLoadingInside ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-7 w-14 rounded-md" />
                  </div>
                ))}
              </div>
            ) : insideRecords.length === 0 ? (
              <div className="py-10 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No members inside right now</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {insideRecords.map((record) => (
                  <InsideCard
                    key={record.id}
                    record={record}
                    onCheckOut={handleCheckOut}
                    checkingOut={
                      checkOutMutation.isPending &&
                      checkOutMutation.variables === record.id
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Daily Log */}
          <div className="rounded-lg border bg-card overflow-hidden">
            {/* Header with date nav */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold">Daily Log</span>
                {!isLoadingByDate && byDateRes?.data && (
                  <span className="text-xs text-muted-foreground">
                    {byDateRes.data.totalVisits} visit{byDateRes.data.totalVisits !== 1 ? "s" : ""}
                    {isToday && byDateRes.data.currentlyInside > 0 && (
                      <> · {byDateRes.data.currentlyInside} still inside</>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigateDate(-1)}
                  aria-label="Previous day"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium tabular-nums min-w-[100px] text-center">
                  {isToday ? "Today" : displayDate}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigateDate(1)}
                  disabled={isToday}
                  aria-label="Next day"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isToday && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => setSelectedDate(toDateString(new Date()))}
                  >
                    Today
                  </Button>
                )}
              </div>
            </div>

            {isLoadingByDate ? (
              <div className="p-3 space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : logRecords.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No records for this date</p>
              </div>
            ) : (
              <div>
                {logRecords.map((record) => (
                  <LogRow
                    key={record.id}
                    record={record}
                    isInside={isToday && insideMemberIds.has(record.memberId)}
                    onCheckOut={handleCheckOut}
                    checkingOut={
                      checkOutMutation.isPending &&
                      checkOutMutation.variables === record.id
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Check-Out Confirmation ── */}
      <AlertDialog
        open={!!checkOutTarget}
        onOpenChange={(open) => !open && setCheckOutTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-Out</AlertDialogTitle>
            <AlertDialogDescription>
              This will record the exit time for this member. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={checkOutMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCheckOut}
              disabled={checkOutMutation.isPending}
            >
              {checkOutMutation.isPending ? "Checking out…" : "Check Out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
