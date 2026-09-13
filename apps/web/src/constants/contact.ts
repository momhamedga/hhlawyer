export interface ContactDetail {
  icon: string;
  label: string;
  value: string;
  href: string;
}

export const PUBLIC_CONTACT = {
  email: {
    display: "info@hhlawyer.ae",
    href: "mailto:info@hhlawyer.ae",
  },
  phone: {
    display: "026261565",
    href: "tel:+97126261565",
  },
} as const;

export const TEAM_CONTACTS = {
  hussein: {
    callHref: "tel:+971564322229",
    whatsappHref: "https://wa.me/971564322229",
  },
  mostafa: {
    callHref: "tel:+971502447609",
    whatsappHref: "https://wa.me/971502447609",
  },
} as const;

export const CONTACT_DATA: ContactDetail[] = [
  { icon: "📍", label: "الموقع", value: "دبي، البرج التجاري", href: "#" },
  { icon: "📞", label: "اتصل بنا", value: PUBLIC_CONTACT.phone.display, href: PUBLIC_CONTACT.phone.href },
  { icon: "✉️", label: "البريد", value: PUBLIC_CONTACT.email.display, href: PUBLIC_CONTACT.email.href },
];
