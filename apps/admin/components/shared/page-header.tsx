import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Admin Panel</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className={cn("flex items-center gap-2")}>{action}</div>}
    </div>
  );
}
