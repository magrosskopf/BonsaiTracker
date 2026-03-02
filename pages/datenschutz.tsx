export default function DatenschutzPage() {
  return (
    <main className="page-shell mx-auto max-w-4xl px-4 py-6">
      <section className="surface-section rounded-[2rem] p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Datenschutz</p>
        <h1 className="mt-2 text-3xl font-bold">Datenschutzerklaerung</h1>

        <div className="legal-copy mt-8 space-y-8">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Verantwortliche Stelle</h2>
            <p>Marius Grosskopf Software- und Webentwicklung</p>
            <p>Marius Grosskopf</p>
            <p>Buergstrasse</p>
            <p>74834 Elztal-N</p>
            <p>Germany</p>
            <p>E-Mail: info@magrosskopf.de</p>
            <p>Telefon: 015117641450</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Allgemeine Datenverarbeitung</h2>
            <p>
              Beim Aufruf dieser Website werden technisch erforderliche Informationen verarbeitet, damit die Anwendung
              ausgeliefert, stabil betrieben und gegen Stoerungen abgesichert werden kann. Dazu koennen insbesondere
              Verbindungsdaten, Browserinformationen, Datum und Uhrzeit des Zugriffs sowie angeforderte Inhalte
              gehoeren.
            </p>
            <p>
              Wenn Sie Funktionen der Anwendung nutzen, koennen weitere Daten verarbeitet werden, die Sie selbst
              eingeben oder im Rahmen der Nutzung erzeugen. Die Verarbeitung erfolgt zur Bereitstellung der jeweiligen
              Dienste und Funktionen innerhalb der Anwendung.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Google Analytics</h2>
            <p>
              Diese Website kann Google Analytics einsetzen, einen Webanalysedienst zur statistischen Auswertung der
              Nutzung. Google Analytics wird auf dieser Website nur aktiviert, wenn Sie ueber den Cookie-Banner bzw.
              die Cookie-Einstellungen ausdruecklich in das optionale Statistik-Tracking einwilligen.
            </p>
            <p>
              Ohne Ihre Einwilligung wird Google Analytics nicht geladen. Die Rechtsgrundlage fuer die Verarbeitung im
              Fall einer Aktivierung ist Ihre Einwilligung gemaess Art. 6 Abs. 1 lit. a DSGVO.
            </p>
            <p>
              Bei aktivierter Analyse koennen Nutzungsinformationen an Google uebermittelt und dort verarbeitet werden.
              Die konkrete Google-Analytics-Mess-ID wird getrennt ueber die technische Konfiguration der Anwendung
              hinterlegt.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Einwilligung und Widerruf</h2>
            <p>
              Ihre Entscheidung zu optionalem Analytics-Tracking wird lokal in Ihrem Browser gespeichert, damit Ihre
              Auswahl bei weiteren Seitenaufrufen beruecksichtigt werden kann.
            </p>
            <p>
              Sie koennen Ihre Einwilligung jederzeit mit Wirkung fuer die Zukunft widerrufen oder neu erteilen. Nutzen
              Sie dazu den Link "Cookie-Einstellungen" im Footer der Website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Ihre Rechte</h2>
            <p>
              Sie haben nach Massgabe der gesetzlichen Voraussetzungen insbesondere das Recht auf Auskunft,
              Berichtigung, Loeschung, Einschraenkung der Verarbeitung sowie auf Widerspruch gegen die Verarbeitung
              Ihrer personenbezogenen Daten. Zudem besteht ein Recht auf Beschwerde bei einer zustaendigen
              Datenschutzaufsichtsbehoerde.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz koennen Sie sich an folgende Stelle wenden: info@magrosskopf.de
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
