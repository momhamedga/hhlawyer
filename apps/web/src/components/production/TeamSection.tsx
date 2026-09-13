import Image from "next/image";
import { MessageCircle, Phone } from "lucide-react";

import { TEAM_CONTACTS } from "@/constants/contact";
import type { Locale } from "@/i18n/locale";

import styles from "./TeamSection.module.css";

type TeamSectionProps = {
  locale: Locale;
};

const team = {
  ar: {
    eyebrow: "02 / فريق العمل",
    title: "فريق العمل",
    introduction: "يجمع مكتبنا خبرات قانونية تعمل بروح واحدة، بعناية ودقة وتواصل واضح في كل مسألة.",
    actions: { call: "اتصال", whatsapp: "واتساب" },
    members: [
      {
        alt: "صورة حسين الحارثي",
        contact: TEAM_CONTACTS.hussein,
        name: "حسين الحارثي",
        role: "محامٍ وكاتب عدل خاص",
        source: "/Hussein-Alharathi-2.webp",
      },
      {
        alt: "صورة المستشار مصطفى منصور",
        contact: TEAM_CONTACTS.mostafa,
        name: "المستشار مصطفى منصور",
        role: "مستشار قانوني",
        source: "/mostafa.webp",
      },
    ],
  },
  en: {
    eyebrow: "02 / Our Team",
    title: "Our Team",
    introduction: "Our legal professionals work together with care, precision, and clear communication at every stage of a matter.",
    actions: { call: "Call", whatsapp: "WhatsApp" },
    members: [
      {
        alt: "Portrait of Hussein Alharathi",
        contact: TEAM_CONTACTS.hussein,
        name: "Hussein Alharathi",
        role: "Lawyer & Private Notary",
        source: "/Hussein-Alharathi-2.webp",
      },
      {
        alt: "Portrait of Mostafa Mansour",
        contact: TEAM_CONTACTS.mostafa,
        name: "Mostafa Mansour",
        role: "Legal Consultant",
        source: "/mostafa.webp",
      },
    ],
  },
} as const;

export function TeamSection({ locale }: TeamSectionProps) {
  const content = team[locale];

  return (
    <section aria-labelledby="team-title" className={styles.team} data-testid="homepage-team">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <div>
            <h2 id="team-title">{content.title}</h2>
            <p>{content.introduction}</p>
          </div>
        </header>

        <div className={styles.members}>
          {content.members.map((member, index) => (
            <article className={styles.member} data-testid={`team-member-${index + 1}`} key={member.source}>
              <figure className={styles.portrait} data-portrait-source={member.source}>
                <Image
                  alt={member.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 800px) calc(100vw - 2.5rem), (max-width: 1280px) 43vw, 34rem"
                  src={member.source}
                />
                <span aria-hidden="true">0{index + 1}</span>
              </figure>
              <div className={styles.identity}>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
                <div className={styles.actions}>
                  <a aria-label={`${content.actions.call} ${member.name}`} href={member.contact.callHref}>
                    <Phone aria-hidden="true" size={16} strokeWidth={1.6} />
                    {content.actions.call}
                  </a>
                  <a aria-label={`${content.actions.whatsapp} ${member.name}`} href={member.contact.whatsappHref} rel="noopener noreferrer" target="_blank">
                    <MessageCircle aria-hidden="true" size={16} strokeWidth={1.6} />
                    {content.actions.whatsapp}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
