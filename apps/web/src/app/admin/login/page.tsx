"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@hhlawyer/validation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, Input } from "@/components/ui";
import { AdminPage } from "@/components/admin/foundation";
import { login } from "@/lib/api/auth";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";

type Values = z.input<typeof loginSchema>;

export default function AdminLogin() {
  const router = useRouter();
  const locale = useLocale();
  const t = messages[locale].admin;
  const form = useForm<Values>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const emailError = form.formState.errors.email ? (locale === "en" ? "Enter a valid email address." : "أدخل بريدًا إلكترونيًا صحيحًا.") : "";
  const passwordError = form.formState.errors.password ? (locale === "en" ? "Enter your approved password." : "أدخل كلمة المرور المعتمدة.") : "";
  const mutation = useMutation({
    mutationFn: ({ email, password }: Values) => login(email, password),
    onSuccess: () => router.replace(localizePath("/admin", locale)),
    retry: false,
  });

  return (
    <AdminPage className="max-w-md py-10">
      <div className="mb-4 flex justify-end">
        <ThemeToggle id="admin-theme" />
      </div>
      <Card>
        <CardHeader>
          <h1 className="text-lg font-extrabold text-card-foreground">{locale === "en" ? t.login : "دخول الإدارة"}</h1>
          <CardDescription>{locale === "en" ? "Use your approved account details to access the dashboard." : "استخدم بيانات حسابك المعتمدة للوصول إلى لوحة التحكم."}</CardDescription>
        </CardHeader>
        <CardContent>
          <form aria-busy={mutation.isPending} className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <label className="block space-y-2 text-sm font-bold text-card-foreground">
              <span>{t.email}</span>
              <Input aria-describedby={emailError ? "admin-login-email-error" : undefined} autoComplete="username" type="email" aria-invalid={Boolean(emailError)} {...form.register("email")} />
              {emailError ? <span className="block text-sm font-semibold text-destructive" id="admin-login-email-error" role="alert">{emailError}</span> : null}
            </label>
            <label className="block space-y-2 text-sm font-bold text-card-foreground">
              <span>{t.password}</span>
              <Input aria-describedby={passwordError ? "admin-login-password-error" : undefined} autoComplete="current-password" type="password" aria-invalid={Boolean(passwordError)} {...form.register("password")} />
              {passwordError ? <span className="block text-sm font-semibold text-destructive" id="admin-login-password-error" role="alert">{passwordError}</span> : null}
            </label>
            {mutation.isError ? <Alert status="destructive">{locale === "en" ? "The sign-in details are incorrect." : "بيانات الدخول غير صحيحة."}</Alert> : null}
            <Button className="w-full" isLoading={mutation.isPending} type="submit">
              {mutation.isPending ? (locale === "en" ? "Signing in..." : "جارٍ الدخول...") : t.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminPage>
  );
}
