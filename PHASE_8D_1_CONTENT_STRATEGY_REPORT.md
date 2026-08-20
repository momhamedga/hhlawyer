# Phase 8D.1 — Premium Arabic / English Legal Content Strategy

## 1. Executive Summary

Phase 8D.1 establishes a bilingual content foundation for the approved public experience without redesigning it. The published service copy is now held in one typed Arabic/English configuration, English service detail content is no longer maintained separately, and the locale homepage has targeted Arabic and English metadata. The visual system, DOM structure, routes, backend, database, and business logic were left unchanged.

The intended voice is precise rather than promotional: clear legal context, restrained language, and an explicit next step without promises of outcomes, timelines, fees, or results.

## 2. Existing Content Audit

| Area | Findings | Decision |
| --- | --- | --- |
| Homepage | The live editorial content is concise and founder-led; it answers practice, location, and next-step questions. | Retained; added locale-specific homepage metadata. |
| Services | Arabic source text, English summary text, and English detail features were split across three files. Several descriptions used broad assurances or generic positioning. | Consolidated into a typed bilingual service-content source and rewritten in a measured service voice. |
| Service detail | Existing hierarchy already provides overview, assistance, preparation, related services, and consultation CTA. | Retained; features now use the shared bilingual source. |
| About | Founder-led structure, local context, and private-practice tone are appropriate. Existing specific biography facts were not expanded or invented. | Retained. |
| Consultation | Explains intake, review, and appointment confirmation without promising a response time or legal outcome. | Retained. |
| Contact | Clearly distinguishes a general message from a structured consultation route. | Retained. |
| Header/footer | Navigation and CTA routes are descriptive and locale-aware. | Retained. |
| Forms and user-facing states | Labels, submission state, validation errors, and safe server-error messaging are already wired through `messages.ts`. | Retained; no logic change. |
| Legacy message data | Some historic, non-rendering home-message values are more promotional than the approved editorial pages. | Flagged for a future cleanup rather than deleting unrelated legacy data in this focused phase. |

## 3. Content Problems Found

- Service content had duplicated bilingual sources, which increased the risk of terminology drift.
- The prior service copy included outcome-adjacent language such as assurances, speed, and total compliance.
- Arabic commercial copy exposed English legal-entity terminology inside the Arabic interface.
- Page narrative copy is currently localized in several approved components; no new component-level bilingual copy was introduced in this phase. New service material is configuration-driven.
- Historic message data contains unused promotional wording and should not be used as a source for new public copy.

## 4. Brand Voice

The approved editorial voice follows six principles:

1. **Authority** — state the practice area and the useful next step plainly.
2. **Clarity** — prefer a short concrete sentence over abstract legal marketing.
3. **Discretion** — describe careful handling without claiming absolute security or outcomes.
4. **Confidence** — be composed and direct; avoid superlatives.
5. **Human guidance** — start from the person’s question, documents, and context.
6. **Professional restraint** — do not claim rankings, guarantees, response times, fees, case volumes, awards, admissions, or results without verified project data.

## 5. Arabic Voice

Arabic is contemporary, clear Modern Standard Arabic: respectful, concise, and natural in RTL. It uses expressions such as «فهم المسألة»، «الخطوة التالية»، و«المستندات ذات الصلة» instead of machine-like equivalents or heavy official phrasing. It avoids literal English insertions where a clear Arabic legal term exists.

## 6. English Voice

English is written as native professional legal-service copy: calm, concise, and precise. It avoids template phrasing such as “comprehensive legal solutions”, unqualified “trusted/expert/best”, and outcome-led language. It describes what a conversation or service can cover rather than promising its result.

## 7. Terminology Dictionary

| English preferred | Arabic preferred | Avoid |
| --- | --- | --- |
| Consultation | استشارة | جلسة مضمونة / تقييم حاسم |
| Legal consultation | استشارة قانونية | نصيحة مضمونة |
| Practice area | مجال الممارسة | تخصصات بلا سياق |
| Legal matter | مسألة قانونية | قضية عند عدم ثبوت وجود دعوى |
| Service | خدمة | حل شامل |
| Client | موكل | عميل في السياق التمثيلي القانوني |
| Request | طلب | حجز مؤكد قبل التأكيد الفعلي |
| Contact | تواصل | استشارة عند كون الرسالة عامة |
| Criminal Law | القانون الجنائي | قضايا جنائية فقط عند المقصود أوسع |
| Commercial and Corporate Law | القانون التجاري والشركات | المصطلحات الإنجليزية داخل العربية |
| Personal Status and Civil Matters | الأحوال الشخصية والمنازعات المدنية | القانون المدني عندما يشمل النص الأحوال الشخصية |
| Private Notary Services | خدمات الكاتب العدل الخاص | توثيق فوري / مضمون |
| Tax and Compliance | الضرائب والامتثال | تخفيض ضريبي مضمون |
| Abu Dhabi | أبوظبي | Abu Dhabi داخل واجهة عربية بلا حاجة |
| United Arab Emirates | دولة الإمارات العربية المتحدة | UAE داخل واجهة عربية بلا حاجة |

## 8. CTA System

| Intent | Arabic | English |
| --- | --- | --- |
| Primary consultation | رتّب استشارة / اطلب استشارة | Arrange a consultation / Request a consultation |
| Service exploration | استكشف مجالات الممارسة | Explore practice areas |
| Detail | عرض الخدمة | View service details |
| General contact | أرسل رسالة | Send a message |
| Next step | تابع إلى الوقت | Continue to time |

CTAs are specific to the action. “Learn more” is not used as a catch-all primary action.

## 9. Homepage Strategy

| Section | Purpose | User question | CTA / SEO role |
| --- | --- | --- | --- |
| Hero | Identify the practice, Abu Dhabi context, and immediate next action | Who are you and what do I do now? | Consultation and services; homepage title/description now use natural Abu Dhabi service intent. |
| Trust strip | Establish handling values | How will my matter be approached? | Supporting trust, not a legal claim. |
| Services index | Route a visitor to the relevant area | Which practice area fits my matter? | Internal links to service details. |
| Founder | Give the practice a human point of view | Who is behind the practice? | Link to About. |
| UAE context | Ground the practice geographically | Where is the practice based? | Abu Dhabi/UAE context without keyword stuffing. |
| Legal journey | Explain the conversation flow | What is the first step? | Link through to consultation. |
| Closing CTA | Offer a focused next action | How do I begin? | Consultation route. |

## 10. Services Strategy

Each service now follows the same content architecture:

1. Service title
2. Short positioning statement
3. User problem/context
4. What the service can cover
5. How the practice can assist
6. Information to prepare
7. When a consultation may be useful
8. Related services
9. Consultation CTA

The current UI renders the concise introduction, feature coverage, preparation prompt, related services, and CTA. The remaining items are content-architecture hooks for deeper content, not invented legal advice.

## 11. Service Detail Strategy

The live hierarchy is retained: **Overview → How we can help → Before the consultation → Related practice areas → Consultation CTA**. Future detail enrichment should add “Common matters” and an FAQ placeholder only after the FAQ phase; it must not invent procedures, deadlines, fees, or outcomes.

## 12. About Strategy

The About page remains founder-led. It should explain approach, confidentiality, local context, and practice links rather than manufacture credentials. No education, award, membership, admission, case-count, or years-of-experience claim was added.

## 13. Consultation Strategy

The page explains why intake details are collected, what the form needs, and the distinction between a request receipt and an appointment confirmation. No response-time promise has been introduced. Its content separates an inquiry from legal advice by framing the form as a request for a structured conversation.

## 14. Contact Strategy

Contact remains for a general message. Consultation remains the route for a structured legal matter. This distinction is explicit in the live contact intro and cross-link, avoiding duplicate-purpose pages.

## 15. SEO Strategy

- Every public route uses locale-aware metadata through the Next Metadata API.
- Homepage metadata now provides natural Arabic and English service intent with Abu Dhabi context.
- Service metadata is generated from the locale-aware service title and description.
- About, consultation, and contact metadata remains concise and page-specific.
- Canonical and alternate-language links are provided by `localizedMetadata`.
- No keyword stuffing or unsupported ranking claims are used.

## 16. Internal Linking

```text
Homepage → Services → Service detail → Consultation
Homepage → About → Services / Consultation
Contact → Consultation (when a structured legal matter is needed)
Service detail → Related practice areas
Future: Service detail → FAQ → Legal guide → Consultation
```

## 17. Accessibility Copy

- Buttons describe an action and destination.
- Service navigation uses the localized service name in accessible labels.
- Form fields retain explicit labels and validation messages.
- Success copy distinguishes receipt from appointment confirmation.
- Heading hierarchy is preserved; no DOM heading structure changed.
- Image alt text remains locale-aware and descriptive rather than decorative.

## 18. Translation Audit

Source review found no newly introduced English leakage in Arabic service content and no Arabic leakage in English service content. The focused locale E2E passed and verified route preservation, `dir`, `lang`, and locale font switching. Proper names, email, phone numbers, and international abbreviations remain valid exceptions.

## 19. Files Modified

- `apps/web/src/i18n/service-content.ts` — new typed Arabic/English service source.
- `apps/web/src/constants/Services.ts` — consumes Arabic service content rather than inline copy.
- `apps/web/src/i18n/format.ts` — consumes English service content.
- `apps/web/src/components/services/serviceDetailCopy.ts` — consumes shared English features.
- `apps/web/src/app/[locale]/page.tsx` — locale-aware homepage metadata.
- This report.

## 20. Tests

- Focused i18n routing E2E: PASS — 1/1.
- Responsive content QA: PASS — 4/4 cases, covering `/ar` and `/en`, light and dark themes, widths 360, 390, 430, 768, 1024, 1440, and 1920 across Services and Service Detail. No horizontal overflow detected.
- Lint: PASS.
- TypeScript: PASS.
- Build: PASS.
- `git diff --check`: PASS.

## 21. Responsive QA

Longer localized service descriptions were checked at all required widths. Service titles, description wrapping, detail feature copy, controls, and CTAs remained visible without horizontal overflow. The test used temporary local QA files only; those files were removed after execution.

## 22. Future FAQ Architecture

Phase 8D.2 should attach a small, source-backed FAQ collection to each service content key. FAQ entries must answer recurring process-level questions, link to consultation where personal advice is required, and avoid legal conclusions for an individual matter.

## 23. Future Matter Finder Architecture

Phase 8D.3 can map a user’s plain-language issue to a practice-area key, then route to the relevant service detail or consultation. It should ask only high-level classification questions and must not present a legal determination.

## 24. Future Legal Guides Architecture

Phase 8D.4 can add editorial guides as typed locale content linked from service details. Each guide should have a clear scope, update owner, publication date, service links, consultation CTA, and a disclaimer that general information is not tailored legal advice.

## 25. Final Decision

The approved public design and established business logic remain intact. The content foundation is now safer for bilingual service maintenance and ready for Phase 8D.2, but FAQ is deliberately not implemented in this phase.

PHASE 8D.1 STATUS

Content Audit: PASS

Brand Voice: PASS

Arabic Content: PASS

English Content: PASS

Arabic Native Quality: PASS

English Native Quality: PASS

Terminology: PASS

CTA System: PASS

Homepage Content: PASS

Services Content: PASS

Service Detail Content: PASS

About Content: PASS

Consultation Content: PASS

Contact Content: PASS

SEO Content: PASS

Internal Linking: PASS

Translation Leak Audit: PASS

Accessibility Copy: PASS

Responsive Content: PASS

Lint: PASS

TypeScript: PASS

Build: PASS

git diff --check: PASS

BACKEND CHANGED: NO

DATABASE CHANGED: NO

BUSINESS LOGIC CHANGED: NO

PUBLIC DESIGN CHANGED: NO

READY FOR PHASE 8D.2 — SMART FAQ PER SERVICE: YES
