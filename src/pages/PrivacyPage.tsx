import LegalPageLayout from './LegalPageLayout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Politika privatnosti">
      <p className="text-xs text-muted-foreground">Poslednje ažuriranje: 22. april 2026.</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Uvod</h2>
        <p>
          Dobrodošli na internet prodavnicu <strong className="text-foreground">Kuća Bašta</strong> (dalje:
          „mi”, „nas”). Poštujemo vašu privatnost i obavezujemo se da lične podatke obrađujemo u skladu sa
          važećim propisima Republike Srbije i Opštom uredbom EU o zaštiti podataka (GDPR), u meri u kojoj je
          primenjiva na naše poslovanje.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Rukovalac podacima</h2>
        <p>
          Rukovalac ličnim podacima je pravno lice koje upravlja sajtom{' '}
          <strong className="text-foreground">kucabasta.rs</strong>. Za sva pitanja u vezi sa privatnošću
          možete nas kontaktirati putem kontakt stranice ili e-mail adrese navedene u sekciji „Kontakt” na
          sajtu.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Koje podatke prikupljamo</h2>
        <p>Možemo obrađivati sledeće kategorije podataka, u zavisnosti od toga kako koristite uslugu:</p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>identifikacioni i kontakt podaci (ime, prezime, adresa, e-mail, telefon);</li>
          <li>podaci o narudžbinama (stavke, iznosi, status isporuke);</li>
          <li>tehnički podaci (IP adresa, tip uređaja, pregledač, datum i vreme pristupa);</li>
          <li>podaci o korišćenju sajta i kolačićima (više u Politici kolačića).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Svrha i pravni osnov obrade</h2>
        <p>Podatke obrađujemo radi:</p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>zaključivanja i izvršenja ugovora o kupovini (isporuka robe, naplata);</li>
          <li>ispunjavanja zakonskih obaveza (računi, evidencije);</li>
          <li>poboljšanja sajta, bezbednosti i korisničkog iskustva;</li>
          <li>slanja obaveštenja o narudžbini, ako ste dali saglasnost gde je potrebno.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Čuvanje i zaštita</h2>
        <p>
          Podatke čuvamo onoliko dugo koliko je neophodno za ispunjenje svrhe obrade ili dok to zakon ne
          zahteva. Primenjujemo odgovarajuće tehničke i organizacione mere kako bismo zaštitili podatke od
          neovlašćenog pristupa, gubitka ili zloupotrebe.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">6. Deljenje sa trećim licima</h2>
        <p>
          Podatke možemo podeliti sa pouzdanim pružaocima usluga (npr. kurirska služba, procesor plaćanja,
          hosting) isključivo u meri potrebnoj za obradu narudžbine ili ispunjenje ugovora, uz ugovorne
          obaveze po pitanju poverljivosti. Ne prodajemo vaše lične podatke trećim licima.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">7. Vaša prava</h2>
        <p>Možete zatražiti:</p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>pristup ličnim podacima i ispravku netačnih podataka;</li>
          <li>brisanje ili ograničenje obrade, gde to zakon dozvoljava;</li>
          <li>prigovor na obradu u određenim slučajevima;</li>
          <li>prenosivost podataka, gde je primenjivo.</li>
        </ul>
        <p>Za ostvarivanje prava nas kontaktirajte putem kontakt kanala na sajtu.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">8. Izmene</h2>
        <p>
          Zadržavamo pravo da povremeno ažuriramo ovu politiku. Objava će biti na ovoj stranici sa datumom
          poslednjeg ažuriranja.
        </p>
      </section>
    </LegalPageLayout>
  );
}
