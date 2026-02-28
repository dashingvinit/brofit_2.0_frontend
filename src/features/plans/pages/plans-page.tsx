import { useState } from 'react';
import {
  Plus,
  Dumbbell,
  CreditCard,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  SlidersHorizontal,
  Search,
  X,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { PageHeader } from '@/shared/components/page-header';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import { Separator } from '@/shared/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { usePlanTypes, useDeletePlanType } from '../hooks/use-plan-types';
import { PlanTypeDialog } from '../components/plan-type-dialog';
import { PlanVariantsSheet } from '../components/plan-variants-sheet';
import type { PlanType, PlanCategory } from '@/shared/types/common.types';

type CategoryFilter = 'all' | PlanCategory;

const categoryOptions: {
  value: CategoryFilter;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { value: 'all', label: 'All Plans', icon: LayoutGrid },
  { value: 'membership', label: 'Membership', icon: CreditCard },
  { value: 'training', label: 'Training', icon: Dumbbell },
];

export function PlansPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlanType, setEditingPlanType] = useState<PlanType | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planTypeToDelete, setPlanTypeToDelete] = useState<PlanType | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: planTypes, isLoading } = usePlanTypes();
  const deleteMutation = useDeletePlanType();

  const handleEdit = (planType: PlanType) => {
    setEditingPlanType(planType);
  };

  const handleDelete = (planType: PlanType) => {
    setPlanTypeToDelete(planType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (planTypeToDelete) {
      deleteMutation.mutate(planTypeToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPlanTypeToDelete(null);
        },
      });
    }
  };

  const handleManageVariants = (planType: PlanType) => {
    setSelectedPlanType(planType);
  };

  const searchLower = searchQuery.toLowerCase();
  const filteredPlans = (planTypes ?? []).filter((pt) => {
    const matchesCategory = categoryFilter === 'all' || pt.category === categoryFilter;
    if (!matchesCategory) return false;
    if (!searchQuery) return true;
    return pt.name.toLowerCase().includes(searchLower) ||
      (pt.description ?? '').toLowerCase().includes(searchLower);
  });

  const hasActiveFilters = categoryFilter !== 'all' || !!searchQuery;
  const filterLabel =
    categoryOptions.find((o) => o.value === categoryFilter)?.label ?? 'Filter';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans Management"
        description="Manage plan types and their pricing variants"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan Type
          </Button>
        }
      />

      {/* Toolbar: search + category filter */}
      {planTypes && planTypes.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {categoryFilter === 'all' ? 'Category' : filterLabel}
                </span>
                {categoryFilter !== 'all' && (
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
              <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
              >
                {categoryOptions.map(({ value, label, icon: Icon }) => (
                  <DropdownMenuRadioItem
                    key={value}
                    value={value}
                    className="gap-2"
                  >
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
                setSearchQuery('');
                setCategoryFilter('all');
              }}
            >
              Reset
            </Button>
          )}

          <p className="text-sm text-muted-foreground ml-auto hidden sm:block tabular-nums">
            <span className="font-medium text-foreground">{filteredPlans.length}</span>{' '}
            {filteredPlans.length === 1 ? 'plan' : 'plans'}
          </p>
        </div>
      )}

      {/* Plan Types Grid */}
      {planTypes && planTypes.length > 0 ? (
        filteredPlans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((planType) => (
              <Card key={planType.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {planType.category === 'training' ? (
                          <Dumbbell className="h-5 w-5 text-primary" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{planType.name}</CardTitle>
                        <div className="flex gap-1 mt-1">
                          <Badge variant={planType.isActive ? 'default' : 'secondary'}>
                            {planType.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {planType.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(planType)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(planType)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {planType.description && (
                    <CardDescription className="mt-2">{planType.description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <Separator className="mb-4" />

                  {/* Variants Section */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Pricing Variants
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleManageVariants(planType)}
                      >
                        Manage
                      </Button>
                    </div>

                    {planType.variants && planType.variants.length > 0 ? (
                      <div className="space-y-2">
                        {planType.variants.slice(0, 3).map((variant) => (
                          <div
                            key={variant.id}
                            className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{variant.durationLabel}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{variant.price}</span>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {variant.durationDays} days
                            </div>
                          </div>
                        ))}
                        {planType.variants.length > 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleManageVariants(planType)}
                          >
                            View all {planType.variants.length} variants
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground mb-3">
                          No pricing variants yet
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageVariants(planType)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Variant
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No plans match your filters</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or category filter.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
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
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No plan types yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first plan type to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan Type
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Plan Type Dialog */}
      <PlanTypeDialog
        open={isCreateDialogOpen || !!editingPlanType}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingPlanType(null);
          }
        }}
        planType={editingPlanType}
      />

      {/* Manage Variants Sheet */}
      <PlanVariantsSheet
        planType={selectedPlanType}
        open={!!selectedPlanType}
        onOpenChange={(open) => {
          if (!open) setSelectedPlanType(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan type "{planTypeToDelete?.name}" and all its
              variants. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
