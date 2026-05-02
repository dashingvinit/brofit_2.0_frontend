import { useState, useEffect, useRef } from "react";
import type { AttendanceRecord } from "@/shared/types/common.types";
import {
  LogIn,
  LogOut,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
import { PeakHoursChart } from "../components/peak-hours-chart";

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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── daily log row ────────────────────────────────────────────────────────────

function DailyLogRow({
  record,
  isStillInside,
  isChecking,
  onCheckOut,
}: {
  record: AttendanceRecord;
  isStillInside: boolean;
  isChecking: boolean;
  onCheckOut: (id: string) => void;
}) {
  const name = record.member
    ? `${record.member.firstName} ${record.member.lastName}`
    : "—";
  const initials = record.member
    ? `${record.member.firstName[0]}${record.member.lastName[0]}`
    : "?";
  const plan = record.member?.memberships?.[0];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
        isStillInside ? "opacity-50 hover:opacity-75" : "hover:bg-muted/30"
      }`}
    >
      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold select-none ${
        isStillInside
          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      }`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight truncate">{name}</p>
        {plan ? (
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
            {plan.planVariant.planType.name} · {plan.planVariant.durationLabel}
          </p>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            No plan
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums text-muted-foreground">
        <span className="hidden sm:block">{formatTime(record.entryTime)}</span>
        <span className="hidden sm:block">{record.exitTime ? formatTime(record.exitTime) : "—"}</span>
        <span className="hidden sm:block">{formatDuration(record.entryTime, record.exitTime)}</span>
        {isStillInside ? (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
            onClick={() => onCheckOut(record.id)} disabled={isChecking}>
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">Out</span>
          </Button>
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        )}
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export function AttendancePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [checkOutTarget, setCheckOutTarget] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isToday = selectedDate === toDateString(new Date());

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Reset highlight when results change
  useEffect(() => { setHighlightedIndex(0); }, [debouncedQuery]);

  // Data
  const { data: statsRes, isLoading: isLoadingStats } = useAttendanceTodayStats();
  const { data: insideRes } = useAttendanceInside();
  const { data: byDateRes, isLoading: isLoadingByDate, refetch: refetchByDate } =
    useAttendanceByDate(isToday ? undefined : selectedDate);
  const { data: searchRes, isLoading: isSearching } = useSearchMembers({
    q: debouncedQuery,
    limit: 8,
  });

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const stats = statsRes?.data;
  const insideRecords = insideRes?.data?.records ?? [];
  const logRecords = byDateRes?.data?.records ?? [];
  const searchResults = searchRes?.data ?? [];

  const insideMemberMap = new Map(insideRecords.map((r) => [r.memberId, r.id]));

  function handleCheckIn(memberId: string) {
    setQuery("");
    setDebouncedQuery("");
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
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + dir);
    if (toDateString(d) > toDateString(new Date())) return;
    setSelectedDate(toDateString(d));
  }

  const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  // Keyboard navigation over search results
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!searchResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const member = searchResults[highlightedIndex];
      if (!member) return;
      const alreadyIn = insideMemberMap.has(member.id);
      if (alreadyIn) {
        const recordId = insideMemberMap.get(member.id);
        if (recordId) handleCheckOut(recordId);
      } else {
        handleCheckIn(member.id);
      }
    } else if (e.key === "Escape") {
      setQuery("");
    }
  }

  return (
    <div className="space-y-4">
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

      {/* ══ COMMAND SURFACE ══ */}
      <div className="rounded-xl border bg-card overflow-visible">

        {/* Stat bar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30 flex-wrap">
          {isLoadingStats ? (
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ) : (
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="font-semibold text-foreground tabular-nums">{stats?.currentlyInside ?? 0}</span>
                {" "}inside
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-3 w-3 text-blue-500" />
                <span className="font-semibold text-foreground tabular-nums">{stats?.totalToday ?? 0}</span>
                {" "}today
              </span>
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <div className="flex items-center gap-3 px-4 h-14">
            <span className="text-muted-foreground/50 font-mono text-sm select-none shrink-0">›</span>
            <input
              ref={inputRef}
              type="text"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder="Search by name or phone number…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none caret-emerald-500"
            />
            {query && (
              <span className="text-[10px] text-muted-foreground/40 shrink-0 hidden sm:block">
                ↑↓ navigate · ↵ check in/out · esc clear
              </span>
            )}
          </div>

          {/* Results dropdown */}
          {debouncedQuery && (
            <div className="border-t">
              {isSearching ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-1 py-1.5">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-7 w-20 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No members found for &ldquo;{debouncedQuery}&rdquo;
                </div>
              ) : (
                <div>
                  {searchResults.map((member, i) => {
                    const alreadyIn = insideMemberMap.has(member.id);
                    const plan = member.memberships?.[0];
                    const isHighlighted = i === highlightedIndex;

                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-0 ${
                          isHighlighted ? "bg-muted/60" : "hover:bg-muted/30"
                        }`}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        onClick={() => {
                          if (alreadyIn) {
                            const recordId = insideMemberMap.get(member.id);
                            if (recordId) handleCheckOut(recordId);
                          } else {
                            handleCheckIn(member.id);
                          }
                        }}
                      >
                        {/* Row indicator */}
                        <span className="text-xs text-muted-foreground/30 font-mono w-4 shrink-0 select-none">
                          {isHighlighted ? "›" : ""}
                        </span>

                        {/* Avatar */}
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold select-none ${
                          alreadyIn
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {member.firstName[0]}{member.lastName[0]}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{member.firstName} {member.lastName}</span>
                            {(() => {
                              const lastEntry = member.attendances?.[0]?.entryTime;
                              const hasSharedPhone = searchResults.filter(m => m.phone === member.phone).length > 1;
                              if (!hasSharedPhone || !lastEntry) return null;
                              
                              const isMostRecent = searchResults
                                .filter(m => m.phone === member.phone && m.id !== member.id)
                                .every(m => !m.attendances?.[0]?.entryTime || m.attendances[0].entryTime < lastEntry);
                              
                              if (isMostRecent) {
                                return (
                                  <Badge variant="outline" className="text-[9px] h-4 border-blue-200 text-blue-600 uppercase font-bold bg-blue-50/50">Last Used</Badge>
                                );
                              }
                              return null;
                            })()}
                            {alreadyIn && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                                Inside
                              </span>
                            )}
                            {!member.isActive && (
                              <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground">{member.phone}</span>
                            {plan ? (
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                                {plan.planVariant.planType.name} · {plan.planVariant.durationLabel}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                No active plan
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        <div className="shrink-0">
                          {alreadyIn ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md px-2.5 py-1.5">
                              <LogOut className="h-3.5 w-3.5" />
                              Check Out
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-md px-2.5 py-1.5">
                              <LogIn className="h-3.5 w-3.5" />
                              Check In
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ PEAK HOURS CHART ══ */}
      <PeakHoursChart />

      {/* ══ CURRENTLY INSIDE + LOG — two columns on desktop ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

        {/* Currently Inside */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold">Currently Inside</span>
              <Badge variant="secondary" className="text-xs">
                {insideRecords.length}
              </Badge>
            </div>
          </div>

          {insideRecords.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="h-7 w-7 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No members inside</p>
            </div>
          ) : (
            <div className="divide-y">
              {insideRecords.map((record) => {
                const name = record.member
                  ? `${record.member.firstName} ${record.member.lastName}`
                  : "—";
                const initials = record.member
                  ? `${record.member.firstName[0]}${record.member.lastName[0]}`
                  : "?";
                const plan = record.member?.memberships?.[0];
                const isChecking = checkOutMutation.isPending && checkOutMutation.variables === record.id;

                return (
                  <div key={record.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-400 select-none">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight truncate">{name}</p>
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
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs tabular-nums text-muted-foreground">{formatTime(record.entryTime)}</p>
                        <p className="text-[11px] tabular-nums text-muted-foreground/60">{formatDuration(record.entryTime, null)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 opacity-60 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCheckOut(record.id)}
                        disabled={isChecking}
                      >
                        <LogOut className="h-3 w-3" />
                        Out
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Log */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold">Daily Log</span>
              {!isLoadingByDate && byDateRes?.data && (
                <span className="text-xs text-muted-foreground">
                  {byDateRes.data.totalVisits} visit{byDateRes.data.totalVisits !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-medium tabular-nums px-1.5 min-w-[80px] text-center">
                {isToday ? "Today" : displayDate}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateDate(1)} disabled={isToday}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              {!isToday && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground px-2"
                  onClick={() => setSelectedDate(toDateString(new Date()))}>
                  Today
                </Button>
              )}
            </div>
          </div>

          {isLoadingByDate ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : logRecords.length === 0 ? (
            <div className="py-10 text-center">
              <Clock className="h-7 w-7 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No records for this date</p>
            </div>
          ) : (() => {
            const checkedOut = logRecords.filter(r => !isToday || !insideMemberMap.has(r.memberId));
            const stillInside = isToday ? logRecords.filter(r => insideMemberMap.has(r.memberId)) : [];
            return (
              <div className="divide-y">
                {checkedOut.map(r => (
                  <DailyLogRow
                    key={r.id}
                    record={r}
                    isStillInside={false}
                    isChecking={checkOutMutation.isPending && checkOutMutation.variables === r.id}
                    onCheckOut={handleCheckOut}
                  />
                ))}
                {stillInside.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/20">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Still inside — {stillInside.length} {stillInside.length === 1 ? "member" : "members"}
                      </span>
                    </div>
                    {stillInside.map(r => (
                      <DailyLogRow
                        key={r.id}
                        record={r}
                        isStillInside={true}
                        isChecking={checkOutMutation.isPending && checkOutMutation.variables === r.id}
                        onCheckOut={handleCheckOut}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })()}
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
