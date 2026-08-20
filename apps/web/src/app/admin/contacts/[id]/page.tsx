"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUser } from "@/lib/api/auth";
import { adminContactsKeys, getAdminContact, updateAdminContactStatus } from "@/lib/api/admin-contacts";
import type { ContactMessageStatus } from "@hhlawyer/types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { displayEnum } from "@/i18n/format";

const transitions: Record<ContactMessageStatus, ContactMessageStatus[]> = {
  UNREAD: ["READ", "ARCHIVED"],
  READ: ["UNREAD", "REPLIED", "ARCHIVED"],
  REPLIED: ["ARCHIVED"],
  ARCHIVED: [],
};

export default function ContactDetail() {
  const locale = useLocale();
  const en = locale === "en";
  const { id } = useParams<{ id: string }>();
  const client = useQueryClient();
  const [archiveConfirmationOpen, setArchiveConfirmationOpen] = useState(false);
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const contact = useQuery({
    queryKey: adminContactsKeys.detail(id),
    queryFn: () => getAdminContact(id),
    enabled: !!user.data,
  });
  const mutation = useMutation({
    mutationFn: (status: ContactMessageStatus) => updateAdminContactStatus(id, status),
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: adminContactsKeys.all }),
  });

  if (user.isLoading || contact.isLoading) return <p aria-busy="true">{en ? "Loading message..." : "جارٍ تحميل الرسالة..."}</p>;
  if (!user.data || !contact.data) return <p role="alert">{en ? "The message could not be found." : "تعذر العثور على الرسالة."}</p>;

  const canManage = user.data.user.role !== "LAWYER";
  const changeStatus = (status: ContactMessageStatus) => {
    if (status === "ARCHIVED") {
      setArchiveConfirmationOpen(true);
      return;
    }

    mutation.mutate(status);
  };

  return (
    <section className="mx-auto max-w-4xl space-y-5 p-8">
      <h1 className="text-3xl font-bold">{en ? "Contact message" : "رسالة التواصل"}</h1>
      <p data-testid="contact-status" data-status={contact.data.status}>
        {displayEnum(locale, contact.data.status)}
      </p>
      <section><h2>{en ? "Message" : "الرسالة"}</h2><p className="whitespace-pre-wrap">{contact.data.message}</p></section>
      {canManage ? (
        <div data-testid="contact-status-actions">
          {transitions[contact.data.status].map((status) => (
            <button
              key={status}
              data-testid={`contact-status-action-${status}`}
              disabled={mutation.isPending}
              onClick={() => changeStatus(status)}
            >
              {displayEnum(locale, status)}
            </button>
          ))}
        </div>
      ) : (
        <p data-testid="contact-readonly-state">{en ? "Read-only access" : "عرض فقط"}</p>
      )}
      {archiveConfirmationOpen ? (
        <div role="dialog" data-testid="contact-archive-dialog">
          <button
            type="button"
            data-testid="contact-archive-cancel"
            disabled={mutation.isPending}
            onClick={() => setArchiveConfirmationOpen(false)}
          >
            {en ? "Cancel" : "إلغاء"}
          </button>
          <button
            type="button"
            data-testid="contact-archive-confirm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("ARCHIVED", { onSuccess: () => setArchiveConfirmationOpen(false) })}
          >
            {en ? "Confirm archive" : "تأكيد الأرشفة"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
