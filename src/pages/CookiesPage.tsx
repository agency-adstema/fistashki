import LegalPageLayout from './LegalPageLayout';
import { Link } from 'react-router-dom';

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Politika kolačića (cookies)">
      <p className="text-xs text-muted-foreground">Poslednje ažuriranje: 22. april 2026.</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Šta su kolačići</h2>
        <p>
          Kolačići (cookies) su male tekstualne datoteke koje sajt čuva u vašem pregledaču. Pomažu nam da
          sajt radi ispravno, da zapamtimo vaše postavke i da bolje razumemo kako se sajt koristi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Koje kolačiće koristimo</h2>
        <p>Na kucabasta.rs mogu biti korišćeni:</p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>
            <strong className="text-foreground">Neophodni</strong> — omogućavaju osnovne funkcije (npr.
            korpa, sesija, bezbednost, učitavanje stranica).
          </li>
          <li>
            <strong className="text-foreground">Funkcionalni</strong> — pamte izbor jezika ili druge
            postavke koje olakšavaju kupovinu.
          </li>
          <li>
            <strong className="text-foreground">Analitički</strong> (ako ih uvedemo) — agregirane statistike o
            posetama, bez direktne identifikacije ličnosti, uz poštovanje podešavanja vašeg pregledača.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Upravljanje kolačićima</h2>
        <p>
          Većinu kolačića možete obrisati ili blokirati kroz podešavanja vašeg pregledača (Chrome, Firefox,
          Edge, Safari i dr.). Ako onemogućite neophodne kolačiće, neke funkcije sajta (npr. korpa ili
          prijava) možda neće raditi ispravno.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Treća lica</h2>
        <p>
          Ako koristimo alate trećih lica (npr. plaćanje, mapa, analitika), ti pružaoci mogu postavljati
          sopstvene kolačiće u skladu sa svojim politikama. Preporučujemo da pročitate njihove politike
          privatnosti.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Više informacija</h2>
        <p>
          Detaljnije o obradi ličnih podataka pročitajte u{' '}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            Politici privatnosti
          </Link>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
