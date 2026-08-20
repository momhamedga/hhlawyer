export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    fields?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type UserRole = "ADMIN" | "LAWYER" | "STAFF";
export type ConsultationStatus = "PENDING" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED";
export type ContactMessageStatus = "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";

export interface ConsultationSubmission {
  serviceId: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  website?: string;
}

export interface ConsultationCreated {
  referenceNumber: string;
  status: "PENDING";
  createdAt: string;
}

export interface PublicService {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

export interface ContactMessageCreated {
  status: "received";
  createdAt: string;
}

export interface AuthUser { id: string; name: string; email: string; role: UserRole; }

export interface AdminConsultationService {
  id: string;
  slug: string;
  name: string;
}

export interface AdminConsultationListItem {
  id: string;
  referenceNumber: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  status: ConsultationStatus;
  createdAt: string;
  service: AdminConsultationService;
}

export interface AdminConsultationDetail extends AdminConsultationListItem {
  message: string | null;
  updatedAt: string;
}

export interface AdminConsultationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminConsultationListResponse {
  items: AdminConsultationListItem[];
  pagination: AdminConsultationPagination;
}

export interface AdminConsultationStatusUpdateInput {
  status: ConsultationStatus;
}

export interface AdminContactListItem { id:string; name:string; email:string; subject:string; status:ContactMessageStatus; createdAt:string; updatedAt:string; }
export interface AdminContactDetail extends AdminContactListItem { message:string; }
export interface AdminContactListResponse { items:AdminContactListItem[]; pagination:AdminConsultationPagination; }
export interface AdminContactStatusUpdateInput { status:ContactMessageStatus; }
export interface AdminUserListItem { id:string; name:string; email:string; role:UserRole; isActive:boolean; createdAt:string; updatedAt:string; }
export interface AdminUserDetail extends AdminUserListItem { lockedUntil:string|null; lastLoginAt:string|null; }
export interface AdminUsersListResponse { items:AdminUserListItem[]; pagination:AdminConsultationPagination; }
export interface AdminUserCreateInput { name:string; email:string; password:string; role:UserRole; }
export interface AdminUserUpdateInput { name?:string; email?:string; }
export interface AdminUserRoleInput { role:UserRole; }
export interface AdminUserStatusInput { isActive:boolean; }
export interface AdminUserResetPasswordInput { newPassword:string; }
export interface AdminServiceListItem { id:string; slug:string; name:string; isActive:boolean; sortOrder:number; createdAt:string; updatedAt:string; }
export interface AdminServiceDetail extends AdminServiceListItem { description:string; }
export interface AdminServicesListResponse { items:AdminServiceListItem[]; pagination:AdminConsultationPagination; }
export interface AdminServiceCreateInput { slug:string; name:string; description:string; isActive?:boolean; sortOrder?:number; }
export interface AdminServiceUpdateInput { name?:string; description?:string; sortOrder?:number; }
export interface AdminServiceStatusInput { isActive:boolean; }
export type DashboardRange="7d"|"30d"|"90d";
export interface AdminDashboardActor { id:string; name:string; role:UserRole; }
export interface AdminDashboardRecentConsultation { id:string; referenceNumber:string; status:ConsultationStatus; preferredDate:string; createdAt:string; service:{id:string;slug:string;name:string}; }
export interface AdminDashboardRecentContact { id:string; subject:string; status:ContactMessageStatus; createdAt:string; }
export interface AdminDashboardRecentActivity { id:string; action:string; entity:string; entityId:string|null; createdAt:string; actor:AdminDashboardActor|null; }
export interface AdminDashboardOverview { authenticated:true; period:{range:DashboardRange;startsAt:string;endsAt:string}; consultations:{total:number;periodTotal:number;byStatus:Record<ConsultationStatus,number>}; contacts:{total:number;periodTotal:number;unread:number;byStatus:Record<ContactMessageStatus,number>}; services:{total:number;active:number;inactive:number}; users:{total:number;active:number;inactive:number;byRole:Record<UserRole,number>}; recentConsultations:AdminDashboardRecentConsultation[]; recentContacts:AdminDashboardRecentContact[]; recentActivity:AdminDashboardRecentActivity[]; }
