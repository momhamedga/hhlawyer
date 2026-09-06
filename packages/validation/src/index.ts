import { z } from "zod";

export const serviceSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4_000),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const BOOKING_TIME_SLOTS = ["09:00 AM", "10:30 AM", "01:00 PM", "04:30 PM"] as const;
export const DEFAULT_BUSINESS_TIME_ZONE = "Asia/Dubai";

export function calendarDateInTimeZone(now: Date, timeZone = DEFAULT_BUSINESS_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function consultationCalendarDates(now = new Date(), count = 7, timeZone = DEFAULT_BUSINESS_TIME_ZONE) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError("Consultation calendar date count must be a positive integer.");
  }

  const [year, month, day] = calendarDateInTimeZone(now, timeZone).split("-").map(Number);
  const firstDate = new Date(Date.UTC(year, month - 1, day, 12));

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(firstDate);
    date.setUTCDate(firstDate.getUTCDate() + index);
    return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
  });
}

export function isValidCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year
    && candidate.getUTCMonth() === month - 1
    && candidate.getUTCDate() === day;
}

const phoneSchema = z.string()
  .trim()
  .transform((value) => value.replace(/[\s().-]/g, "").replace(/^00/, "+"))
  .pipe(z.string().regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number."));

export const consultationSubmissionSchema = z.object({
  serviceId: z.string().cuid(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: phoneSchema,
  preferredDate: z.string().refine(isValidCalendarDate, "Enter a valid date in YYYY-MM-DD format."),
  preferredTime: z.enum(BOOKING_TIME_SLOTS),
  message: z.string().trim().max(2_000).optional().transform((value) => value || undefined),
  website: z.string().max(200).optional().default(""),
}).strict();

export const consultationSchema = consultationSubmissionSchema;

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5_000),
  website: z.string().max(200).optional().default(""),
}).strict();

export const contactMessageSchema = contactSubmissionSchema;

export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1).max(512) }).strict();
export const adminConsultationListSchema=z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),search:z.string().trim().max(150).optional(),status:z.enum(["PENDING","CONFIRMED","RESCHEDULED","COMPLETED","CANCELLED"]).optional(),serviceId:z.string().cuid().optional(),dateFrom:z.string().refine(isValidCalendarDate).optional(),dateTo:z.string().refine(isValidCalendarDate).optional(),sortBy:z.enum(["createdAt","preferredDate","status"]).default("createdAt"),sortOrder:z.enum(["asc","desc"]).default("desc")}).refine(v=>!v.dateFrom||!v.dateTo||v.dateFrom<=v.dateTo,{message:"dateFrom must not be after dateTo"});
export const consultationStatusUpdateSchema=z.object({status:z.enum(["PENDING","CONFIRMED","RESCHEDULED","COMPLETED","CANCELLED"])}).strict();
export const adminContactListSchema=z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),search:z.string().trim().max(150).optional(),status:z.enum(["UNREAD","READ","REPLIED","ARCHIVED"]).optional(),sortBy:z.enum(["createdAt","status"]).default("createdAt"),sortOrder:z.enum(["asc","desc"]).default("desc")});
export const contactStatusUpdateSchema=z.object({status:z.enum(["UNREAD","READ","REPLIED","ARCHIVED"])}).strict();
const adminUserRoleSchema=z.enum(["ADMIN","LAWYER","STAFF"]);
const adminUserPasswordSchema=z.string().min(12).max(512);
export const adminUsersListQuerySchema=z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),search:z.string().trim().max(150).optional(),role:adminUserRoleSchema.optional(),isActive:z.enum(["true","false"]).transform(value=>value==="true").optional(),sortBy:z.enum(["createdAt","name","email","role"]).default("createdAt"),sortOrder:z.enum(["asc","desc"]).default("desc")});
export const adminUserCreateSchema=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().toLowerCase().email().max(254),password:adminUserPasswordSchema,role:adminUserRoleSchema}).strict();
export const adminUserUpdateSchema=z.object({name:z.string().trim().min(2).max(100).optional(),email:z.string().trim().toLowerCase().email().max(254).optional()}).strict().refine(value=>Object.keys(value).length>0);
export const adminUserRoleUpdateSchema=z.object({role:adminUserRoleSchema}).strict();
export const adminUserStatusUpdateSchema=z.object({isActive:z.boolean()}).strict();
export const adminUserResetPasswordSchema=z.object({newPassword:adminUserPasswordSchema}).strict();
const adminServiceSlugSchema=z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).transform(value=>value.toLowerCase());
const adminServiceNameSchema=z.string().trim().min(1).max(160);
const adminServiceDescriptionSchema=z.string().trim().min(1).max(4_000);
const adminServiceSortOrderSchema=z.number().int().min(0).max(1_000_000);
export const adminServicesListQuerySchema=z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),search:z.string().trim().max(150).optional(),isActive:z.enum(["true","false"]).transform(value=>value==="true").optional(),sortBy:z.enum(["createdAt","name","slug","sortOrder"]).default("createdAt"),sortOrder:z.enum(["asc","desc"]).default("desc")});
export const adminServiceCreateSchema=z.object({slug:adminServiceSlugSchema,name:adminServiceNameSchema,description:adminServiceDescriptionSchema,isActive:z.boolean().default(true),sortOrder:adminServiceSortOrderSchema.default(0)}).strict();
export const adminServiceUpdateSchema=z.object({name:adminServiceNameSchema.optional(),description:adminServiceDescriptionSchema.optional(),sortOrder:adminServiceSortOrderSchema.optional()}).strict().refine(value=>Object.keys(value).length>0);
export const adminServiceStatusSchema=z.object({isActive:z.boolean()}).strict();
export const adminDashboardQuerySchema=z.object({range:z.enum(["7d","30d","90d"]).default("30d")}).strict();

export type ServiceInput = z.infer<typeof serviceSchema>;
export type ConsultationInput = z.infer<typeof consultationSchema>;
export type ConsultationSubmissionInput = z.infer<typeof consultationSubmissionSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
