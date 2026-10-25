import type { ReactNode } from "react";
import { iconTile, surface } from "@/components/ui/styles";

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
    <section className={`${surface} p-6 print:break-inside-avoid ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {icon && <span className={`${iconTile} h-9 w-9 [&>svg]:h-4.5 [&>svg]:w-4.5`}>{icon}</span>}
          <h2 className="font-display text-base font-semibold text-fg">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
