import LegalPageLayout from './LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Uslovi korišćenja">
      <p className="text-xs text-muted-foreground">Poslednje ažuriranje: 22. april 2026.</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">1. Opšte odredbe</h2>
        <p>
          Korišćenjem sajta <strong className="text-foreground">kucabasta.rs</strong> i kupovinom preko
          internet prodavnice <strong className="text-foreground">Kuća Bašta</strong> prihvatate ove uslove.
          Ako se ne slažete, molimo vas da ne koristite sajt.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">2. Informacije o prodavcu</h2>
        <p>
          Podaci o pravnom licu prodavca, PIB-u, matičnom broju i adresi dostupni su na zahtev kupca i na
          dokumentima o kupovini (ponuda, račun, ugovor), u skladu sa važećim propisima.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">3. Proizvodi i cene</h2>
        <p>
          Trudimo se da su opisi, fotografije i cene tačni. Moguće su povremene tehničke greške ili
          rasprodaja zaliha — u tom slučaju ćemo vas obavestiti i predložiti zamenu ili povraćaj sredstava.
          Cene su iskazane u dinarima (RSD) sa uračunatim PDV-om, osim ako je drugačije naznačeno.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">4. Narudžbina i ugovor</h2>
        <p>
          Narudžbina predstavlja ponudu kupca. Ugovor se smatra zaključenim kada prodavac potvrdi narudžbinu
          (npr. e-mailom ili prikazom statusa u nalogu) ili kada robu otpremi. Zadržavamo pravo da odbijemo
          narudžbinu u slučaju očigledne greške u ceni ili nedostupnosti robe.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">5. Plaćanje i dostava</h2>
        <p>
          Načini plaćanja i dostave navedeni su na sajtu i u procesu plaćanja. Rokovi isporuke su
          informativnog karaktera; o kašnjenju ćemo vas obavestiti u razumnom roku.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">6. Odustanak od kupovine i reklamacije</h2>
        <p>
          Kao potrošač imate pravo na odustanak od ugovora na daljinu u roku od 14 dana od prijema robe,
          u skladu sa Zakonom o zaštiti potrošača, osim za robu za koju zakon predviđa izuzetke. Detalji o
          povratu i reklamacijama nalaze se na stranici „Politika povrata” i „Informacije o dostavi”.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">7. Odgovornost</h2>
        <p>
          Sajt se koristi na sopstvenu odgovornost. U meri dozvoljenoj zakonom, ne odgovaramo za indirektnu
          štetu ili gubitak podataka nastao korišćenjem sajta. Obaveze po osnovu kupovine uređene su
          važećim propisima o obligacionim odnosima i zaštiti potrošača.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">8. Intelektualna svojina</h2>
        <p>
          Sadržaj sajta (tekstovi, grafički elementi, logotip) zaštićen je i ne sme se umnožavati bez
          odobrenja, osim u dozvoljenim granicama citiranja.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">9. Izmene uslova</h2>
        <p>
          Možemo izmeniti ove uslove; važeća verzija je uvek objavljena na ovoj stranici sa datumom
          ažuriranja. Za narudžbine započete pre izmene primenjuju se uslovi koji su važili u trenutku
          narudžbine, osim ako zakon ne nalaže drugačije.
        </p>
      </section>
    </LegalPageLayout>
  );
}
