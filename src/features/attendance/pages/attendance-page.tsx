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

// ─── On-the-Floor chip ────────────────────────────────────────────────────────

function FloorChip({
  record,
  onCheckOut,
  checkingOut,
}: {
  record: AttendanceRecord;
  onCheckOut: (id: string) => void;
  checkingOut: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const initials = record.member
    ? `${record.member.firstName[0]}${record.member.lastName[0]}`
    : "?";
  const activePlan = record.member?.memberships?.[0];
  const hasNoPlan = !activePlan;
  const name = record.member ? `${record.member.firstName} ${record.member.lastName}` : "—";

  return (
    <div
      className={`
        flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border bg-card
        hover:bg-muted/40 hover:border-foreground/20 transition-all shrink-0 cursor-pointer relative
        ${hasNoPlan ? "border-amber-200 dark:border-amber-800/60" : ""}
        ${expanded ? "ring-2 ring-ring" : ""}
      `}
      style={{ minWidth: "76px" }}
      onClick={() => setExpanded((v) => !v)}
      title={`${name} · ${formatTime(record.entryTime)}`}
    >
      {/* Avatar */}
      <div className={`
        h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold select-none
        ${hasNoPlan
          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
        }
      `}>
        {initials}
      </div>
      <span className="text-[11px] font-medium leading-tight text-center w-full truncate">
        {record.member?.firstName ?? "—"}
      </span>
      <span className="text-[10px] text-muted-foreground tabular-nums">
        {formatDuration(record.entryTime, null)}
      </span>
      {hasNoPlan && (
        <span className="absolute top-1.5 right-1.5">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
        </span>
      )}
      {/* Expanded detail strip */}
      {expanded && (
        <div
          className="absolute top-full left-0 mt-1.5 z-10 bg-card border rounded-xl shadow-lg p-3 w-56 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-semibold text-sm leading-tight">{name}</p>
          <p className="text-xs text-muted-foreground mb-2">{record.member?.phone}</p>
          {activePlan ? (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
              {activePlan.planVariant.planType.name} · {activePlan.planVariant.durationLabel}
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mb-2">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              No active plan
            </p>
          )}
          <div className="flex justify-between text-xs text-muted-foreground mb-3">
            <span>In: <span className="text-foreground font-medium tabular-nums">{formatTime(record.entryTime)}</span></span>
            <span className="tabular-nums">{formatDuration(record.entryTime, null)}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 text-xs h-7"
            onClick={() => { onCheckOut(record.id); setExpanded(false); }}
            disabled={checkingOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            Check Out
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Roster table row ─────────────────────────────────────────────────────────

function RosterRow({
  index,
  record,
  isInside,
  onCheckOut,
  checkingOut,
}: {
  index: number;
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
  const activePlan = record.member?.memberships?.[0];

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      {/* # */}
      <td className="py-3 pl-4 pr-2 text-xs text-muted-foreground/50 tabular-nums font-medium w-8 select-none">
        {index + 1}
      </td>
      {/* Member */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-2.5">
          <div className={`
            h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold select-none
            ${isInside
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
            }
          `}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight truncate">{name}</p>
            <p className="text-[11px] text-muted-foreground">{record.member?.phone}</p>
          </div>
        </div>
      </td>
      {/* Plan */}
      <td className="py-3 px-2 hidden md:table-cell">
        {activePlan ? (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            {activePlan.planVariant.planType.name}
            <span className="text-muted-foreground font-normal"> · {activePlan.planVariant.durationLabel}</span>
          </span>
        ) : (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            No plan
          </span>
        )}
      </td>
      {/* In */}
      <td className="py-3 px-2 text-sm tabular-nums text-muted-foreground hidden sm:table-cell">
        {formatTime(record.entryTime)}
      </td>
      {/* Out */}
      <td className="py-3 px-2 text-sm tabular-nums text-muted-foreground hidden sm:table-cell">
        {record.exitTime ? formatTime(record.exitTime) : "—"}
      </td>
      {/* Duration */}
      <td className="py-3 px-2 text-sm tabular-nums text-muted-foreground hidden sm:table-cell">
        {formatDuration(record.entryTime, record.exitTime)}
      </td>
      {/* Action */}
      <td className="py-3 pl-2 pr-4 text-right">
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
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Left</span>
          </span>
        )}
      </td>
    </tr>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
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
    setDebouncedSearch(keypadDigits.length >= 3 ? keypadDigits : "");
  }, [keypadDigits, checkInMode]);

  function handleKeypadPress(digit: string) {
    if (keypadDigits.length >= 10) return;
    setKeypadDigits((prev) => prev + digit);
  }
  function handleKeypadDelete() { setKeypadDigits((prev) => prev.slice(0, -1)); }
  function handleKeypadClear() { setKeypadDigits(""); setDebouncedSearch(""); }
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
  const { data: searchRes, isLoading: isSearching } = useSearchMembers({ q: debouncedSearch, limit: 6 });
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const stats = statsRes?.data;
  const insideRecords = insideRes?.data?.records ?? [];
  const logRecords = byDateRes?.data?.records ?? [];
  const searchResults = searchRes?.data ?? [];
  const peak = getPeakHour(byDateRes?.data?.records ?? []);

  const insideMemberMap = new Map(insideRecords.map((r) => [r.memberId, r.id]));
  const checkedInMemberIds = new Set(insideRecords.map((r) => r.memberId));
  const insideMemberIds = new Set(insideRecords.map((r) => r.memberId));

  function handleCheckIn(memberId: string) {
    setSearchQuery("");
    setDebouncedSearch("");
    checkInMutation.mutate({ memberId });
  }
  function handleCheckOut(attendanceId: string) { setCheckOutTarget(attendanceId); }
  function confirmCheckOut() {
    if (!checkOutTarget) return;
    checkOutMutation.mutate(checkOutTarget, { onSettled: () => setCheckOutTarget(null) });
  }
  function navigateDate(dir: -1 | 1) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    if (d > new Date()) return;
    setSelectedDate(toDateString(d));
  }

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={todayLabel()}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetchByDate()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      {/* ══ SECTION 1: Check In ══ */}
      <div>
        <SectionLabel>Check In</SectionLabel>

        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Search bar + mode toggle */}
          <div className="flex items-center gap-0 border-b">
            {checkInMode === "search" ? (
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by name or phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-10 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                  autoComplete="off"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setDebouncedSearch(""); searchRef.current?.focus(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-3 px-4 h-12">
                <span className="text-lg font-mono tracking-widest font-semibold min-w-0 flex-1">
                  {keypadDigits || <span className="text-muted-foreground text-sm font-normal font-sans">Enter phone number</span>}
                </span>
                {keypadDigits && (
                  <button onClick={handleKeypadDelete} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Delete className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            {/* Mode toggle — right edge of bar */}
            <div className="flex items-center border-l h-12 shrink-0">
              <button
                onClick={() => switchMode("search")}
                className={`flex items-center gap-1.5 h-full px-3.5 text-xs font-medium transition-colors ${
                  checkInMode === "search" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={() => switchMode("keypad")}
                className={`flex items-center gap-1.5 h-full px-3.5 text-xs font-medium border-l transition-colors ${
                  checkInMode === "keypad" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Keypad</span>
              </button>
            </div>
          </div>

          {/* Keypad grid */}
          {checkInMode === "keypad" && (
            <div className="p-4 border-b">
              <div className="grid grid-cols-3 gap-2 max-w-xs">
                {["1","2","3","4","5","6","7","8","9","*","0","#"].map((key) => (
                  <button
                    key={key}
                    onClick={() => { if (key !== "*" && key !== "#") handleKeypadPress(key); }}
                    disabled={key === "*" || key === "#"}
                    className={`rounded-lg border py-3 text-base font-semibold transition-colors select-none ${
                      key === "*" || key === "#"
                        ? "opacity-0 pointer-events-none"
                        : "bg-background hover:bg-muted active:scale-95"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
              {keypadDigits && (
                <button onClick={handleKeypadClear} className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Search results */}
          {debouncedSearch ? (
            <div className="divide-y">
              {isSearching ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-36" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No members found for &ldquo;{debouncedSearch}&rdquo;
                </div>
              ) : (
                searchResults.map((member) => {
                  const alreadyIn = checkedInMemberIds.has(member.id);
                  const plan = member.memberships?.[0];
                  return (
                    <div key={member.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold select-none ${
                        alreadyIn
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm leading-tight">{member.firstName} {member.lastName}</p>
                          {!member.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                          {alreadyIn && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                              </span>
                              Inside
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                        {plan ? (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {plan.planVariant.planType.name} · {plan.planVariant.durationLabel}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            No active plan
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {alreadyIn ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
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
                            <LogOut className="h-3.5 w-3.5" />
                            Check Out
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => {
                              handleCheckIn(member.id);
                              if (checkInMode === "keypad") handleKeypadClear();
                            }}
                            disabled={checkInMutation.isPending}
                          >
                            <LogIn className="h-3.5 w-3.5" />
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Stat pills when idle */
            <div className="flex items-center gap-6 px-4 py-3 text-xs text-muted-foreground">
              {isLoadingStats ? (
                <>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="font-semibold text-foreground">{stats?.currentlyInside ?? 0}</span> inside
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-semibold text-foreground">{stats?.totalToday ?? 0}</span> today
                  </span>
                  {peak && (
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
                      Peak <span className="font-semibold text-foreground">{peak.label}</span>
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ SECTION 2: On the Floor ══ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            On the Floor
          </span>
          {!isLoadingInside && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {insideRecords.length} {insideRecords.length === 1 ? "member" : "members"}
            </span>
          )}
          <div className="flex-1 h-px bg-border" />
          {insideRecords.some(r => !r.member?.memberships?.[0]) && (
            <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="h-3 w-3" />
              Some without plans
            </span>
          )}
        </div>

        {isLoadingInside ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border bg-card shrink-0" style={{ minWidth: "72px" }}>
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            ))}
          </div>
        ) : insideRecords.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card/50 py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No members on the floor</p>
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {insideRecords.map((record) => (
              <FloorChip
                key={record.id}
                record={record}
                onCheckOut={handleCheckOut}
                checkingOut={checkOutMutation.isPending && checkOutMutation.variables === record.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ══ SECTION 3: Today's Roster ══ */}
      <div>
        {/* Section header with date nav */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
            {isToday ? "Today's Roster" : "Roster"}
          </span>
          {!isLoadingByDate && byDateRes?.data && (
            <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
              {byDateRes.data.totalVisits} {byDateRes.data.totalVisits === 1 ? "visit" : "visits"}
            </span>
          )}
          <div className="flex-1 h-px bg-border" />
          {/* Date nav */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigateDate(-1)} aria-label="Previous day">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium tabular-nums px-1.5 min-w-[80px] text-center">
              {isToday ? "Today" : displayDate}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigateDate(1)} disabled={isToday} aria-label="Next day">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            {!isToday && (
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground px-2" onClick={() => setSelectedDate(toDateString(new Date()))}>
                Today
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {isLoadingByDate ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-16 hidden md:block" />
                  <Skeleton className="h-4 w-12 hidden sm:block" />
                  <Skeleton className="h-4 w-12 hidden sm:block" />
                  <Skeleton className="h-4 w-12 hidden sm:block" />
                  <Skeleton className="h-7 w-20" />
                </div>
              ))}
            </div>
          ) : logRecords.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No attendance records for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left py-2.5 pl-4 pr-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-8">#</th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Member</th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Plan</th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">In</th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Out</th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Duration</th>
                    <th className="py-2.5 pl-2 pr-4" />
                  </tr>
                </thead>
                <tbody>
                  {logRecords.map((record, i) => (
                    <RosterRow
                      key={record.id}
                      index={i}
                      record={record}
                      isInside={isToday && insideMemberIds.has(record.memberId)}
                      onCheckOut={handleCheckOut}
                      checkingOut={checkOutMutation.isPending && checkOutMutation.variables === record.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Check-Out Confirmation ── */}
      <AlertDialog open={!!checkOutTarget} onOpenChange={(open) => !open && setCheckOutTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Check-Out</AlertDialogTitle>
            <AlertDialogDescription>
              This will record the exit time for this member. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={checkOutMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCheckOut} disabled={checkOutMutation.isPending}>
              {checkOutMutation.isPending ? "Checking out…" : "Check Out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
