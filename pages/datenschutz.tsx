export default function DatenschutzPage() {
  return (
    <main className="page-shell mx-auto max-w-4xl px-4 py-6">
      <section className="surface-section rounded-[2rem] p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Datenschutz</p>
        <h1 className="mt-2 text-3xl font-bold">Datenschutzerklärung</h1>

        <div className="legal-copy mt-8 space-y-8">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Verantwortliche Stelle</h2>
            <p>Marius Grosskopf Software- und Webentwicklung</p>
            <p>Marius Grosskopf</p>
            <p>Bürgstrasse</p>
            <p>74834 Elztal-N</p>
            <p>Germany</p>
            <p>E-Mail: info@magrosskopf.de</p>
            <p>Telefon: 015117641450</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Technische Bereitstellung der Website</h2>
            <p>
              Beim Aufruf dieser Website werden technisch erforderliche Informationen verarbeitet, damit die Anwendung
              ausgeliefert, stabil betrieben und gegen Störungen abgesichert werden kann. Dazu können insbesondere
              IP-Adresse, Browser- und Geräteinformationen, Datum und Uhrzeit des Zugriffs, aufgerufene Inhalte sowie
              technische Request-Daten gehören.
            </p>
            <p>
              Die Verarbeitung erfolgt zur sicheren technischen Bereitstellung, Fehleranalyse und Abwehr von Missbrauch.
              Rechtsgrundlage ist regelmäßig Art. 6 Abs. 1 lit. f DSGVO. Solche Daten werden nur so lange gespeichert,
              wie sie für den Betrieb, die Sicherheit und die Fehlerbehebung erforderlich sind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Anmeldung und Authentifizierung</h2>
            <p>
              Für die Anmeldung kann ein Social-Login über Google angeboten werden. Dabei werden die für die
              Authentifizierung erforderlichen Kontodaten, insbesondere E-Mail-Adresse, Name, technische
              Authentifizierungsdaten und Sitzungsinformationen, verarbeitet. Die Anmeldung wird über den Dienstleister
              Google vermittelt; dabei kann Google eigene Daten über den Anmeldevorgang verarbeiten.
            </p>
            <p>
              Zusätzlich kann eine Anmeldung per Magic Link per E-Mail bereitgestellt werden. In diesem Fall verarbeitet
              Supabase Auth Ihre E-Mail-Adresse, um einen Login-Link zu erzeugen und zu versenden. Für den SMTP-Versand
              kann Resend als Custom-SMTP-Dienstleister von Supabase Auth eingesetzt werden.
            </p>
            <p>
              Die Verarbeitung erfolgt zur Durchführung der angeforderten Anmeldung und zur Bereitstellung Ihres
              Nutzerzugangs auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO sowie für Sicherheitszwecke auf Grundlage von
              Art. 6 Abs. 1 lit. f DSGVO. Login-bezogene Token und Sitzungsinformationen werden nur so lange vorgehalten,
              wie sie für den Anmeldeprozess oder eine laufende Sitzung erforderlich sind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Registrierung und Missbrauchsschutz</h2>
            <p>
              Wenn Sie ein Konto erstellen oder sich anmelden, verarbeiten wir insbesondere Ihre E-Mail-Adresse und
              technische Authentifizierungsdaten. Zusätzlich können zur Missbrauchsvermeidung und Anfragedrosselung
              Ihre IP-Adresse, Zeitpunkte von Anfragen sowie der User-Agent Ihres Browsers verarbeitet werden.
            </p>
            <p>
              Diese Verarbeitung dient der Bereitstellung des Nutzerkontos und dem Schutz vor automatisierten oder
              missbräuchlichen Anfragen. Rechtsgrundlagen sind je nach Kontext Art. 6 Abs. 1 lit. b DSGVO für
              Konto- und Zugangsprozesse sowie Art. 6 Abs. 1 lit. f DSGVO für Sicherheits- und
              Missbrauchsschutzmaßnahmen. Kurzfristige Rate-Limit-Einträge werden nur solange gespeichert, wie sie
              technisch für den Schutz der Anwendung erforderlich sind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Nutzungsdaten innerhalb der Anwendung</h2>
            <p>
              Wenn Sie die Anwendung mit einem Nutzerkonto verwenden, verarbeiten wir die Daten, die Sie selbst
              eingeben oder innerhalb der App erzeugen. Dazu gehören insbesondere Profilangaben, Bonsai-Stammdaten,
              Pflege- und Entwicklungseinträge, Erinnerungen, Beiträge, Kommentare, Likes und sonstige inhaltliche
              Angaben, die Sie in der Anwendung speichern.
            </p>
            <p>
              Die Verarbeitung erfolgt zur Bereitstellung der von Ihnen genutzten Produktfunktionen auf Grundlage von
              Art. 6 Abs. 1 lit. b DSGVO. Die Daten bleiben grundsätzlich gespeichert, bis sie von Ihnen entfernt
              werden, Ihr Konto beendet wird oder die Speicherung für die jeweilige Funktion nicht mehr erforderlich ist,
              soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Bild-Uploads und Medienspeicherung</h2>
            <p>
              Wenn Sie Bilder hochladen, verarbeiten wir die von Ihnen bereitgestellten Mediendateien einschließlich
              technischer Metadaten wie Dateinamen, Dateityp und Zuordnung zu Ihren Inhalten. Die Speicherung erfolgt
              je nach technischer Konfiguration entweder lokal auf unserer Infrastruktur oder über einen angebundenen
              Speicherdienst von Supabase.
            </p>
            <p>
              Die Verarbeitung dient der Bereitstellung der Upload- und Galerie-Funktionen innerhalb der Anwendung und
              erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Medien bleiben gespeichert, bis sie von Ihnen oder
              im Zusammenhang mit dem zugehörigen Inhalt entfernt werden oder die Speicherung technisch nicht mehr
              erforderlich ist.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Google Analytics</h2>
            <p>
              Diese Website kann Google Analytics einsetzen, einen Webanalysedienst zur statistischen Auswertung der
              Nutzung. Google Analytics wird auf dieser Website nur aktiviert, wenn Sie über den Cookie-Banner oder die
              Cookie-Einstellungen ausdrücklich in das optionale Statistik-Tracking einwilligen. Ohne Ihre Einwilligung
              wird das Analytics-Script nicht geladen.
            </p>
            <p>
              Im Fall einer Aktivierung können insbesondere Nutzungsdaten, Seitenaufrufe, technische Geräte- und
              Browserinformationen sowie pseudonyme Kennungen an Google übermittelt und dort verarbeitet werden. Die
              Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.
            </p>
            <p>
              Soweit Google Daten außerhalb der EU bzw. des EWR verarbeitet, kann hierbei ein Drittlandbezug bestehen.
              Maßgeblich sind insoweit die datenschutzrechtlichen Bedingungen von Google. Analytics-Daten werden nur
              im Rahmen einer erteilten Einwilligung verarbeitet und bleiben nur so lange aktiv, bis Sie Ihre
              Einwilligung widerrufen oder die entsprechenden Daten nach den Einstellungen von Google gelöscht werden.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Einwilligung und Widerruf</h2>
            <p>
              Ihre Entscheidung zu optionalem Analytics-Tracking wird lokal in Ihrem Browser gespeichert, damit Ihre
              Auswahl bei weiteren Seitenaufrufen berücksichtigt werden kann.
            </p>
            <p>
              Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen oder neu erteilen. Nutzen
              Sie dazu den Link "Cookie-Einstellungen" im Footer der Website. Beim Widerruf wird Google Analytics für
              künftige Aufrufe deaktiviert; bereits vorhandene Analytics-Cookies werden dabei clientseitig bestmöglich
              entfernt.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Empfänger und Dienstleister</h2>
            <p>
              Personenbezogene Daten werden nur an solche Empfänger weitergegeben, die für den Betrieb der Anwendung
              erforderlich sind. Dazu können insbesondere technische Hosting- und Infrastruktur-Dienstleister,
              Authentifizierungsdienstleister wie Supabase Auth und Google für Social Login, E-Mail-Versanddienstleister
              für Login-Links, gegebenenfalls Speicherdienstleister für Medien sowie im Fall einer gesonderten Einwilligung Google als
              Analytics-Anbieter gehören.
            </p>
            <p>
              Eine darüber hinausgehende Weitergabe erfolgt nur, wenn hierfür eine gesetzliche Pflicht besteht oder sie
              zur Durchsetzung, Abwehr oder Geltendmachung von Rechtsansprüchen erforderlich ist.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Ihre Rechte</h2>
            <p>
              Sie haben nach Massgabe der gesetzlichen Voraussetzungen insbesondere das Recht auf Auskunft,
              Berichtigung, Löschung, Einschränkung der Verarbeitung sowie auf Widerspruch gegen die Verarbeitung
              Ihrer personenbezogenen Daten. Zudem besteht ein Recht auf Beschwerde bei einer zuständigen
              Datenschutzaufsichtsbehörde.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz können Sie sich an folgende Stelle wenden: info@magrosskopf.de
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
