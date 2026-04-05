import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Step {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface FormStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

export function FormStepIndicator({ steps, currentStep, onStepClick }: FormStepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="px-6 pt-6">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <button
                type="button"
                onClick={() => { if (index < currentStep) onStepClick(index); }}
                disabled={index > currentStep}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-primary/10 text-primary hover:bg-primary/20'
                      : 'text-muted-foreground'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    isCurrent
                      ? 'bg-primary-foreground/20'
                      : isCompleted
                        ? 'bg-primary/20'
                        : 'bg-muted'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 hidden h-px flex-1 sm:block ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
