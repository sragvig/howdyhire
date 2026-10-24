import type { ReactNode } from "react";

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
    <section className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm print:break-inside-avoid print:shadow-none ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-aggie">{icon}</span>}
          <h2 className="font-semibold text-stone-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
