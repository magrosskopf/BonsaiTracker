import Head from "next/head";
import Link from "next/link";
import WaitlistRequestForm from "@/components/WaitlistRequestForm";

const DEFAULT_PUBLIC_APP_URL = "http://localhost:3000";

export const WAITLIST_PAGE_TITLE = "Bonsai Tracker Warteliste";
export const WAITLIST_META_DESCRIPTION =
  "Trag dich fuer Bonsai Tracker ein und erfahre als eine der ersten Personen, wenn die App fuer deine Bonsai-Dokumentation live geht.";
export const WAITLIST_FORM_TITLE = "Trag dich jetzt fuer den Launch ein";
export const WAITLIST_LOGIN_LINK_LABEL = "Schon Beta-Zugang? Zum Login";
export const WAITLIST_PREVIEW_IMAGE_PATH = "/waitlist-preview.svg";
export const WAITLIST_HERO_EYEBROW = "Bonsai Tracker";
export const WAITLIST_HERO_TITLE = "Behalte jeden Bonsai an einem Ort im Blick, bevor deine Notizen wieder ueberall verteilt liegen.";
export const WAITLIST_HERO_COPY =
  "Dokumentiere Pflege, Fortschritt und Bilder strukturiert in einer App und lass dir zum Launch direkt Bescheid geben.";
export const WAITLIST_PRIMARY_CTA_LABEL = "Jetzt auf die Warteliste";
export const WAITLIST_CTA_SUPPORT_COPY = "Kostenlos, unverbindlich und nur fuer die Launch-Benachrichtigung.";
export const WAITLIST_NEXT_STEPS = [
  "Du traegst deine E-Mail einmal ein.",
  "Wir informieren dich, sobald Bonsai Tracker fuer weitere Nutzer live geht.",
  "Dann entscheidest du in Ruhe, ob du direkt loslegen willst.",
];
export const WAITLIST_EXPECTATION_TITLE = "Was du nach der Anmeldung erwarten kannst";
export const WAITLIST_EXPECTATION_COPY =
  "Keine komplizierte Bewerbung und kein Marketing-Overload. Du bekommst vor allem eine klare Info, sobald Bonsai Tracker offiziell startet.";

export const WAITLIST_BENEFITS = [
  {
    title: "Pflege ohne Notizchaos",
    description: "Halte Giessen, Duengen, Umtopfen, Schnitt und Beobachtungen nachvollziehbar fest, statt sie auf mehrere Orte zu verteilen.",
  },
  {
    title: "Bilder mit echtem Verlauf",
    description: "Verbinde Fotos direkt mit Eintraegen, damit Fortschritte nicht nur gespeichert, sondern spaeter auch wieder verstaendlich werden.",
  },
  {
    title: "Zum richtigen Zeitpunkt starten",
    description: "Trag dich jetzt ein und erfahre fruehzeitig, wann Bonsai Tracker fuer weitere Nutzer verfuegbar ist.",
  },
];

export const WAITLIST_HIGHLIGHTS = [
  "Ein Ort fuer Sammlung, Pflegehistorie und Bilder",
  "Ideal fuer Bonsai-Fans, die ihre Entwicklung sauber dokumentieren wollen",
  "Fruehzeitig informiert werden, sobald der Launch startet",
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
                  description="Wenn du zum Start informiert werden willst, trag dich jetzt ein. Wir melden uns, sobald Bonsai Tracker fuer weitere Nutzer verfuegbar ist."
                  submitLabel="Launch-Platz vormerken"
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
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">Viele Bonsai-Notizen starten motiviert und verschwinden dann zwischen Fotos, Erinnerungen und losen Listen.</h2>
            <p className="mt-4 max-w-2xl text-base-content/74">
              Bonsai Tracker ist dafuer gedacht, die Entwicklung deiner Baeume konsistent festzuhalten: von Pflegeintervallen ueber einzelne Schritte bis hin zu Bildverlaeufen und Notizen, die spaeter noch Sinn ergeben.
            </p>
          </article>
          <article className="surface-section waitlist-note rounded-[2rem] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Fuer wen?</p>
            <p className="mt-4 text-lg leading-8 text-base-content/78">
              Fuer alle, die ihre Bonsai nicht nur besitzen, sondern Entwicklung, Pflege und Entscheidungen sauber dokumentieren wollen.
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
