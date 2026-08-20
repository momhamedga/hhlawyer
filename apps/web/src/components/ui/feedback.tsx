import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

type Status = "default" | "destructive" | "success" | "warning" | "info";

const statusClasses: Record<Status, string> = {
  default: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
};

export function Badge({ className, status = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { status?: Status }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", statusClasses[status], className)} {...props} />;
}

const icons = { destructive: AlertCircle, success: CheckCircle2, warning: TriangleAlert, info: Info, default: Info };

export function Alert({ className, status = "info", ...props }: HTMLAttributes<HTMLDivElement> & { status?: Status }) {
  const Icon = icons[status];
  return (
    <div className={cn("flex items-start gap-3 rounded-ds-md px-4 py-3 text-sm font-semibold", statusClasses[status], className)} role="alert" {...props}>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{props.children}</div>
    </div>
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-ds-sm bg-muted", className)} {...props} />;
}
