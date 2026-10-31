import { RESTAURANT } from "@/lib/data/menu";

export const LEGAL_LAST_UPDATED = "30. jun 2026.";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

const operatorBlock = `${RESTAURANT.name} (${RESTAURANT.address}), e-mail: ${RESTAURANT.email}, telefon: ${RESTAURANT.phone}.`;

export const PRIVACY_POLICY: LegalSection[] = [
  {
    title: "1. Uvod",
    paragraphs: [
      `Ova Politika privatnosti objašnjava kako ${RESTAURANT.name} prikuplja, koristi, čuva i štiti lične podatke korisnika sajta i usluge online poručivanja.`,
      "Poštujemo vašu privatnost i obrađujemo podatke u skladu sa važećim propisima Republike Srbije o zaštiti podataka o ličnosti.",
    ],
  },
  {
    title: "2. Rukovalac podacima",
    paragraphs: [operatorBlock],
  },
  {
    title: "3. Koje podatke prikupljamo",
    paragraphs: ["Možemo prikupljati sledeće kategorije podataka:"],
    list: [
      "Identifikacioni i kontakt podaci: ime i prezime, broj telefona, adresa e-pošte, adresa dostave.",
      "Podaci o porudžbini: izabrani proizvodi, napomene, način dostave i plaćanja, iznos porudžbine.",
      "Tehnički podaci: IP adresa, tip uređaja i pregledača, vreme pristupa sajtu (logovi servera).",
      "Podaci iz kolačića i lokalnog skladišta pregledača, u skladu sa Politikom kolačića.",
    ],
  },
  {
    title: "4. Svrha obrade",
    paragraphs: ["Vaše podatke obrađujemo radi:"],
    list: [
      "prijema, obrade i isporuke porudžbina;",
      "komunikacije sa vama o statusu porudžbine;",
      "poboljšanja kvaliteta usluge i bezbednosti sajta;",
      "ispunjavanja zakonskih obaveza (npr. računovodstvo i poreski propisi, kada je primenjivo).",
    ],
  },
  {
    title: "5. Pravni osnov obrade",
    paragraphs: [
      "Podatke obrađujemo na osnovu izvršenja ugovora (porudžina), vašeg pristanka (kada je potreban, npr. za određene kolačiće) i legitimnog interesa (bezbednost sistema i sprečavanje zloupotrebe).",
    ],
  },
  {
    title: "6. Čuvanje podataka",
    paragraphs: [
      "Podatke o porudžbinama čuvamo onoliko dugo koliko je potrebno za realizaciju usluge, rešavanje reklamacija i ispunjavanje zakonskih obaveza, a zatim ih bezbedno brišemo ili anonimizujemo.",
      "Podaci u lokalnom skladištu pregledača (npr. privremena korpa) ostaju na vašem uređaju dok ih sami ne obrišete ili dok ne isteknu.",
    ],
  },
  {
    title: "7. Deljenje podataka",
    paragraphs: [
      "Podatke ne prodajemo trećim licima. Možemo ih podeliti samo sa pouzdanim partnerima kada je to neophodno za pružanje usluge (npr. kurirske službe, procesor plaćanja), i to u neophodnoj meri.",
      "Pristup podacima imaju samo ovlašćena lica zaposlena ili angažovana kod rukovaoca.",
    ],
  },
  {
    title: "8. Vaša prava",
    paragraphs: ["Imate pravo da:"],
    list: [
      "zatražite pristup, ispravku ili brisanje svojih podataka;",
      "zatražite ograničenje obrade ili prigovorite obradi;",
      "povučete pristanak (kada je obrada zasnovana na pristanku);",
      "podnesete pritužbu nadležnom organu za zaštitu podataka o ličnosti.",
    ],
  },
  {
    title: "9. Bezbednost",
    paragraphs: [
      "Preduzimamo razumne tehničke i organizacione mere za zaštitu podataka od neovlašćenog pristupa, gubitka ili zloupotrebe.",
      "Iako nastojimo da sajt bude bezbedan, nijedan prenos podataka putem interneta ne može biti garantovan kao u potpunosti bez rizika.",
    ],
  },
  {
    title: "10. Kontakt",
    paragraphs: [
      `Za pitanja u vezi sa privatnošću pišite na ${RESTAURANT.email} ili nas pozovite na ${RESTAURANT.phone}.`,
    ],
  },
];

export const TERMS_OF_USE: LegalSection[] = [
  {
    title: "1. Opšte odredbe",
    paragraphs: [
      `Ovi Uslovi korišćenja regulišu korišćenje sajta i online poručivanja hrane putem ${RESTAURANT.name}.`,
      "Korišćenjem sajta i slanjem porudžbine potvrđujete da ste upoznati sa ovim uslovima i da ih prihvatate.",
    ],
  },
  {
    title: "2. Usluga",
    paragraphs: [
      `${RESTAURANT.name} nudi pripremu i prodaju burgera i pratećih proizvoda, sa mogućnošću dostave ili ličnog preuzimanja u Somboru, u skladu sa aktuelnom ponudom na sajtu.`,
      "Slike proizvoda su informativnog karaktera. Izgled jela može blago odstupati od fotografije.",
    ],
  },
  {
    title: "3. Poručivanje",
    paragraphs: ["Porudžbinu šaljete popunjavanjem formulara na sajtu. Porudžbina je prihvaćena kada dobijete potvrdu (na ekranu, putem porudžbenog broja ili kontakta restorana)."],
    list: [
      "Proverite tačnost adrese, broja telefona i sadržaja porudžbine pre slanja.",
      "Zadržavamo pravo da odbijemo ili otkažemo porudžbinu u slučaju nedostupnosti sastojaka, tehničkih problema ili sumnje na zloupotrebu.",
    ],
  },
  {
    title: "4. Cene i plaćanje",
    paragraphs: [
      "Cene su izražene u dinarima (RSD) i prikazane su uz porudžbinu pre potvrde.",
      "Aktuelne cene, akcije i uslov besplatne dostave (preko 1.500 RSD, kada je primenjivo) mogu se menjati bez prethodne najave na sajtu.",
      "Načini plaćanja dostupni su u toku poručivanja (gotovina, kartica — prema ponudi u trenutku porudžbine).",
    ],
  },
  {
    title: "5. Dostava i vreme pripreme",
    paragraphs: [
      "Procenjeno vreme pripreme i dostave je informativno i može varirati u zavisnosti od gužve, vremenskih uslova i udaljenosti.",
      "Radno vreme restorana: ponedeljak – nedelja, 10:00 – 24:00, osim ako na sajtu nije drugačije objavljeno.",
    ],
  },
  {
    title: "6. Reklamacije",
    paragraphs: [
      "Ukoliko niste zadovoljni porudžbinom, kontaktirajte nas u razumnom roku na broj telefona ili e-mail naveden na sajtu.",
      "Reklamacije rešavamo individualno, u skladu sa važećim propisima o zaštiti potrošača.",
    ],
  },
  {
    title: "7. Odgovornost",
    paragraphs: [
      "Ne odgovaramo za privremenu nedostupnost sajta usled održavanja, kvara interneta ili više sile.",
      "Korisnik je odgovoran za tačnost unetih podataka i bezbednost svog uređaja prilikom korišćenja sajta.",
    ],
  },
  {
    title: "8. Intelektualna svojina",
    paragraphs: [
      "Sadržaj sajta (tekstovi, vizuelni identitet, fotografije, logo) je vlasništvo Gandras Spot-a ili se koristi uz odgovarajuću dozvolu. Zabranjeno je neovlašćeno kopiranje i distribucija.",
    ],
  },
  {
    title: "9. Izmene uslova",
    paragraphs: [
      "Zadržavamo pravo izmene ovih uslova. Ažurirana verzija biće objavljena na ovoj stranici sa datumom poslednje izmene.",
    ],
  },
  {
    title: "10. Merodavno pravo",
    paragraphs: [
      "Na ove uslove primenjuje se pravo Republike Srbije. Za sporove je nadležan sud prema sedištu rukovaoca, osim kada je zakonom predviđeno drugačije.",
    ],
  },
];

export const COOKIE_POLICY: LegalSection[] = [
  {
    title: "1. Šta su kolačići",
    paragraphs: [
      "Kolačići (cookies) su male tekstualne datoteke koje sajt čuva na vašem uređaju kako bi radio ispravno, zapamtio određena podešavanja ili poboljšao korisničko iskustvo.",
      "Pored klasičnih kolačića, sajt može koristiti slične tehnologije kao što je lokalno skladište pregledača (localStorage).",
    ],
  },
  {
    title: "2. Koje kolačiće koristimo",
    paragraphs: ["Na sajtu Gandras Spot koristimo sledeće kategorije:"],
    list: [
      "Neophodni — omogućavaju osnovno funkcionisanje (npr. sesija, bezbednost, zapamtiti korpu porudžbine). Bez njih sajt ne bi radio pravilno.",
      "Funkcionalni — pamte vaše izbore (npr. korak u procesu poručivanja, privremeni sadržaj korpe u localStorage).",
      "Analitički — pomažu da razumemo kako se sajt koristi (broj poseta, popularne stranice). Koristimo ih samo uz vaš pristanak, ako su uključeni.",
      "Marketing — mogu se koristiti za merenje efikasnosti kampanja. Koristimo ih samo uz vaš pristanak, ako su uključeni.",
    ],
  },
  {
    title: "3. Kolačići trećih strana",
    paragraphs: [
      "Ako na sajtu budu uključene usluge trećih strana (npr. Google Analytics, Meta Pixel, mapa ili plaćanje karticom), te usluge mogu postavljati sopstvene kolačiće u skladu sa svojim pravilima.",
      "Spisak aktivnih alata biće ažuriran na ovoj stranici kada se takve usluge uvedu.",
    ],
  },
  {
    title: "4. Koliko dugo se čuvaju",
    paragraphs: [
      "Neophodni i sesijski kolačići obično traju do zatvaranja pregledača ili kratko nakon toga.",
      "Funkcionalni podaci u localStorage mogu ostati duže, dok ih sami ne obrišete ili dok ne isteknu prema podešavanjima sajta.",
      "Analitički i marketing kolačići, kada su aktivni, imaju rok trajanja definisan od strane provajdera (najčešće od nekoliko meseci do 24 meseca).",
    ],
  },
  {
    title: "5. Upravljanje kolačićima",
    paragraphs: ["Možete upravljati kolačićima na sledeće načine:"],
    list: [
      "putem banera za saglasnost na sajtu (Prihvati / Odbij neobavezne);",
      "podešavanjima svog internet pregledača (brisanje ili blokiranje kolačića);",
      "brisanjem podataka sajta u localStorage kroz podešavanja pregledača.",
    ],
  },
  {
    title: "6. Posledice odbijanja",
    paragraphs: [
      "Ako blokirate neophodne kolačiće, neke funkcije sajta (npr. poručivanje ili praćenje korpe) možda neće raditi ispravno.",
      "Odbijanje analitičkih i marketing kolačića ne utiče na osnovnu funkcionalnost poručivanja.",
    ],
  },
  {
    title: "7. Kontakt",
    paragraphs: [
      `Za pitanja o kolačićima kontaktirajte nas na ${RESTAURANT.email} ili ${RESTAURANT.phone}.`,
      "Više o obradi ličnih podataka pročitajte u Politici privatnosti.",
    ],
  },
];
