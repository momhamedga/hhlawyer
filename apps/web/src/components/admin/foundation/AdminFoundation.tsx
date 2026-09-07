import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/components/ui/cn";
import { DialogContent } from "@/components/ui/dialog";
import styles from "./AdminFoundation.module.css";

type BaseProps = HTMLAttributes<HTMLDivElement>;

export function AdminPage({ className, ...props }: BaseProps) {
  return <div className={cn(styles.page, className)} {...props} />;
}

export function AdminPageHeader({
  actions,
  className,
  description,
  title,
  ...props
}: BaseProps & { actions?: ReactNode; description?: ReactNode; title: ReactNode }) {
  return (
    <header className={cn(styles.pageHeader, className)} {...props}>
      <div className={styles.pageHeaderText}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description ? <p className={styles.pageDescription}>{description}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  );
}

export function AdminSection({ className, ...props }: BaseProps) {
  return <section className={cn(styles.section, className)} {...props} />;
}

export function AdminSectionTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn(styles.sectionTitle, className)} {...props} />;
}

export function AdminSurface({ className, ...props }: BaseProps) {
  return <div className={cn(styles.surface, className)} {...props} />;
}

export function AdminToolbar({ className, ...props }: BaseProps) {
  return <div className={cn(styles.toolbar, className)} {...props} />;
}

export function AdminStack({ className, ...props }: BaseProps) {
  return <div className={cn(styles.stack, className)} {...props} />;
}

export function AdminGrid({ className, ...props }: BaseProps) {
  return <div className={cn(styles.grid, className)} {...props} />;
}

export function AdminDivider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn(styles.divider, className)} {...props} />;
}

type AdminStatusTone = "info" | "attention" | "success" | "danger";

export function AdminStatusBadge({ className, tone = "info", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: AdminStatusTone }) {
  return <span className={cn(styles.badge, styles[tone], className)} {...props} />;
}

export function AdminDataState({
  className,
  description,
  title,
  tone = "empty",
  ...props
}: BaseProps & { description?: ReactNode; title: ReactNode; tone?: "empty" | "error" | "loading" }) {
  return (
    <div
      aria-busy={tone === "loading" || undefined}
      className={cn(styles.state, className)}
      role={tone === "error" ? "alert" : tone === "loading" ? "status" : undefined}
      {...props}
    >
      <div>
        <p className={styles.stateTitle}>{title}</p>
        {description ? <p className={styles.stateDescription}>{description}</p> : null}
      </div>
    </div>
  );
}

export function AdminTechnicalValue({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <bdi className={cn(styles.technicalValue, className)} dir="ltr" {...props} />;
}

export function AdminDialogContent({ className, ...props }: ComponentProps<typeof DialogContent>) {
  return <DialogContent className={cn(styles.dialogSurface, className)} {...props} />;
}

export type AdminBreadcrumbItem = {
  href?: string;
  label: ReactNode;
  technical?: boolean;
};

export function AdminBreadcrumbs({ items, label }: { items: AdminBreadcrumbItem[]; label: string }) {
  return (
    <nav aria-label={label} className={styles.breadcrumbs}>
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${index}-${String(item.label)}`}>
              {index > 0 ? <ChevronRight aria-hidden="true" className={styles.breadcrumbSeparator} size={14} /> : null}
              {item.href && !current ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={current ? "page" : undefined} className={item.technical ? styles.breadcrumbTechnical : undefined}>
                  {item.technical ? <bdi dir="ltr">{item.label}</bdi> : item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
