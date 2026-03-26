import { useState } from "react";
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
  SlidersHorizontal,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageHeader } from "@/shared/components/page-header";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
import { OfferDialog } from "../components/offer-dialog";
import type { Offer, OfferType } from "@/shared/types/common.types";

type TypeFilter = "all" | OfferType;

const TYPE_OPTIONS: { value: TypeFilter; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All Offers", icon: Tag },
  { value: "discount", label: "Discounts", icon: Percent },
  { value: "promo", label: "Promos", icon: Gift },
  { value: "event", label: "Events", icon: Calendar },
  { value: "referral", label: "Referrals", icon: Users },
];

function OfferTypeIcon({ type }: { type: OfferType }) {
  const iconClass = "h-5 w-5 text-primary";
  switch (type) {
    case "discount":
      return <Percent className={iconClass} />;
    case "promo":
      return <Gift className={iconClass} />;
    case "event":
      return <Calendar className={iconClass} />;
    case "referral":
      return <Users className={iconClass} />;
  }
}

function getOfferTypeLabel(type: OfferType) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OfferCard({
  offer,
  onEdit,
  onDelete,
}: {
  offer: Offer;
  onEdit: (o: Offer) => void;
  onDelete: (o: Offer) => void;
}) {
  const startFmt = formatDate(offer.startDate);
  const endFmt = formatDate(offer.endDate);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <OfferTypeIcon type={offer.type} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold truncate">{offer.title}</CardTitle>
              <div className="flex gap-1 mt-1 flex-wrap">
                <Badge variant={offer.isActive ? "default" : "secondary"}>
                  {offer.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {getOfferTypeLabel(offer.type)}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(offer)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(offer)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {offer.description && (
          <CardDescription className="mt-2 line-clamp-2">{offer.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {/* Discount info */}
        {(offer.type === "discount" || offer.type === "promo") &&
          offer.discountValue != null && (
            <div className="flex items-center gap-1.5">
              {offer.discountType === "percentage" ? (
                <Percent className="h-3.5 w-3.5" />
              ) : (
                <IndianRupee className="h-3.5 w-3.5" />
              )}
              <span className="font-medium text-foreground">
                {offer.discountType === "percentage"
                  ? `${offer.discountValue}% off`
                  : `₹${offer.discountValue} off`}
              </span>
              {offer.code && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {offer.code}
                </Badge>
              )}
            </div>
          )}

        {/* Referral reward */}
        {offer.type === "referral" && offer.rewardAmount != null && (
          <div className="flex items-center gap-1.5">
            <IndianRupee className="h-3.5 w-3.5" />
            <span>
              Referrer reward: <span className="font-medium text-foreground">₹{offer.rewardAmount}</span>
            </span>
          </div>
        )}

        {/* Date range */}
        {(startFmt || endFmt) && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {startFmt && endFmt
                ? `${startFmt} – ${endFmt}`
                : startFmt
                ? `From ${startFmt}`
                : `Until ${endFmt}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OffersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: offers, isLoading } = useOffers();
  const deleteMutation = useDeleteOffer();

  const searchLower = searchQuery.toLowerCase();
  const filteredOffers = (offers ?? []).filter((o) => {
    const matchesType = typeFilter === "all" || o.type === typeFilter;
    if (!matchesType) return false;
    if (!searchQuery) return true;
    return (
      o.title.toLowerCase().includes(searchLower) ||
      (o.description ?? "").toLowerCase().includes(searchLower) ||
      (o.code ?? "").toLowerCase().includes(searchLower)
    );
  });

  const hasActiveFilters = typeFilter !== "all" || !!searchQuery;
  const filterLabel = TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label ?? "Filter";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Offers"
        description="Run promotions, events, referral campaigns and discounts for your members"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Offer
          </Button>
        }
      />

      {/* Toolbar */}
      {offers && offers.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9"
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {typeFilter === "all" ? "Type" : filterLabel}
                </span>
                {typeFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold"
                  >
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as TypeFilter)}
              >
                {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <DropdownMenuRadioItem key={value} value={value} className="gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-muted-foreground shrink-0"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
              }}
            >
              Reset
            </Button>
          )}

          <p className="text-sm text-muted-foreground ml-auto hidden sm:block tabular-nums">
            <span className="font-medium text-foreground">{filteredOffers.length}</span>{" "}
            {filteredOffers.length === 1 ? "offer" : "offers"}
          </p>
        </div>
      )}

      {/* Grid */}
      {offers && offers.length > 0 ? (
        filteredOffers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onEdit={setEditingOffer}
                onDelete={setOfferToDelete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No offers match your filters</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or type filter.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first offer to start running promotions
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Offer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <OfferDialog
        open={isCreateDialogOpen || !!editingOffer}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingOffer(null);
          }
        }}
        offer={editingOffer}
      />

      {/* Delete Confirmation */}
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
              If this offer has been applied to existing memberships or trainings it will be
              deactivated instead of deleted.
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
