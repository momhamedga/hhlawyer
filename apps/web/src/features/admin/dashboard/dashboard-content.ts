import type { DashboardRange } from "@hhlawyer/types";
import type { Locale } from "@/i18n/locale";

type DashboardContent = {
  title: string;
  description: string;
  rangeLabel: string;
  ranges: Record<DashboardRange, string>;
  periodContext: (start: string, end: string) => string;
  loading: string;
  loadError: string;
  loadErrorDescription: string;
  retry: string;
  attentionRegion: string;
  attention: string;
  attentionDescription: string;
  unreadMessages: string;
  unreadDescription: string;
  newRequests: string;
  newRequestsDescription: string;
  activeServices: string;
  activeServicesDescription: string;
  latestConsultations: string;
  latestConsultationsDescription: string;
  noConsultations: string;
  noConsultationsDescription: string;
  requestedDate: string;
  received: string;
  viewAllConsultations: string;
  recentMessages: string;
  recentMessagesDescription: string;
  noMessages: string;
  noMessagesDescription: string;
  viewAllMessages: string;
  recentActivity: string;
  recentActivityDescription: string;
  noActivity: string;
  noActivityDescription: string;
  activityFallback: string;
  system: string;
  quickActions: string;
  quickActionsDescription: string;
  consultationsAction: string;
  consultationsActionDescription: string;
  messagesAction: string;
  messagesActionDescription: string;
  servicesAction: string;
  servicesActionDescription: string;
  teamAction: string;
  teamActionDescription: string;
};

export const dashboardContent: Record<Locale, DashboardContent> = {
  ar: {
    title: "نظرة عامة",
    description: "مساحة تشغيلية لمتابعة الطلبات والرسائل وما يحتاج إلى إجراء.",
    rangeLabel: "نطاق الطلبات الجديدة",
    ranges: { "7d": "آخر 7 أيام", "30d": "آخر 30 يومًا", "90d": "آخر 90 يومًا" },
    periodContext: (start, end) => `الطلبات المستلمة من ${start} إلى ${end}`,
    loading: "جارٍ تحميل نظرة عامة تشغيلية",
    loadError: "تعذر تحميل نظرة عامة",
    loadErrorDescription: "لم نتمكن من جلب البيانات التشغيلية الآن. يمكنك إعادة المحاولة بأمان.",
    retry: "إعادة المحاولة",
    attentionRegion: "ملخص ما يحتاج إلى متابعة",
    attention: "طلبات تحتاج إلى مراجعة",
    attentionDescription: "طلبات جديدة ما زالت قيد المراجعة",
    unreadMessages: "رسائل غير مقروءة",
    unreadDescription: "رسائل واردة تحتاج إلى الاطلاع",
    newRequests: "طلبات جديدة خلال الفترة",
    newRequestsDescription: "وفق نطاق التاريخ المحدد",
    activeServices: "خدمات متاحة للحجز",
    activeServicesDescription: "الخدمات النشطة حاليًا",
    latestConsultations: "أحدث طلبات الاستشارة",
    latestConsultationsDescription: "آخر خمسة طلبات مستلمة وموعد كل طلب.",
    noConsultations: "لا توجد طلبات استشارة حاليًا",
    noConsultationsDescription: "ستظهر أحدث الطلبات هنا عند استلامها.",
    requestedDate: "التاريخ المطلوب",
    received: "تم الاستلام",
    viewAllConsultations: "عرض كل طلبات الاستشارة",
    recentMessages: "أحدث الرسائل",
    recentMessagesDescription: "آخر خمس رسائل واردة وحالة متابعتها.",
    noMessages: "لا توجد رسائل حديثة",
    noMessagesDescription: "ستظهر أحدث رسائل التواصل هنا عند استلامها.",
    viewAllMessages: "عرض كل الرسائل",
    recentActivity: "النشاط الإداري الأخير",
    recentActivityDescription: "آخر الإجراءات المسجلة في سجل التدقيق.",
    noActivity: "لا يوجد نشاط إداري حديث",
    noActivityDescription: "ستظهر هنا الإجراءات المسجلة عند حدوثها.",
    activityFallback: "إجراء إداري",
    system: "النظام",
    quickActions: "وصول سريع",
    quickActionsDescription: "انتقل مباشرة إلى مساحات العمل الأساسية.",
    consultationsAction: "طلبات الاستشارة",
    consultationsActionDescription: "مراجعة الطلبات وتحديث حالاتها",
    messagesAction: "الرسائل",
    messagesActionDescription: "قراءة رسائل العملاء ومتابعتها",
    servicesAction: "الخدمات",
    servicesActionDescription: "إدارة الخدمات المتاحة للحجز",
    teamAction: "فريق العمل",
    teamActionDescription: "إدارة المستخدمين والصلاحيات",
  },
  en: {
    title: "Overview",
    description: "An operational view of requests, messages, and work that needs attention.",
    rangeLabel: "New-request range",
    ranges: { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" },
    periodContext: (start, end) => `Requests received from ${start} to ${end}`,
    loading: "Loading the operational overview",
    loadError: "The overview could not be loaded",
    loadErrorDescription: "We could not retrieve the operational data right now. You can safely try again.",
    retry: "Try again",
    attentionRegion: "Work requiring attention",
    attention: "Requests needing review",
    attentionDescription: "New requests that are still pending review",
    unreadMessages: "Unread messages",
    unreadDescription: "Incoming messages awaiting review",
    newRequests: "New requests in this period",
    newRequestsDescription: "Based on the selected date range",
    activeServices: "Services open for booking",
    activeServicesDescription: "Services currently active",
    latestConsultations: "Latest consultation requests",
    latestConsultationsDescription: "The five most recently received requests and their requested dates.",
    noConsultations: "No consultations at the moment",
    noConsultationsDescription: "The latest requests will appear here when they arrive.",
    requestedDate: "Requested date",
    received: "Received",
    viewAllConsultations: "View all consultations",
    recentMessages: "Recent messages",
    recentMessagesDescription: "The five latest incoming messages and their follow-up state.",
    noMessages: "No recent messages",
    noMessagesDescription: "The latest contact messages will appear here when they arrive.",
    viewAllMessages: "View all messages",
    recentActivity: "Recent admin activity",
    recentActivityDescription: "The latest actions recorded in the audit trail.",
    noActivity: "No recent admin activity",
    noActivityDescription: "Recorded administrative actions will appear here.",
    activityFallback: "Admin action",
    system: "System",
    quickActions: "Quick access",
    quickActionsDescription: "Go directly to the office's core workspaces.",
    consultationsAction: "Consultations",
    consultationsActionDescription: "Review requests and update their status",
    messagesAction: "Messages",
    messagesActionDescription: "Read and follow up on client messages",
    servicesAction: "Services",
    servicesActionDescription: "Manage services available for booking",
    teamAction: "Team",
    teamActionDescription: "Manage users and permissions",
  },
};
