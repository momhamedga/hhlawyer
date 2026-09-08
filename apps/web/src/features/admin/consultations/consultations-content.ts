import type { ConsultationStatus } from "@hhlawyer/types";
import type { Locale } from "@/i18n/locale";

type ConsultationCopy = {
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
  service: string;
  allServices: string;
  fromDate: string;
  toDate: string;
  sort: string;
  pageSize: string;
  newest: string;
  oldest: string;
  appointmentSoonest: string;
  appointmentLatest: string;
  statusAscending: string;
  clearFilters: string;
  closeFilters: string;
  reference: string;
  client: string;
  requestedAppointment: string;
  received: string;
  viewDetails: string;
  pendingAttention: string;
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
  detailTitle: string;
  detailDescription: string;
  backToList: string;
  appointmentTitle: string;
  requestedDate: string;
  requestedTime: string;
  clientTitle: string;
  name: string;
  email: string;
  phone: string;
  emailClient: (name: string) => string;
  callClient: (name: string) => string;
  serviceTitle: string;
  clientMessageTitle: string;
  noMessage: string;
  metadataTitle: string;
  createdAt: string;
  updatedAt: string;
  workflowTitle: string;
  workflowDescription: string;
  readOnly: string;
  terminal: string;
  actionLabels: Record<ConsultationStatus, string>;
  dialogTitle: (action: string) => string;
  dialogDescription: (reference: string, status: string) => string;
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
  detailErrorTitle: string;
  detailErrorDescription: string;
};

export const consultationsContent: Record<Locale, ConsultationCopy> = {
  ar: {
    title: "طلبات الاستشارة",
    description: "مراجعة طلبات العملاء ومواعيدهم واتخاذ الإجراء المناسب وفق حالة كل طلب.",
    searchLabel: "البحث في طلبات الاستشارة",
    searchPlaceholder: "ابحث بالمرجع أو اسم العميل أو البريد أو الهاتف",
    filterButton: "عوامل التصفية",
    filterTitle: "تصفية قائمة الطلبات",
    filterDescription: "ضيّق نطاق الطلبات حسب الحالة أو الخدمة أو تاريخ الموعد.",
    activeFilters: (count) => `${count} من عوامل التصفية مفعّل`,
    status: "الحالة",
    allStatuses: "كل الحالات",
    service: "الخدمة القانونية",
    allServices: "كل الخدمات",
    fromDate: "الموعد من",
    toDate: "الموعد إلى",
    sort: "ترتيب النتائج",
    pageSize: "عدد الطلبات في الصفحة",
    newest: "الأحدث استلامًا",
    oldest: "الأقدم استلامًا",
    appointmentSoonest: "موعد الاستشارة: الأقرب",
    appointmentLatest: "موعد الاستشارة: الأبعد",
    statusAscending: "الحالة",
    clearFilters: "مسح عوامل التصفية",
    closeFilters: "إغلاق عوامل التصفية",
    reference: "المرجع",
    client: "العميل",
    requestedAppointment: "الموعد المطلوب",
    received: "تاريخ الاستلام",
    viewDetails: "عرض التفاصيل",
    pendingAttention: "يحتاج إلى مراجعة",
    listCaption: "قائمة طلبات الاستشارة الواردة",
    resultsSummary: (from, to, total) => `عرض ${from}–${to} من ${total} طلب`,
    pageSummary: (page, pages) => `الصفحة ${page} من ${pages}`,
    previous: "السابق",
    next: "التالي",
    loadingTitle: "جارٍ تحميل طلبات الاستشارة",
    loadingDescription: "نسترجع قائمة العمل الحالية بأمان.",
    emptyTitle: "لا توجد طلبات استشارة حاليًا",
    emptyDescription: "ستظهر الطلبات الجديدة هنا عند استلامها.",
    filteredEmptyTitle: "لا توجد نتائج مطابقة لعوامل التصفية الحالية",
    filteredEmptyDescription: "جرّب تعديل البحث أو مسح عوامل التصفية لعرض نطاق أوسع.",
    errorTitle: "تعذر تحميل طلبات الاستشارة",
    errorDescription: "لم نتمكن من استرجاع القائمة. حاول مرة أخرى.",
    forbiddenTitle: "لا يمكنك عرض طلبات الاستشارة",
    forbiddenDescription: "لا يملك حسابك صلاحية الوصول إلى هذه القائمة.",
    retry: "إعادة المحاولة",
    detailTitle: "طلب استشارة",
    detailDescription: "راجع الموعد وبيانات العميل وتفاصيل الطلب قبل تحديث مساره.",
    backToList: "العودة إلى طلبات الاستشارة",
    appointmentTitle: "الموعد المطلوب",
    requestedDate: "التاريخ المطلوب",
    requestedTime: "الوقت المطلوب",
    clientTitle: "بيانات العميل",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    emailClient: (name) => `إرسال بريد إلى ${name}`,
    callClient: (name) => `الاتصال بـ ${name}`,
    serviceTitle: "الخدمة القانونية",
    clientMessageTitle: "تفاصيل العميل",
    noMessage: "لم يرفق العميل تفاصيل إضافية.",
    metadataTitle: "بيانات الطلب",
    createdAt: "تم الاستلام",
    updatedAt: "آخر تحديث",
    workflowTitle: "إجراء الطلب",
    workflowDescription: "اختر فقط الخطوة التي تعكس الإجراء الفعلي المتخذ على الطلب.",
    readOnly: "يمكنك مراجعة هذا الطلب، لكن حسابك لا يملك صلاحية تغيير حالته.",
    terminal: "هذا الطلب في حالة نهائية ولا توجد له إجراءات أخرى.",
    actionLabels: {
      PENDING: "إعادة الطلب إلى قيد المراجعة",
      CONFIRMED: "تأكيد الاستشارة",
      RESCHEDULED: "تسجيل إعادة الجدولة",
      COMPLETED: "تسجيل اكتمال الاستشارة",
      CANCELLED: "إلغاء الطلب",
    },
    dialogTitle: (action) => `${action}؟`,
    dialogDescription: (reference, status) => `سيتم تحديث الطلب ${reference} إلى حالة «${status}». تأكد أن هذا يعكس الإجراء الفعلي.`,
    confirm: "تأكيد التحديث",
    cancel: "تراجع",
    updating: "جارٍ التحديث…",
    updateSuccess: "تم تحديث حالة الطلب بنجاح.",
    updateConflict: "تغيرت حالة الطلب لدى مستخدم آخر. تم تحديث البيانات الحالية.",
    updateForbidden: "لا يملك حسابك صلاحية تحديث حالة هذا الطلب.",
    updateNotFound: "لم يعد طلب الاستشارة متاحًا. تم تحديث البيانات.",
    updateError: "تعذر تحديث الحالة. لم يُسجّل أي تغيير؛ حاول مرة أخرى.",
    detailNotFoundTitle: "طلب الاستشارة غير موجود",
    detailNotFoundDescription: "قد يكون الرابط غير صحيح أو لم يعد الطلب متاحًا.",
    detailErrorTitle: "تعذر تحميل طلب الاستشارة",
    detailErrorDescription: "لم نتمكن من استرجاع بيانات الطلب. حاول مرة أخرى.",
  },
  en: {
    title: "Consultations",
    description: "Review client requests and appointment preferences, then take the appropriate next action.",
    searchLabel: "Search consultation requests",
    searchPlaceholder: "Search reference, client, email, or phone",
    filterButton: "Filters",
    filterTitle: "Filter the work queue",
    filterDescription: "Narrow requests by status, service, or requested appointment date.",
    activeFilters: (count) => `${count} active ${count === 1 ? "filter" : "filters"}`,
    status: "Status",
    allStatuses: "All statuses",
    service: "Legal service",
    allServices: "All services",
    fromDate: "Appointment from",
    toDate: "Appointment to",
    sort: "Sort results",
    pageSize: "Requests per page",
    newest: "Newest received",
    oldest: "Oldest received",
    appointmentSoonest: "Appointment: soonest",
    appointmentLatest: "Appointment: latest",
    statusAscending: "Status",
    clearFilters: "Clear filters",
    closeFilters: "Close filters",
    reference: "Reference",
    client: "Client",
    requestedAppointment: "Requested appointment",
    received: "Received",
    viewDetails: "View details",
    pendingAttention: "Needs review",
    listCaption: "Incoming consultation requests",
    resultsSummary: (from, to, total) => `Showing ${from}–${to} of ${total} requests`,
    pageSummary: (page, pages) => `Page ${page} of ${pages}`,
    previous: "Previous",
    next: "Next",
    loadingTitle: "Loading consultation requests",
    loadingDescription: "Retrieving the current work queue securely.",
    emptyTitle: "No consultation requests yet",
    emptyDescription: "New requests will appear here when they are received.",
    filteredEmptyTitle: "No results match the current filters",
    filteredEmptyDescription: "Adjust the search or clear filters to broaden the results.",
    errorTitle: "Consultation requests could not be loaded",
    errorDescription: "We could not retrieve the list. Try again.",
    forbiddenTitle: "Consultations are unavailable",
    forbiddenDescription: "Your account does not have permission to view this queue.",
    retry: "Try again",
    detailTitle: "Consultation request",
    detailDescription: "Review the appointment, client information, and request details before updating its workflow.",
    backToList: "Back to consultations",
    appointmentTitle: "Requested appointment",
    requestedDate: "Requested date",
    requestedTime: "Requested time",
    clientTitle: "Client information",
    name: "Full name",
    email: "Email address",
    phone: "Phone number",
    emailClient: (name) => `Email ${name}`,
    callClient: (name) => `Call ${name}`,
    serviceTitle: "Legal service",
    clientMessageTitle: "Client details",
    noMessage: "The client did not provide additional details.",
    metadataTitle: "Request metadata",
    createdAt: "Received",
    updatedAt: "Last updated",
    workflowTitle: "Request action",
    workflowDescription: "Choose only the next state that reflects the action actually taken on this request.",
    readOnly: "You can review this request, but your account cannot change its status.",
    terminal: "This request is in a final state and has no further actions.",
    actionLabels: {
      PENDING: "Return to pending review",
      CONFIRMED: "Confirm consultation",
      RESCHEDULED: "Mark as rescheduled",
      COMPLETED: "Mark as completed",
      CANCELLED: "Cancel request",
    },
    dialogTitle: (action) => `${action}?`,
    dialogDescription: (reference, status) => `This will update request ${reference} to “${status}”. Confirm that this reflects the action actually taken.`,
    confirm: "Confirm update",
    cancel: "Cancel",
    updating: "Updating…",
    updateSuccess: "The request status was updated.",
    updateConflict: "Another operator changed this request. The current data has been refreshed.",
    updateForbidden: "Your account cannot update this request.",
    updateNotFound: "This consultation is no longer available. The current data has been refreshed.",
    updateError: "The status could not be updated. No change was recorded; try again.",
    detailNotFoundTitle: "Consultation request not found",
    detailNotFoundDescription: "The link may be incorrect or the request is no longer available.",
    detailErrorTitle: "Consultation request could not be loaded",
    detailErrorDescription: "We could not retrieve this request. Try again.",
  },
};
