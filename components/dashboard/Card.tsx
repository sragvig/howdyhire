import type { ReactNode } from "react";
import { surface } from "@/components/ui/styles";

export function Card({
  title,
  icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${surface} p-5 print:break-inside-avoid ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-maroon-500/15 text-accent ring-1 ring-inset ring-maroon-400/20 [&>svg]:h-4 [&>svg]:w-4">
              {icon}
            </span>
          )}
          <h2 className="font-display font-semibold text-fg">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
