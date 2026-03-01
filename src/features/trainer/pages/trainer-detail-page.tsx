import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Users,
  Dumbbell,
  Phone,
  Mail,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { PageHeader } from '@/shared/components/page-header';
import { ROUTES } from '@/shared/lib/constants';
import { useTrainerWithClients } from '../hooks/use-trainers';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  ];
  const index =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
}

export function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: trainerResponse, isLoading } = useTrainerWithClients(id!);
  const trainer = trainerResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="space-y-4">
        <PageHeader title="Trainer Not Found" />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              The trainer you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(ROUTES.TRAINERS)}>
              Back to Trainers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeClients = trainer.trainings ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title={trainer.name}
        description="Trainer profile and active clients."
        actions={
          <Button variant="outline" onClick={() => navigate(ROUTES.TRAINERS)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Trainer Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              {trainer.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{trainer.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <Badge
                  variant={trainer.isActive ? 'default' : 'secondary'}
                  className={
                    trainer.isActive
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 border-0'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-0'
                  }
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${
                      trainer.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                  {trainer.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {activeClients.length} active{' '}
                  {activeClients.length === 1 ? 'client' : 'clients'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Clients</CardTitle>
          <CardDescription>
            Members currently training with {trainer.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Dumbbell className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No active clients at the moment.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeClients.map((training) => {
                      const fullName = `${training.member.firstName} ${training.member.lastName}`;
                      return (
                        <TableRow
                          key={training.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/members/${training.member.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback
                                  className={`text-xs font-semibold ${getAvatarColor(fullName)}`}
                                >
                                  {training.member.firstName[0].toUpperCase()}
                                  {training.member.lastName[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {training.planVariant?.planType?.name ?? '—'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {training.planVariant?.durationLabel ?? ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(training.startDate)} –{' '}
                              {formatDate(training.endDate)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="space-y-0.5">
                              {training.member.phone && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {training.member.phone}
                                </div>
                              )}
                              {training.member.email && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {training.member.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 sm:hidden">
                {activeClients.map((training) => {
                  const fullName = `${training.member.firstName} ${training.member.lastName}`;
                  return (
                    <div
                      key={training.id}
                      className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/members/${training.member.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback
                              className={`text-xs font-semibold ${getAvatarColor(fullName)}`}
                            >
                              {training.member.firstName[0].toUpperCase()}
                              {training.member.lastName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {training.planVariant?.planType?.name ?? '—'}
                              {training.planVariant?.durationLabel
                                ? ` · ${training.planVariant.durationLabel}`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(training.startDate)} –{' '}
                        {formatDate(training.endDate)}
                      </div>
                      {(training.member.phone || training.member.email) && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {training.member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {training.member.phone}
                            </span>
                          )}
                          {training.member.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {training.member.email}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
