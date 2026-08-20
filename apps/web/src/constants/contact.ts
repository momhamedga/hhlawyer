export interface ContactDetail {
  icon: string;
  label: string;
  value: string;
  href: string;
}

export const CONTACT_DATA: ContactDetail[] = [
  { icon: "📍", label: "الموقع", value: "دبي، البرج التجاري", href: "#" },
  { icon: "📞", label: "اتصل بنا", value: "+971 50 XXX XXXX", href: "tel:+971500000000" },
  { icon: "✉️", label: "البريد", value: "law@hussain.ae", href: "mailto:law@hussain.ae" },
];