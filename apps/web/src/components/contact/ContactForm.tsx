"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { contactSubmissionSchema } from "@hhlawyer/validation";
import type { ContactMessageCreated } from "@hhlawyer/types";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert, Button, Card, CardContent, Textarea } from "@/components/ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { errorMessage, messages } from "@/i18n/messages";
import { ApiClientError } from "@/lib/api/client";
import { createContactMessage } from "@/lib/api/consultations";
import { ContactInput } from "./ContactAtoms";

type ContactValues = z.input<typeof contactSubmissionSchema>;

export function ContactForm() {
  const locale = useLocale();
  const t = messages[locale].public.contact;
  const form = useForm<ContactValues>({ resolver: zodResolver(contactSubmissionSchema), defaultValues: { name: "", email: "", subject: "", message: "", website: "" } });
  const mutation = useMutation<ContactMessageCreated, Error, ContactValues>({
    mutationFn: (input) => createContactMessage(input, locale),
    retry: false,
    onError: (error) => {
      if (error instanceof ApiClientError && error.error.fields) {
        Object.entries(error.error.fields).forEach(([field, fieldMessages]) => {
          if (field in form.getValues() && Array.isArray(fieldMessages)) form.setError(field as keyof ContactValues, { message: fieldMessages[0] });
        });
      }
    },
  });

  async function submitMessage(values: ContactValues) {
    try {
      await mutation.mutateAsync(values);
      form.reset();
    } catch {
      return;
    }
  }

  const messageError = form.formState.errors.message?.message;
  return <Card data-testid="contact-form-card" className="contact-form lg:col-span-7"><CardContent className="p-6 sm:p-8"><form data-testid="contact-message-form" onSubmit={form.handleSubmit(submitMessage)} className="space-y-5" noValidate aria-busy={mutation.isPending}>
    <div className="grid gap-5 md:grid-cols-2"><ContactInput label={t.name} autoComplete="name" error={form.formState.errors.name?.message} {...form.register("name")} /><ContactInput label={t.email} type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register("email")} /></div>
    <ContactInput label={t.subject} error={form.formState.errors.subject?.message} {...form.register("subject")} />
    <label className="grid gap-2 text-sm font-bold text-card-foreground" htmlFor="contact-message"><span>{t.message}</span><Textarea id="contact-message" rows={5} aria-describedby={messageError ? "contact-message-error" : undefined} aria-invalid={Boolean(messageError)} {...form.register("message")} />{messageError && <span id="contact-message-error" role="alert" className="text-sm font-medium text-destructive">{messageError}</span>}</label>
    <input hidden tabIndex={-1} autoComplete="off" aria-hidden="true" {...form.register("website")} />
    {mutation.isError && <Alert status="destructive">{errorMessage(locale, mutation.error instanceof ApiClientError ? mutation.error.error.code : undefined)}</Alert>}
    {mutation.isSuccess && <Alert data-testid="contact-form-success" status="success">{t.received} {t.reply}</Alert>}
    <Button className="w-full" isLoading={mutation.isPending} size="lg" type="submit">{mutation.isPending ? t.submitting : t.submit}</Button>
  </form></CardContent></Card>;
}
