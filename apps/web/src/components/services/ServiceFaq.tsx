import { Minus, Plus } from "lucide-react";

import type { Locale } from "@/i18n/locale";
import { serviceFaqContent, type ServiceFaqSlug } from "@/i18n/service-faq-content";
import styles from "./ServiceFaq.module.css";

type ServiceFaqProps = {
  locale: Locale;
  serviceId: ServiceFaqSlug;
};

export function ServiceFaq({ locale, serviceId }: ServiceFaqProps) {
  const faq = serviceFaqContent[locale][serviceId];
  const titleId = `service-faq-title-${serviceId}`;

  return (
    <section className={styles.faq} data-service-faq={serviceId} data-testid="service-faq" aria-labelledby={titleId}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>{faq.eyebrow}</p><span aria-hidden="true">06</span></div>
        <div><h2 id={titleId}>{faq.title}</h2><p>{faq.intro}</p></div>
      </header>
      <div className={styles.list}>
        {faq.items.map((item, index) => (
          <details className={styles.item} data-faq-id={item.id} data-faq-intent={item.intent} key={item.id}>
            <summary>
              <span aria-hidden="true" className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.question}>{item.question}</span>
              <span aria-hidden="true" className={styles.icon}><Plus className={styles.plus} size={18} strokeWidth={1.6} /><Minus className={styles.minus} size={18} strokeWidth={1.6} /></span>
            </summary>
            <div className={styles.answer}><p>{item.answer}</p></div>
          </details>
        ))}
      </div>
    </section>
  );
}
