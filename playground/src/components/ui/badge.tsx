import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default:
          'border-indigo-500/25 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400/30 dark:bg-indigo-500/15',
        secondary:
          'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300',
        outline:
          'border-zinc-200 bg-transparent text-zinc-600 dark:border-zinc-800 dark:text-zinc-400',
        success:
          'border-emerald-500/35 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
