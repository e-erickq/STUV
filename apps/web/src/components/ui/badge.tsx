import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/20 text-secondary-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'border border-border text-foreground',
        // Status execução
        passou: 'text-green-700 bg-green-50',
        falhou: 'text-red-700 bg-red-50',
        bloqueado: 'text-orange-700 bg-orange-50',
        pulado: 'text-slate-600 bg-slate-100',
        'em-execucao': 'text-blue-700 bg-blue-50',
        'nao-executado': 'text-slate-400 bg-slate-50',
        // Gravidade
        critica: 'text-red-900 bg-red-100',
        alta: 'text-red-700 bg-red-50',
        media: 'text-amber-700 bg-amber-50',
        baixa: 'text-green-700 bg-green-50',
        // Perfil
        admin: 'text-indigo-700 bg-indigo-50',
        gerente: 'text-cyan-700 bg-cyan-50',
        testador: 'text-slate-600 bg-slate-100',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
