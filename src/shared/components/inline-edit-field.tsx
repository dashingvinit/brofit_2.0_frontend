import { useState, useRef, useEffect } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => void;
  isSaving?: boolean;
  multiline?: boolean;
  placeholder?: string;
  masked?: boolean;
}

export function InlineEditField({ value, onSave, isSaving, multiline, placeholder, masked }: InlineEditFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, value]);

  const handleSave = () => {
    if (draft.trim() !== value.trim()) {
      onSave(draft.trim());
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') handleCancel();
  };

  if (editing) {
    return (
      <div className="flex items-start gap-1.5 mt-0.5">
        {multiline ? (
          <Textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder={placeholder}
            className="text-sm py-1 h-auto min-h-[60px] flex-1"
            disabled={isSaving}
          />
        ) : (
          <Input
            ref={inputRef as React.Ref<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-7 text-sm py-1 flex-1"
            disabled={isSaving}
          />
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-0.5 rounded p-0.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
          title="Save"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="mt-0.5 rounded p-0.5 text-muted-foreground hover:bg-muted transition-colors"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-1.5 cursor-pointer"
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      <p className="font-medium text-sm">
        {masked
          ? <span className="text-muted-foreground select-none tracking-widest">••••••••</span>
          : (value || <span className="text-muted-foreground italic">Not set</span>)
        }
      </p>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}
