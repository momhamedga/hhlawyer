"use client";

import { addDays, startOfToday } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BOOKING_TIME_SLOTS, consultationSubmissionSchema } from "@hhlawyer/validation";
import type { ConsultationCreated, PublicService } from "@hhlawyer/types";
import type { z } from "zod";
import { Alert, Button, Card, CardContent, Textarea } from "@/components/ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { errorMessage, messages } from "@/i18n/messages";
import { formatConsultationDate, formatConsultationTime, localizeService } from "@/i18n/format";
import { ApiClientError } from "@/lib/api/client";
import { createConsultation, getActiveServices } from "@/lib/api/consultations";
import { useBookingStore } from "@/store/dateStore";
import { BookingInput } from "./BookingInput";
import { DateStep, ServiceStep } from "./BookingSteps";

type Values = z.input<typeof consultationSubmissionSchema>;

export function BookingSystem() {
  const locale = useLocale();
  const t = messages[locale].public.consultation;
  const { step, setStep } = useBookingStore();
  const form = useForm<Values>({
    resolver: zodResolver(consultationSubmissionSchema),
    defaultValues: { serviceId: "", name: "", email: "", phone: "", preferredDate: "", preferredTime: "09:00 AM", message: "", website: "" },
  });
  const services = useQuery({ queryKey: ["active-services"], queryFn: ({ signal }) => getActiveServices(signal) });
  const mutation = useMutation<ConsultationCreated, Error, Values>({
    mutationFn: (input) => createConsultation(input),
    retry: false,
    onError: (error) => {
      if (error instanceof ApiClientError && error.error.fields) {
        Object.entries(error.error.fields).forEach(([field, fieldMessages]) => {
          if (field in form.getValues() && Array.isArray(fieldMessages)) form.setError(field as keyof Values, { message: fieldMessages[0] });
        });
      }
    },
  });
  const serviceId = useWatch({ control: form.control, name: "serviceId" });
  const selectedDate = useWatch({ control: form.control, name: "preferredDate" });
  const selectedTime = useWatch({ control: form.control, name: "preferredTime" });
  const selectedService = services.data?.find((service) => service.id === serviceId);
  const selectedServiceCopy = selectedService ? localizeService(locale, selectedService) : undefined;
  const days = Array.from({ length: 7 }, (_, index) => addDays(startOfToday(), index));

  async function submitDetails(values: Values) {
    try {
      await mutation.mutateAsync(values);
      form.reset({ serviceId: values.serviceId, preferredDate: values.preferredDate, preferredTime: values.preferredTime, name: "", email: "", phone: "", message: "", website: "" });
    } catch {
      return;
    }
  }

  if (mutation.data) {
    return <Card data-testid="consultation-booking-success" className="consultation-booking-system mx-auto max-w-xl"><CardContent className="space-y-4 p-8 text-center" aria-live="polite"><h2 className="ds-h2 text-success">{t.received}</h2><p className="text-muted-foreground">{t.reference}</p><p className="text-2xl font-extrabold text-card-foreground" dir="ltr"><bdi>{mutation.data.referenceNumber}</bdi></p><p className="text-sm text-muted-foreground">{t.confirm}</p></CardContent></Card>;
  }

  return <Card data-testid="consultation-booking-system" className="consultation-booking-system mx-auto max-w-xl"><CardContent className="p-6 sm:p-8">
    <div className="mb-7 flex items-center justify-between gap-4"><Button disabled={step <= 1} onClick={() => setStep(step - 1)} variant="ghost">{messages[locale].common.back}</Button><div data-testid="consultation-progress" aria-label={`${t.step} ${step} / 4`} className="flex gap-1.5">{[1, 2, 3, 4].map((value) => <span key={value} className={`h-1.5 w-7 rounded-full ${value <= step ? "bg-primary" : "bg-muted"}`} />)}</div></div>
    {services.isLoading && <p aria-live="polite" className="text-center text-muted-foreground">{t.servicesLoading}</p>}
    {services.isError && <Alert status="destructive">{t.servicesError}</Alert>}
    {!services.isLoading && !services.isError && <AnimatePresence mode="wait">
      {step === 1 && <ServiceStep key="service" services={services.data ?? []} selected={selectedService?.id} onSelect={(service: PublicService) => { form.setValue("serviceId", service.id, { shouldValidate: true }); setStep(2); }} />}
      {step === 2 && <DateStep key="date" days={days} selected={selectedDate} onSelect={(date) => form.setValue("preferredDate", date, { shouldValidate: true })} onNext={() => setStep(3)} />}
      {step === 3 && <motion.section data-testid="consultation-step-time" key="time" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5"><header className="text-center"><p className="text-sm font-extrabold text-primary">03. {t.time}</p></header><div className="grid grid-cols-2 gap-3">{BOOKING_TIME_SLOTS.map((time) => <button key={time} type="button" onClick={() => { form.setValue("preferredTime", time); setStep(4); }} className={`min-h-14 rounded-ds-md border text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedTime === time ? "border-primary bg-secondary text-primary" : "border-border bg-card text-card-foreground hover:bg-secondary"}`}>{formatConsultationTime(time, locale)}</button>)}</div></motion.section>}
      {step === 4 && <motion.form data-testid="consultation-details-form" key="details" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={form.handleSubmit(submitDetails)} className="space-y-5" aria-busy={mutation.isPending}>
        <div className="rounded-ds-md bg-secondary p-4 text-sm"><p className="font-bold text-primary">{t.request}</p><p className="mt-1 text-card-foreground">{selectedServiceCopy?.title}</p><p className="mt-1 text-muted-foreground"><bdi>{selectedDate && formatConsultationDate(selectedDate, locale)}</bdi> · <bdi>{selectedTime && formatConsultationTime(selectedTime, locale)}</bdi></p></div>
        <BookingInput label={t.name} autoComplete="name" error={form.formState.errors.name?.message} {...form.register("name")} />
        <BookingInput label={t.email} type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register("email")} />
        <BookingInput label={t.phone} type="tel" autoComplete="tel" error={form.formState.errors.phone?.message} {...form.register("phone")} />
        <label className="grid gap-2 text-sm font-bold text-card-foreground" htmlFor="booking-message"><span>{t.details}</span><Textarea id="booking-message" aria-invalid={Boolean(form.formState.errors.message)} {...form.register("message")} /></label>
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" hidden {...form.register("website")} />
        {mutation.isError && <Alert status="destructive">{errorMessage(locale, mutation.error instanceof ApiClientError ? mutation.error.error.code : undefined)}</Alert>}
        <Button className="w-full" isLoading={mutation.isPending} size="lg" type="submit">{mutation.isPending ? t.submitting : t.submit}</Button>
      </motion.form>}
    </AnimatePresence>}
  </CardContent></Card>;
}
