import Head from "next/head";
import Link from "next/link";
import WaitlistRequestForm from "@/components/WaitlistRequestForm";

const DEFAULT_PUBLIC_APP_URL = "http://localhost:3000";

export const WAITLIST_PAGE_TITLE = "Bonsai Tracker Warteliste";
export const WAITLIST_META_DESCRIPTION =
  "Trag dich für Bonsai Tracker ein und wir geben dir Bescheid, sobald du die App für deine Bonsai nutzen kannst.";
export const WAITLIST_FORM_TITLE = "Setz dich auf die Warteliste";
export const WAITLIST_LOGIN_LINK_LABEL = "Schon Beta-Zugang? Zum Login";
export const WAITLIST_PREVIEW_IMAGE_PATH = "/waitlist-preview.svg";
export const WAITLIST_HERO_EYEBROW = "Bonsai Tracker";
export const WAITLIST_HERO_TITLE = "Alles zu deinen Bonsai an einem Ort, statt verteilt in Notizen, Fotos und Erinnerungen.";
export const WAITLIST_HERO_COPY =
  "Halte Pflege, Entwicklung und Bilder übersichtlich fest und lass dir einfach Bescheid geben, sobald du loslegen kannst.";
export const WAITLIST_PRIMARY_CTA_LABEL = "Jetzt auf die Warteliste";
export const WAITLIST_CTA_SUPPORT_COPY = "Kostenlos und unverbindlich. Wir schreiben dir nur, wenn es wirklich losgeht.";
export const WAITLIST_NEXT_STEPS = [
  "Du trägst deine E-Mail ein.",
  "Wir melden uns, sobald wir weitere Plätze freischalten.",
  "Dann kannst du in Ruhe entscheiden, ob du direkt starten möchtest.",
];
export const WAITLIST_EXPECTATION_TITLE = "Was du nach der Anmeldung erwarten kannst";
export const WAITLIST_EXPECTATION_COPY =
  "Keine Bewerbung, kein Spam und kein Druck. Du bekommst einfach eine kurze Nachricht, sobald es für dich losgehen kann.";

export const WAITLIST_BENEFITS = [
  {
    title: "Pflege ohne Notizchaos",
    description: "Halte Gießen, Düngen, Umtopfen, Schnitt und Beobachtungen an einem Ort fest, damit später nichts verloren geht.",
  },
  {
    title: "Bilder mit echtem Verlauf",
    description: "Ordne Fotos direkt deinen Einträgen zu, damit du Entwicklungen nicht nur sammelst, sondern später auch wirklich nachvollziehen kannst.",
  },
  {
    title: "Zum richtigen Zeitpunkt starten",
    description: "Trag dich ein und wir sagen dir Bescheid, sobald Bonsai Tracker für weitere Nutzer geöffnet wird.",
  },
];

export const WAITLIST_HIGHLIGHTS = [
  "Ein Ort für Pflege, Notizen und Bilder",
  "Für alle, die ihre Bonsai nicht nur pflegen, sondern auch nachvollziehbar dokumentieren wollen",
  "Eine kurze Nachricht, sobald du dabei sein kannst",
];

export function getPublicAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_PUBLIC_APP_URL).replace(/\/$/, "");
}

export function getWaitlistPageUrl(): string {
  return `${getPublicAppUrl()}/waitlist`;
}

export function getWaitlistPreviewImageUrl(): string {
  return `${getPublicAppUrl()}${WAITLIST_PREVIEW_IMAGE_PATH}`;
}

export default function WaitlistPage() {
  const pageUrl = getWaitlistPageUrl();
  const previewImageUrl = getWaitlistPreviewImageUrl();

  return (
    <>
      <Head>
        <title>{WAITLIST_PAGE_TITLE}</title>
        <meta name="description" content={WAITLIST_META_DESCRIPTION} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={WAITLIST_PAGE_TITLE} />
        <meta property="og:description" content={WAITLIST_META_DESCRIPTION} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={previewImageUrl} />
        <meta property="og:image:alt" content="Bonsai Tracker Warteliste" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={WAITLIST_PAGE_TITLE} />
        <meta name="twitter:description" content={WAITLIST_META_DESCRIPTION} />
        <meta name="twitter:image" content={previewImageUrl} />
      </Head>
      <main className="page-shell mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <section className="waitlist-hero hero-panel overflow-hidden rounded-[2.5rem] px-6 py-8 md:px-10 md:py-12">
          <div className="waitlist-hero__grid">
            <div className="waitlist-hero__copy space-y-6">
              <div className="badge badge-outline px-4 py-3 text-primary">Vor dem Launch</div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{WAITLIST_HERO_EYEBROW}</p>
                <h1 className="text-4xl font-bold leading-tight md:text-6xl">{WAITLIST_HERO_TITLE}</h1>
                <p className="max-w-2xl text-lg text-base-content/74 md:text-xl">{WAITLIST_HERO_COPY}</p>
              </div>
              <ul className="waitlist-highlight-list">
                {WAITLIST_HIGHLIGHTS.map((item) => (
                  <li key={item} className="waitlist-highlight-list__item">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="waitlist-cta-cluster">
                <Link href="#waitlist-form" className="btn btn-primary">
                  {WAITLIST_PRIMARY_CTA_LABEL}
                </Link>
                <Link href="/" className="btn btn-outline">
                  {WAITLIST_LOGIN_LINK_LABEL}
                </Link>
                <p className="waitlist-cta-support">{WAITLIST_CTA_SUPPORT_COPY}</p>
              </div>
            </div>

            <div className="waitlist-hero__form">
              <section id="waitlist-form" className="surface-section rounded-[2rem] p-6 md:p-8">
                <WaitlistRequestForm
                  title={WAITLIST_FORM_TITLE}
                  description="Wenn du beim Start dabei sein möchtest, trag dich hier ein. Wir melden uns, sobald wir weitere Nutzer freischalten."
                  submitLabel="Auf Warteliste setzen"
                  variant="feature"
                />
                <div className="waitlist-form-footnote mt-5">
                  <p>{WAITLIST_CTA_SUPPORT_COPY}</p>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="waitlist-story-grid mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="surface-section rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Warum jetzt?</p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">Viele Bonsai-Notizen starten motiviert und landen am Ende doch wieder verteilt zwischen Fotos, Erinnerungen und losen Listen.</h2>
            <p className="mt-4 max-w-2xl text-base-content/74">
              Bonsai Tracker soll dir helfen, die Entwicklung deiner Bäume sauber festzuhalten: von Pflegeintervallen über einzelne Maßnahmen bis hin zu Fotos und Notizen, die du auch Monate später noch einordnen kannst.
            </p>
          </article>
          <article className="surface-section waitlist-note rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Für wen?</p>
            <p className="mt-4 text-lg leading-8 text-base-content/78">
              Für alle, die bei ihren Bonsai nicht nur den aktuellen Stand sehen wollen, sondern auch den Weg dorthin.
            </p>
          </article>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {WAITLIST_BENEFITS.map((benefit) => (
            <article key={benefit.title} className="surface-section rounded-[2rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Feature</p>
              <h2 className="mt-3 text-2xl font-semibold">{benefit.title}</h2>
              <p className="mt-4 text-base-content/74">{benefit.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-section rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Was passiert nach der Anmeldung?</p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{WAITLIST_EXPECTATION_TITLE}</h2>
            <p className="mt-4 text-base-content/74">{WAITLIST_EXPECTATION_COPY}</p>
          </article>
          <article className="surface-section rounded-[2rem] p-6 md:p-8">
            <ol className="waitlist-step-list">
              {WAITLIST_NEXT_STEPS.map((step, index) => (
                <li key={step} className="waitlist-step-list__item">
                  <span className="waitlist-step-list__index">0{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>
        </section>
      </main>
    </>
  );
}
