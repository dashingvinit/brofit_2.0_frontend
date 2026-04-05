import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import type { Member, Membership, Training } from '@/shared/types/common.types';

interface ActiveWarning {
  type: 'membership' | 'training';
  item: Membership | Training;
}

interface MemberPickerProps {
  members: Member[];
  isLoading: boolean;
  selectedMemberId: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (memberId: string) => void;
  error?: string;
  activeWarning?: ActiveWarning | null;
}

export function MemberPicker({
  members,
  isLoading,
  selectedMemberId,
  search,
  onSearchChange,
  onSelect,
  error,
  activeWarning,
}: MemberPickerProps) {
  return (
    <div className="space-y-4 px-6 pb-6">
      <div>
        <h3 className="text-lg font-semibold">Select a Member</h3>
        <p className="text-sm text-muted-foreground">
          Choose the member who will receive this {activeWarning?.type ?? 'plan'}.
        </p>
      </div>

      <Input
        placeholder="Search by name, email, or phone..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No members found. Try a different search term.
        </p>
      ) : (
        <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1">
          {members.map((member) => (
            <Card
              key={member.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedMemberId === member.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : ''
              }`}
              onClick={() => onSelect(member.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.isActive ? 'default' : 'secondary'}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {selectedMemberId === member.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedMemberId && activeWarning && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-400">
              This member already has an active {activeWarning.type}
            </p>
            <p className="text-amber-700 dark:text-amber-500 mt-0.5">
              {activeWarning.item.planVariant?.planType?.name} -{' '}
              {activeWarning.item.planVariant?.durationLabel} (expires{' '}
              {new Date(activeWarning.item.endDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              ). Creating another will result in overlapping {activeWarning.type}s.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
