"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@hhlawyer/validation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import { login } from "@/lib/api/auth";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";

type Values = z.input<typeof loginSchema>;

export default function AdminLogin() {
  const router = useRouter();
  const locale = useLocale();
  const t = messages[locale].admin;
  const form = useForm<Values>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const mutation = useMutation({
    mutationFn: ({ email, password }: Values) => login(email, password),
    onSuccess: () => router.replace(localizePath("/admin", locale)),
    retry: false,
  });

  return (
    <section className="mx-auto max-w-md px-5 py-10">
      <div className="mb-4 flex justify-end">
        <ThemeToggle id="admin-theme" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{locale === "en" ? t.login : "دخول الإدارة"}</CardTitle>
          <CardDescription>{locale === "en" ? "Use your approved account details to access the dashboard." : "استخدم بيانات حسابك المعتمدة للوصول إلى لوحة التحكم."}</CardDescription>
        </CardHeader>
        <CardContent>
          <form aria-busy={mutation.isPending} className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <label className="block space-y-2 text-sm font-bold text-card-foreground">
              <span>{t.email}</span>
              <Input autoComplete="username" type="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
            </label>
            <label className="block space-y-2 text-sm font-bold text-card-foreground">
              <span>{t.password}</span>
              <Input autoComplete="current-password" type="password" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />
            </label>
            {mutation.isError ? <Alert status="destructive">{locale === "en" ? "The sign-in details are incorrect." : "بيانات الدخول غير صحيحة."}</Alert> : null}
            <Button className="w-full" isLoading={mutation.isPending} type="submit">
              {mutation.isPending ? (locale === "en" ? "Signing in..." : "جارٍ الدخول...") : t.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
