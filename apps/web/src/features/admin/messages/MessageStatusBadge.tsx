import type { ContactMessageStatus } from "@hhlawyer/types";
import { AdminStatusBadge } from "@/components/admin/foundation";
import { useLocale } from "@/components/providers/LocaleProvider";
import { displayEnum } from "@/i18n/format";
import { messageStatusTone } from "./messages-model";

export function MessageStatusBadge({ status }: { status: ContactMessageStatus }) {
  const locale = useLocale();
  return <AdminStatusBadge data-message-status={status} tone={messageStatusTone(status)}>{displayEnum(locale, status)}</AdminStatusBadge>;
}
