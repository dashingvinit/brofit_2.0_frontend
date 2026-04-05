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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
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
import { StatCard } from "@/shared/components/stat-card";
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

/**
 * Given a list of attendance records, returns the busiest 1-hour window
 * based on entry times, e.g. { label: "6–7 PM", count: 8 }.
 * Returns null if there are no records.
 */
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

// ─── sub-components ───────────────────────────────────────────────────────────


function AttendanceRow({
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
  const phone = record.member?.phone ?? "";

  return (
    <tr className="border-b last:border-0 hover:bg-muted/40 transition-colors">
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground select-none">
            {record.member
              ? `${record.member.firstName[0]}${record.member.lastName[0]}`
              : "?"}
          </div>
          <div>
            <p className="font-medium text-sm leading-tight">{name}</p>
            <p className="text-xs text-muted-foreground">{phone}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-sm tabular-nums">{formatTime(record.entryTime)}</td>
      <td className="py-3 px-3 text-sm tabular-nums text-muted-foreground">
        {record.exitTime ? formatTime(record.exitTime) : "—"}
      </td>
      <td className="py-3 px-3 text-sm tabular-nums text-muted-foreground">
        {formatDuration(record.entryTime, record.exitTime)}
      </td>
      <td className="py-3 px-3">
        {isInside ? (
          <Badge
            variant="outline"
            className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 gap-1"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Inside
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Left
          </Badge>
        )}
      </td>
      <td className="py-3 px-3">
        {isInside && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => onCheckOut(record.id)}
            disabled={checkingOut}
          >
            <LogOut className="h-3 w-3" />
            Check Out
          </Button>
        )}
      </td>
    </tr>
  );
}

function MobileAttendanceCard({
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
  const phone = record.member?.phone ?? "";

  return (
    <div className="rounded-lg border p-3 bg-background">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground select-none">
            {record.member
              ? `${record.member.firstName[0]}${record.member.lastName[0]}`
              : "?"}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight truncate">{name}</p>
            <p className="text-xs text-muted-foreground">{phone}</p>
          </div>
        </div>
        {isInside ? (
          <Badge
            variant="outline"
            className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 gap-1 shrink-0"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Inside
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1 shrink-0">
            <CheckCircle2 className="h-3 w-3" />
            Left
          </Badge>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            In: <span className="font-medium text-foreground">{formatTime(record.entryTime)}</span>
          </span>
          {record.exitTime && (
            <span>
              Out:{" "}
              <span className="font-medium text-foreground">{formatTime(record.exitTime)}</span>
            </span>
          )}
          <span>{formatDuration(record.entryTime, record.exitTime)}</span>
        </div>
        {isInside && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 shrink-0"
            onClick={() => onCheckOut(record.id)}
            disabled={checkingOut}
          >
            <LogOut className="h-3 w-3" />
            Check Out
          </Button>
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

  // Debounce text search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Keypad: search when we have ≥3 digits
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

  // ── data ──
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
  const todayRecords = byDateRes?.data?.records ?? [];
  const searchResults = searchRes?.data ?? [];

  // Members already checked in today (by memberId) — prevent duplicate in search dropdown
  const checkedInMemberIds = new Set(insideRecords.map((r) => r.memberId));

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
    // Don't allow navigating to future dates
    if (d > new Date()) return;
    setSelectedDate(toDateString(d));
  }

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Records shown in the log section
  const logRecords = isToday ? todayRecords : byDateRes?.data?.records ?? [];
  const insideMemberIds = new Set(insideRecords.map((r) => r.memberId));

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

      {/* ── Stat Cards ── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 lg:gap-4">
        <StatCard
          label="Currently Inside"
          shortLabel="Inside"
          value={stats?.currentlyInside}
          icon={Users}
          colorClass="text-emerald-600 dark:text-emerald-400"
          bgClass="bg-emerald-50 dark:bg-emerald-950/50"
          isLoading={isLoadingStats}
        />
        <StatCard
          label="Total Visits Today"
          shortLabel="Today"
          value={stats?.totalToday}
          icon={CalendarDays}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50 dark:bg-blue-950/50"
          isLoading={isLoadingStats}
        />
        {/* Peak Hour — bespoke card since value is a time string, not a number */}
        <div className="col-span-2 lg:col-span-1">
          <Card className="overflow-hidden h-full">
            {/* Mobile compact */}
            <div className="p-3 lg:hidden">
              {isLoadingByDate ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ) : (() => {
                const peak = getPeakHour(byDateRes?.data?.records ?? []);
                return (
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg p-2 shrink-0 bg-violet-50 dark:bg-violet-950/50">
                      <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-muted-foreground leading-tight truncate">
                        Peak Hour
                      </p>
                      <p className="text-sm font-bold leading-tight tracking-tight truncate">
                        {peak ? peak.label : "—"}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Desktop full */}
            <div className="hidden lg:block">
              {isLoadingByDate ? (
                <>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </>
              ) : (() => {
                const peak = getPeakHour(byDateRes?.data?.records ?? []);
                return (
                  <>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Peak Hour
                      </CardTitle>
                      <div className="rounded-lg p-2 bg-violet-50 dark:bg-violet-950/50">
                        <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold tracking-tight font-display">
                        {peak ? peak.label : "—"}
                      </div>
                      {peak && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {peak.count} check-in{peak.count !== 1 ? "s" : ""}
                        </p>
                      )}
                      {!peak && (
                        <p className="text-xs text-muted-foreground mt-1">No data yet</p>
                      )}
                    </CardContent>
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Check-In Panel ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <LogIn className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Check In a Member
            </CardTitle>
            {/* Mode toggle */}
            <div className="flex items-center rounded-lg border p-0.5 bg-muted/50">
              <button
                onClick={() => switchMode("search")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  checkInMode === "search"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
              <button
                onClick={() => switchMode("keypad")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  checkInMode === "keypad"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                Keypad
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checkInMode === "search" ? (
            <>
              {/* Text search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by name or phone number..."
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
              {!debouncedSearch && (
                <p className="text-xs text-muted-foreground">
                  Type a name or phone number to find and check in a member.
                </p>
              )}
            </>
          ) : (
            /* Phone Keypad */
            <div className="space-y-3">
              {/* Display */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                <span className="text-xl font-mono tracking-widest font-semibold min-w-0 flex-1">
                  {keypadDigits || (
                    <span className="text-muted-foreground text-base font-normal font-sans">Enter phone number</span>
                  )}
                </span>
                {keypadDigits && (
                  <button
                    onClick={handleKeypadDelete}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-2"
                  >
                    <Delete className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Keypad grid */}
              <div className="grid grid-cols-3 gap-2">
                {["1","2","3","4","5","6","7","8","9","*","0","#"].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key !== "*" && key !== "#") handleKeypadPress(key);
                    }}
                    disabled={key === "*" || key === "#"}
                    className={`rounded-lg border py-3.5 text-lg font-semibold transition-colors select-none
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

              {!keypadDigits && (
                <p className="text-xs text-muted-foreground text-center">
                  Type at least 3 digits to search by phone number.
                </p>
              )}
            </div>
          )}

          {/* Search results — shared between both modes */}
          {debouncedSearch && (
            <div className="rounded-lg border bg-background divide-y overflow-hidden shadow-sm">
              {isSearching ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No members found for &quot;{debouncedSearch}&quot;
                </div>
              ) : (
                searchResults.map((member) => {
                  const alreadyIn = checkedInMemberIds.has(member.id);
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground select-none">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {!member.isActive && (
                          <Badge variant="secondary" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                        {alreadyIn ? (
                          <Badge
                            variant="outline"
                            className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-xs gap-1"
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            Inside
                          </Badge>
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
          )}
        </CardContent>
      </Card>

      {/* ── Currently Inside ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Currently Inside
              {!isLoadingInside && (
                <Badge variant="secondary" className="ml-1">
                  {insideRecords.length}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingInside ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-md" />
                </div>
              ))}
            </div>
          ) : insideRecords.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No members currently inside the gym.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Member
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Entry
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Exit
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Duration
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="py-2.5 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {insideRecords.map((record) => (
                      <AttendanceRow
                        key={record.id}
                        record={record}
                        isInside={true}
                        onCheckOut={handleCheckOut}
                        checkingOut={
                          checkOutMutation.isPending &&
                          checkOutMutation.variables === record.id
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="sm:hidden p-3 space-y-2">
                {insideRecords.map((record) => (
                  <MobileAttendanceCard
                    key={record.id}
                    record={record}
                    isInside={true}
                    onCheckOut={handleCheckOut}
                    checkingOut={
                      checkOutMutation.isPending &&
                      checkOutMutation.variables === record.id
                    }
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Daily Log ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Daily Log
            </CardTitle>
            {/* Date navigator */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => navigateDate(-1)}
                aria-label="Previous day"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium tabular-nums min-w-[130px] text-center">
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
                  className="h-7 text-xs text-muted-foreground ml-1"
                  onClick={() => setSelectedDate(toDateString(new Date()))}
                >
                  Today
                </Button>
              )}
            </div>
          </div>
          {!isLoadingByDate && byDateRes?.data && (
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">
                  {byDateRes.data.totalVisits}
                </span>{" "}
                total visits
              </span>
              {isToday && (
                <span>
                  <span className="font-medium text-foreground">
                    {byDateRes.data.currentlyInside}
                  </span>{" "}
                  still inside
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingByDate ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : logRecords.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No attendance records for this date.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Member
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Entry
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Exit
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Duration
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="py-2.5 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {logRecords.map((record) => (
                      <AttendanceRow
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
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="sm:hidden p-3 space-y-2">
                {logRecords.map((record) => (
                  <MobileAttendanceCard
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
            </>
          )}
        </CardContent>
      </Card>

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
