import type { Metadata } from "next";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLocaleLayout({ children }: { children: React.ReactNode }) {
  return <AdminWorkspace>{children}</AdminWorkspace>;
}
