import type { ContactMessageStatus } from "@hhlawyer/types";
import type { Locale } from "@/i18n/locale";

type MessagesCopy = {
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  filterButton: string;
  filterTitle: string;
  filterDescription: string;
  activeFilters: (count: number) => string;
  status: string;
  allStatuses: string;
  sort: string;
  pageSize: string;
  newest: string;
  oldest: string;
  statusAscending: string;
  clearFilters: string;
  closeFilters: string;
  sender: string;
  subject: string;
  received: string;
  updated: string;
  viewMessage: string;
  openMessage: (subject: string) => string;
  unreadAttention: string;
  listCaption: string;
  resultsSummary: (from: string, to: string, total: string) => string;
  pageSummary: (page: number, pages: number) => string;
  previous: string;
  next: string;
  loadingTitle: string;
  loadingDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  filteredEmptyTitle: string;
  filteredEmptyDescription: string;
  errorTitle: string;
  errorDescription: string;
  forbiddenTitle: string;
  forbiddenDescription: string;
  retry: string;
  detailDescription: string;
  backToList: string;
  senderTitle: string;
  name: string;
  email: string;
  openEmailClient: string;
  openEmailClientFor: (name: string) => string;
  messageTitle: string;
  metadataTitle: string;
  workflowTitle: string;
  workflowDescription: string;
  readOnly: string;
  terminal: string;
  actionLabels: Record<ContactMessageStatus, string>;
  dialogTitle: (action: string) => string;
  dialogDescription: (subject: string, status: string) => string;
  confirm: string;
  cancel: string;
  updating: string;
  updateSuccess: string;
  updateConflict: string;
  updateForbidden: string;
  updateNotFound: string;
  updateError: string;
  detailNotFoundTitle: string;
  detailNotFoundDescription: string;
};
export const messagesContent: Record<Locale, MessagesCopy> = {
  ar: {
    title: "الرسائل",
    description: "متابعة رسائل العملاء الواردة وقراءتها وتحديث حالتها التشغيلية بوضوح.",
    searchLabel: "البحث في الرسائل",
    searchPlaceholder: "ابحث باسم المرسل أو البريد أو الموضوع",
    filterButton: "التصفية والترتيب",
    filterTitle: "تصفية صندوق الرسائل",
    filterDescription: "اعرض الرسائل حسب حالتها ورتبها بما يناسب سير العمل.",
    activeFilters: (count) => `${count} من عوامل التصفية مفعّل`,
    status: "الحالة",
    allStatuses: "كل الرسائل",
    sort: "ترتيب الرسائل",
    pageSize: "عدد الرسائل في الصفحة",
    newest: "الأحدث أولًا",
    oldest: "الأقدم أولًا",
    statusAscending: "حسب الحالة",
    clearFilters: "مسح التصفية",
    closeFilters: "إغلاق",
    sender: "المرسل",
    subject: "الموضوع",
    received: "وقت الاستلام",
    updated: "آخر تحديث",
    viewMessage: "فتح الرسالة",
    openMessage: (subject) => `فتح رسالة: ${subject}`,
    unreadAttention: "تحتاج إلى القراءة",
    listCaption: "صندوق رسائل العملاء الواردة",
    resultsSummary: (from, to, total) => `عرض ${from}–${to} من ${total} رسالة`,
    pageSummary: (page, pages) => `الصفحة ${page} من ${pages}`,
    previous: "السابق",
    next: "التالي",
    loadingTitle: "جارٍ تحميل الرسائل",
    loadingDescription: "جارٍ استرجاع صندوق الرسائل الحالي بأمان.",
    emptyTitle: "لا توجد رسائل حاليًا",
    emptyDescription: "ستظهر رسائل العملاء الجديدة هنا عند استلامها.",
    filteredEmptyTitle: "لا توجد رسائل مطابقة لعوامل التصفية الحالية",
    filteredEmptyDescription: "غيّر البحث أو امسح التصفية لعرض نتائج أخرى.",
    errorTitle: "تعذر تحميل الرسائل",
    errorDescription: "لم نتمكن من استرجاع صندوق الرسائل. حاول مرة أخرى.",
    forbiddenTitle: "الرسائل غير متاحة",
    forbiddenDescription: "لا يملك حسابك صلاحية عرض صندوق الرسائل.",
    retry: "إعادة المحاولة",
    detailDescription: "راجع بيانات المرسل ومحتوى الرسالة قبل تحديث حالتها التشغيلية.",
    backToList: "العودة إلى الرسائل",
    senderTitle: "بيانات المرسل",
    name: "الاسم",
    email: "البريد الإلكتروني",
    openEmailClient: "فتح برنامج البريد",
    openEmailClientFor: (name) => `فتح برنامج البريد لمراسلة ${name}`,
    messageTitle: "محتوى الرسالة",
    metadataTitle: "بيانات السجل",
    workflowTitle: "إجراء الرسالة",
    workflowDescription: "اختر الحالة التالية فقط بعد تنفيذ الإجراء المقابل فعليًا.",
    readOnly: "يمكنك قراءة الرسالة، لكن حسابك لا يملك صلاحية تغيير حالتها.",
    terminal: "هذه الرسالة مؤرشفة ولا تتوفر لها إجراءات أخرى.",
    actionLabels: {
      UNREAD: "تحديد كغير مقروءة",
      READ: "تحديد كمقروءة",
      REPLIED: "تحديد كمُجاب عليها",
      ARCHIVED: "أرشفة الرسالة",
    },
    dialogTitle: (action) => `${action}؟`,
    dialogDescription: (subject, status) => `سيتم تحديث رسالة «${subject}» إلى حالة «${status}». أكّد أن هذا يعكس الإجراء الذي نُفذ فعليًا.`,
    confirm: "تأكيد التحديث",
    cancel: "إلغاء",
    updating: "جارٍ التحديث…",
    updateSuccess: "تم تحديث حالة الرسالة.",
    updateConflict: "غيّر مستخدم آخر حالة الرسالة. تم تحديث البيانات الحالية.",
    updateForbidden: "لا يملك حسابك صلاحية تحديث هذه الرسالة.",
    updateNotFound: "لم تعد الرسالة متاحة. تم تحديث البيانات الحالية.",
    updateError: "تعذر تحديث الحالة ولم يُسجل أي تغيير. حاول مرة أخرى.",
    detailNotFoundTitle: "الرسالة غير موجودة",
    detailNotFoundDescription: "قد يكون الرابط غير صحيح أو أن الرسالة لم تعد متاحة.",
  },
  en: {
    title: "Messages",
    description: "Review inbound client messages and keep their operational state accurate.",
    searchLabel: "Search messages",
    searchPlaceholder: "Search sender, email, or subject",
    filterButton: "Filter and sort",
    filterTitle: "Filter the message inbox",
    filterDescription: "Narrow messages by workflow state and choose a useful inbox order.",
    activeFilters: (count) => `${count} active ${count === 1 ? "filter" : "filters"}`,
    status: "Status",
    allStatuses: "All messages",
    sort: "Sort messages",
    pageSize: "Messages per page",
    newest: "Newest first",
    oldest: "Oldest first",
    statusAscending: "By status",
    clearFilters: "Clear filters",
    closeFilters: "Close",
    sender: "Sender",
    subject: "Subject",
    received: "Received",
    updated: "Last updated",
    viewMessage: "Open message",
    openMessage: (subject) => `Open message: ${subject}`,
    unreadAttention: "Needs reading",
    listCaption: "Inbound client message inbox",
    resultsSummary: (from, to, total) => `Showing ${from}–${to} of ${total} messages`,
    pageSummary: (page, pages) => `Page ${page} of ${pages}`,
    previous: "Previous",
    next: "Next",
    loadingTitle: "Loading messages",
    loadingDescription: "Retrieving the current inbox securely.",
    emptyTitle: "No client messages yet",
    emptyDescription: "New client messages will appear here when they are received.",
    filteredEmptyTitle: "No messages match the current filters",
    filteredEmptyDescription: "Adjust the search or clear filters to broaden the results.",
    errorTitle: "Messages could not be loaded",
    errorDescription: "We could not retrieve the inbox. Try again.",
    forbiddenTitle: "Messages are unavailable",
    forbiddenDescription: "Your account does not have permission to view this inbox.",
    retry: "Try again",
    detailDescription: "Review the sender and message before updating its operational state.",
    backToList: "Back to messages",
    senderTitle: "Sender information",
    name: "Name",
    email: "Email address",
    openEmailClient: "Open email client",
    openEmailClientFor: (name) => `Open email client for ${name}`,
    messageTitle: "Message content",
    metadataTitle: "Record information",
    workflowTitle: "Message action",
    workflowDescription: "Choose the next state only after the corresponding action has actually happened.",
    readOnly: "You can read this message, but your account cannot change its status.",
    terminal: "This message is archived and has no further actions.",
    actionLabels: {
      UNREAD: "Mark as unread",
      READ: "Mark as read",
      REPLIED: "Mark as replied",
      ARCHIVED: "Archive message",
    },
    dialogTitle: (action) => `${action}?`,
    dialogDescription: (subject, status) => `This will update “${subject}” to “${status}”. Confirm that this reflects the action actually taken.`,
    confirm: "Confirm update",
    cancel: "Cancel",
    updating: "Updating…",
    updateSuccess: "The message status was updated.",
    updateConflict: "Another operator changed this message. The current data has been refreshed.",
    updateForbidden: "Your account cannot update this message.",
    updateNotFound: "This message is no longer available. The current data has been refreshed.",
    updateError: "The status could not be updated. No change was recorded; try again.",
    detailNotFoundTitle: "Message not found",
    detailNotFoundDescription: "The link may be incorrect or the message is no longer available.",
  },
};
