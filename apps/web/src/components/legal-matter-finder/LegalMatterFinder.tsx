"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, RotateCcw, Scale } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { localizePath } from "@/components/providers/LocaleProvider";
import { LAW_SERVICES } from "@/constants/Services";
import { localizeService } from "@/i18n/format";
import { legalMatterFinderContent } from "@/i18n/legal-matter-finder-content";
import type { Locale } from "@/i18n/locale";
import { finderQuestionIds, resolveLegalMatterFinder, type FinderAnswers, type FinderOptionId } from "@/lib/legal-matter-finder";
import styles from "./LegalMatterFinder.module.css";

export function LegalMatterFinder({ locale }: { locale: Locale }) {
  const content = legalMatterFinderContent[locale];
  const [answers, setAnswers] = useState<FinderAnswers>({});
  const [step, setStep] = useState(0);
  const selectionLock = useRef(false);
  const result = resolveLegalMatterFinder(answers);
  const question = content.questions[step];
  const go = (path: string) => localizePath(path, locale);

  useEffect(() => { selectionLock.current = false; }, [step]);

  function choose(optionId: FinderOptionId) {
    if (selectionLock.current) return;
    selectionLock.current = true;
    const questionId = finderQuestionIds[step];
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);
    setStep((current) => Math.min(current + 1, finderQuestionIds.length));
  }

  function goBack() {
    if (step === 0) return;
    setStep((current) => current - 1);
  }

  function restart() {
    selectionLock.current = false;
    setAnswers({});
    setStep(0);
  }

  if (result) {
    if (result.kind === "uncertain") {
      return <main className={styles.page} data-testid="legal-matter-finder"><section className={styles.result} data-finder-result="uncertain" data-testid="finder-result" aria-live="polite"><Scale aria-hidden="true" className={styles.resultIcon} size={29} strokeWidth={1.35} /><p className={styles.eyebrow}>{content.result.eyebrow}</p><h1>{content.result.uncertainTitle}</h1><p className={styles.resultLead}>{content.result.uncertainBody}</p><p className={styles.safety}>{content.result.safetyNote}</p><div className={styles.resultActions}><Link data-testid="finder-consultation-link" href={go("/consultation")}>{content.result.requestConsultation}<ArrowUpRight aria-hidden="true" size={17} /></Link><button data-testid="finder-restart" onClick={restart} type="button"><RotateCcw aria-hidden="true" size={16} />{content.result.startAgain}</button></div></section></main>;
    }

    const primary = LAW_SERVICES.find((service) => service.id === result.primary);
    const related = result.related ? LAW_SERVICES.find((service) => service.id === result.related) : undefined;
    if (!primary) return null;
    const primaryCopy = localizeService(locale, primary);
    const relatedCopy = related ? localizeService(locale, related) : undefined;

    return <main className={styles.page} data-testid="legal-matter-finder"><section className={styles.result} data-finder-result={result.primary} data-testid="finder-result" aria-live="polite"><Scale aria-hidden="true" className={styles.resultIcon} size={29} strokeWidth={1.35} /><p className={styles.eyebrow}>{content.result.eyebrow}</p><h1>{content.result.title}</h1><p className={styles.resultLead}>{content.result.body}</p><div className={styles.recommendation}><span aria-hidden="true">0{LAW_SERVICES.findIndex((service) => service.id === primary.id) + 1}</span><div><h2>{primaryCopy.title}</h2><p>{content.result.explanations[result.explanation]}</p></div></div>{related && relatedCopy ? <p className={styles.related}>{content.result.relatedLabel} <Link href={go(`/services/${related.id}`)}>{relatedCopy.title}</Link></p> : null}<p className={styles.safety}>{content.result.safetyNote}</p><div className={styles.resultActions}><Link data-testid="finder-service-link" href={go(`/services/${primary.id}`)}>{content.result.viewService}<ArrowUpRight aria-hidden="true" size={17} /></Link><Link data-testid="finder-consultation-link" href={go("/consultation")}>{content.result.requestConsultation}<ArrowUpRight aria-hidden="true" size={17} /></Link><button data-testid="finder-restart" onClick={restart} type="button"><RotateCcw aria-hidden="true" size={16} />{content.result.startAgain}</button></div></section></main>;
  }

  return <main className={styles.page} data-testid="legal-matter-finder"><section className={styles.finder} aria-labelledby="finder-title"><header className={styles.intro}><div><p className={styles.eyebrow}>{content.page.eyebrow}</p><h1 id="finder-title">{content.page.title}</h1></div><div><p>{content.page.intro}</p><p className={styles.privacy}>{content.page.privacy}</p></div></header><div className={styles.flow}><aside className={styles.context}><Scale aria-hidden="true" size={30} strokeWidth={1.25} /><span>{String(Math.min(step + 1, finderQuestionIds.length)).padStart(2, "0")} / {String(finderQuestionIds.length).padStart(2, "0")}</span><p>{content.page.progress}</p></aside><section className={styles.question} aria-labelledby={`finder-question-${question.id}`} key={question.id}><p className={styles.questionNumber}>{String(step + 1).padStart(2, "0")}</p><h2 id={`finder-question-${question.id}`}>{question.prompt}</h2><p>{question.helper}</p><div className={styles.options}>{question.options.map((option, index) => <button data-testid={`finder-option-${option.id}`} key={option.id} onClick={() => choose(option.id)} type="button"><span>0{index + 1}</span><strong>{option.label}</strong><small>{option.description}</small><ArrowUpRight aria-hidden="true" size={18} /></button>)}</div><div className={styles.navigation}><button aria-label={content.page.back} data-testid="finder-back" disabled={step === 0} onClick={goBack} type="button"><ArrowLeft aria-hidden="true" size={16} />{content.page.back}</button><button data-testid="finder-restart" onClick={restart} type="button"><RotateCcw aria-hidden="true" size={16} />{content.page.startAgain}</button></div></section></div></section></main>;
}
