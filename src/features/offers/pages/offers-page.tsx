import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Tag,
  Percent,
  Gift,
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  X,
  IndianRupee,
  Ticket,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageHeader } from "@/shared/components/page-header";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
import { useOffers, useDeleteOffer } from "../hooks/use-offers";
import { ROUTES } from "@/shared/lib/constants";
import type { Offer, OfferType } from "@/shared/types/common.types";
import { cn } from "@/shared/lib/utils";

type TypeFilter = "all" | OfferType;

// ── Type config ────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  OfferType,
  {
    label: string;
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    badgeClass: string;
  }
> = {
  discount: {
    label: "Discount",
    icon: Percent,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/50",
    borderClass: "border-t-emerald-500",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  },
  promo: {
    label: "Promo",
    icon: Gift,
    colorClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-50 dark:bg-violet-950/50",
    borderClass: "border-t-violet-500",
    badgeClass:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800",
  },
  event: {
    label: "Event",
    icon: Calendar,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/50",
    borderClass: "border-t-amber-500",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  },
  referral: {
    label: "Referral",
    icon: Users,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/50",
    borderClass: "border-t-blue-500",
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
  },
};

const FILTER_TABS: { value: TypeFilter; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All", icon: Tag },
  { value: "discount", label: "Discounts", icon: Percent },
  { value: "promo", label: "Promos", icon: Gift },
  { value: "event", label: "Events", icon: Calendar },
  { value: "referral", label: "Referrals", icon: Users },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OfferValueBadge({ offer }: { offer: Offer }) {
  if (offer.type === "referral" && offer.rewardAmount != null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-bold text-blue-600 dark:text-blue-400">
        <IndianRupee className="h-3.5 w-3.5" />
        {offer.rewardAmount.toLocaleString()} reward
      </span>
    );
  }
  if (offer.type === "discount" || offer.type === "promo") {
    if (offer.targetPrice != null) {
      return (
        <span className="inline-flex items-center gap-0.5 text-sm font-bold text-foreground">
          <IndianRupee className="h-3.5 w-3.5" />
          {offer.targetPrice.toLocaleString()} fixed
        </span>
      );
    }
    if (offer.discountValue != null) {
      return (
        <span className="text-sm font-bold text-foreground">
          {offer.discountType === "percentage"
            ? `${offer.discountValue}% off`
            : `₹${offer.discountValue.toLocaleString()} off`}
        </span>
      );
    }
  }
  return null;
}

// ── OfferCard ─────────────────────────────────────────────────────────────────
function OfferCard({
  offer,
  onEdit,
  onDelete,
  index,
}: {
  offer: Offer;
  onEdit: (o: Offer) => void;
  onDelete: (o: Offer) => void;
  index: number;
}) {
  const cfg = TYPE_CONFIG[offer.type];
  const Icon = cfg.icon;
  const startFmt = formatDate(offer.startDate);
  const endFmt = formatDate(offer.endDate);
  const usageCount = offer._count
    ? offer._count.memberships + offer._count.trainings
    : 0;

  const delays = ["delay-0", "delay-75", "delay-150", "delay-225"];
  const delayClass = delays[index % delays.length];

  return (
    <Card
      className={cn(
        "flex flex-col border-t-2 overflow-hidden animate-in fade-in zoom-in-95 duration-300 fill-mode-both",
        cfg.borderClass,
        delayClass,
      )}
    >
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn("p-2 rounded-lg shrink-0", cfg.bgClass)}>
              <Icon className={cn("h-4 w-4", cfg.colorClass)} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug truncate">{offer.title}</p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium mt-0.5",
                  cfg.badgeClass,
                )}
              >
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Active indicator */}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                offer.isActive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  offer.isActive ? "bg-emerald-500" : "bg-muted-foreground",
                )}
              />
              {offer.isActive ? "Active" : "Inactive"}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Offer options"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(offer)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(offer)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        {offer.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 -mt-1">
            {offer.description}
          </p>
        )}

        {/* Value highlight */}
        <div className="flex flex-wrap items-center gap-2">
          <OfferValueBadge offer={offer} />

          {(offer.type === "discount" || offer.type === "promo") && offer.appliesTo && (
            <Badge variant="outline" className="text-[10px] h-5 capitalize">
              {offer.appliesTo === "both" ? "combo" : offer.appliesTo}
            </Badge>
          )}
          {offer.targetGender && (
            <Badge variant="outline" className="text-[10px] h-5">
              {offer.targetGender} only
            </Badge>
          )}
          {offer.code && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded border border-dashed border-border">
              <Ticket className="h-2.5 w-2.5" />
              {offer.code}
            </span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          {startFmt || endFmt ? (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {startFmt && endFmt
                ? `${startFmt} – ${endFmt}`
                : startFmt
                ? `From ${startFmt}`
                : `Until ${endFmt}`}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">No date range</span>
          )}

          {usageCount > 0 && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 tabular-nums">
              <Users className="h-3 w-3" />
              {usageCount} used
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Skeleton cards ─────────────────────────────────────────────────────────────
function OfferCardSkeleton() {
  return (
    <Card className="border-t-2 border-t-muted">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function OffersPage() {
  const navigate = useNavigate();
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: offers, isLoading } = useOffers();
  const deleteMutation = useDeleteOffer();

  const searchLower = searchQuery.toLowerCase();
  const filteredOffers = (offers ?? []).filter((o) => {
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (!searchQuery) return true;
    return (
      o.title.toLowerCase().includes(searchLower) ||
      (o.description ?? "").toLowerCase().includes(searchLower) ||
      (o.code ?? "").toLowerCase().includes(searchLower)
    );
  });

  const hasActiveFilters = typeFilter !== "all" || !!searchQuery;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Offers"
        description="Manage promotions, events, referral campaigns and discounts"
        actions={
          <Button onClick={() => navigate(ROUTES.CREATE_OFFER)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Offer
          </Button>
        }
      />

      {/* Filter bar — only shown when there are offers or loading */}
      {(isLoading || (offers && offers.length > 0)) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
          {/* Type pill tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
            {FILTER_TABS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTypeFilter(value)}
                className={cn(
                  "inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  typeFilter === value
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground",
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
                {value !== "all" && offers && (
                  <span
                    className={cn(
                      "tabular-nums",
                      typeFilter === value ? "text-background/70" : "text-muted-foreground",
                    )}
                  >
                    {offers.filter((o) => o.type === value).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-8 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Result count + reset */}
          {!isLoading && (
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-xs text-muted-foreground tabular-nums">
                <span className="font-medium text-foreground">{filteredOffers.length}</span>{" "}
                {filteredOffers.length === 1 ? "offer" : "offers"}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("all");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <OfferCardSkeleton key={i} />
          ))}
        </div>
      ) : offers && offers.length > 0 ? (
        filteredOffers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOffers.map((offer, i) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                index={i}
                onEdit={(o) => navigate(`${ROUTES.EDIT_OFFER}/${o.id}/edit`)}
                onDelete={setOfferToDelete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="p-3 rounded-full bg-muted mb-1">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No offers match your filters</p>
              <p className="text-xs text-muted-foreground">Try adjusting the type filter or search query.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-2">
            <div className="p-3 rounded-full bg-muted mb-1">
              <Tag className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No offers yet</p>
            <p className="text-xs text-muted-foreground">
              Create your first promotion, event, or referral campaign.
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => navigate(ROUTES.CREATE_OFFER)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Offer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!offerToDelete}
        onOpenChange={(open) => {
          if (!open) setOfferToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{offerToDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              If this offer has been applied to existing memberships or trainings it will
              be deactivated instead of deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (offerToDelete) {
                  deleteMutation.mutate(offerToDelete.id, {
                    onSuccess: () => setOfferToDelete(null),
                    onError: () => setOfferToDelete(null),
                  });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
