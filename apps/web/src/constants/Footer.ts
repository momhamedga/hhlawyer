import { FooterSection } from '@/types/Footer';

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "الخدمات",
    links: [
      { label: "القضايا التجارية", href: "/services/commercial" },
      { label: "الأحوال الشخصية", href: "/services/family" },
      { label: "القانون الجنائي", href: "/services/criminal" },
      { label: "التوثيق الخاص", href: "/services/notary" },
    ]
  },
  {
    title: "المكتب",
    links: [
      { label: "عن المؤسس", href: "/about" },
      { label: "فريق العمل", href: "/team" },
      { label: "المدونة القانونية", href: "/blog" },
      { label: "تواصل معنا", href: "/contact" },
    ]
  }
];