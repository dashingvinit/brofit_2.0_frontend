import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { useSearchMembers } from '@/features/members/hooks/use-members';
import { cn } from '@/shared/lib/utils';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(query); setFocusedIndex(-1); }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setDebouncedQuery('');
      setFocusedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const { data: searchRes } = useSearchMembers({ q: debouncedQuery, page: 1, limit: 8 });
  const results = debouncedQuery.trim() ? (searchRes?.data ?? []) : [];

  const select = useCallback((memberId: string) => {
    navigate(`/members/${memberId}`);
    setOpen(false);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0 && results[focusedIndex]) {
      select(results[focusedIndex].id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 text-sm text-muted-foreground font-normal w-44 md:w-56 justify-start"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left truncate">Search members…</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground pointer-events-none">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-md overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or phone…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => { setQuery(''); setDebouncedQuery(''); inputRef.current?.focus(); }}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {!debouncedQuery.trim() ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Type to search members</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Search by name or phone number</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No members found for "{debouncedQuery}"</p>
              </div>
            ) : (
              <div className="py-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Members · {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => select(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      focusedIndex === i ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400 shrink-0">
                      {m.firstName[0]}{m.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t px-3 py-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span><kbd className="border rounded px-1 py-0.5">↑↓</kbd> navigate</span>
            <span><kbd className="border rounded px-1 py-0.5">↵</kbd> open</span>
            <span><kbd className="border rounded px-1 py-0.5">Esc</kbd> close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
