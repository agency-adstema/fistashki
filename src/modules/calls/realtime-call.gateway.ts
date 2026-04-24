import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const WS = require('ws');
type WsClient = import('ws');

interface PendingOrder {
  orderNumber: string;
  total: number;
  currency: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

interface RealtimeSession {
  clientId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  pendingOrders: PendingOrder[];
  socket: WsClient;
  openaiWs?: WsClient;
  transcript: Array<{ role: 'ai' | 'customer'; text: string; timestamp: number }>;
  startTime: number;
  audioBuffer: Buffer[];
}

@WebSocketGateway({ path: '/ws/calls' })
@Injectable()
export class RealtimeCallGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: any;
  private readonly logger = new Logger(RealtimeCallGateway.name);
  private sessions = new Map<string, RealtimeSession>();

  constructor(private prisma: PrismaService) {}

  afterInit(server: any) {
    this.logger.log('WebSocket Gateway initialized at /ws/calls');
  }

  // Direktno handlamo raw poruke ovde umesto @SubscribeMessage
  handleConnection(client: WsClient) {
    this.logger.log('Client connected to call gateway');

    client.on('message', async (rawData: Buffer | string) => {
      try {
        const text = rawData.toString();
        const parsed = JSON.parse(text);

        // Podrži oba formata: {event, data} i {type, ...rest}
        const event = parsed.event || parsed.type;
        const data = parsed.data || parsed;

        this.logger.log(`Received message: event=${event}`);

        if (event === 'start_call') {
          await this.handleStartCall(client, data);
        } else if (event === 'audio_data') {
          await this.handleAudioData(client, data);
        } else if (event === 'end_call') {
          await this.handleEndCall(client, data);
        }
      } catch (err) {
        this.logger.error(`Error processing message: ${err.message}`);
      }
    });
  }

  handleDisconnect(client: WsClient) {
    this.logger.log('Client disconnected from call gateway');
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.socket === client) {
        this.cleanupSession(sessionId);
      }
    }
  }

  private async handleStartCall(
    client: WsClient,
    data: {
      orderId?: string;
      customerId: string;
      customerName: string;
      phoneNumber: string;
      pendingOrders?: PendingOrder[];
    },
  ) {
    try {
      const sessionId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.logger.log(`Starting call session: ${sessionId} for ${data.customerName}`);

      // Fetch pending orders from DB if not provided
      let pendingOrders = data.pendingOrders || [];
      if (!pendingOrders.length && data.customerId) {
        const dbOrders = await this.prisma.order.findMany({
          where: { customerId: data.customerId, status: 'PENDING' },
          include: { items: true },
          take: 5,
        });
        pendingOrders = dbOrders.map((o) => ({
          orderNumber: o.orderNumber,
          total: parseFloat(String(o.grandTotal)),
          currency: o.currency,
          items: o.items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            price: parseFloat(String(i.unitPrice)),
          })),
        }));
      }

      const session: RealtimeSession = {
        clientId: sessionId,
        orderId: data.orderId || '',
        customerId: data.customerId,
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        pendingOrders,
        socket: client,
        transcript: [],
        startTime: Date.now(),
        audioBuffer: [],
      };

      this.sessions.set(sessionId, session);

      await this.connectToOpenAIRealtime(sessionId, session);

      client.send(
        JSON.stringify({
          type: 'call_started',
          sessionId,
          message: 'Poziv je počeo...',
        }),
      );
    } catch (error) {
      this.logger.error(`Error starting call: ${error.message}`);
      client.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  }

  private async handleAudioData(client: WsClient, data: { sessionId: string; audio: string }) {
    const session = this.sessions.get(data.sessionId);
    if (!session || !session.openaiWs) return;

    if (session.openaiWs.readyState === WS.OPEN) {
      session.openaiWs.send(
        JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: data.audio,
        }),
      );
    }
  }

  private async handleEndCall(client: WsClient, data: { sessionId: string }) {
    const session = this.sessions.get(data.sessionId);
    if (!session) return;

    await this.saveCallRecording(session);
    this.cleanupSession(data.sessionId);

    client.send(JSON.stringify({ type: 'call_ended', message: 'Poziv je završen' }));
  }

  private async connectToOpenAIRealtime(sessionId: string, session: RealtimeSession) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = 'gpt-4o-realtime-preview';
    // Dostupni glasovi: alloy, ash, ballad, coral, echo, sage, shimmer, verse, marin, cedar
    const voice = process.env.OPENAI_VOICE || 'shimmer';

    this.logger.log(`Connecting to OpenAI Realtime API: model=${model}`);

    const wsUrl = `wss://api.openai.com/v1/realtime?model=${model}`;

    const openaiWs = new WS(wsUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    openaiWs.on('open', async () => {
      this.logger.log(`OpenAI Realtime connected for session: ${sessionId}`);
      try {

      // Fetch product AI scripts from DB for all items in pending orders
      const allProductNames = session.pendingOrders.flatMap(o => o.items.map(i => i.name));
      let productAiScripts: Record<string, string> = {};
      if (allProductNames.length > 0) {
        const products = await this.prisma.product.findMany({
          where: { name: { in: allProductNames } },
          select: { name: true, aiCallScript: true, description: true, howToUse: true, benefits: true },
        });
        for (const p of products) {
          productAiScripts[p.name] = p.aiCallScript || '';
        }
      }

      // Pripremi podatke o porudžbinama za prompt
      const ime = session.customerName || 'Kupac';
      const ordersInfo = session.pendingOrders.length
        ? session.pendingOrders.map((o) => {
            const proizvodi = o.items.length
              ? o.items.map((i) => `${i.quantity}x ${i.name} (${i.price} ${o.currency})`).join(', ')
              : 'proizvodi';
            return `Porudžbina ${o.orderNumber}: ${proizvodi} — ukupno ${o.total} ${o.currency}`;
          }).join('\n')
        : 'jedna porudžbina';

      const prvaPorudzbina = session.pendingOrders[0];
      const nazivProizvoda = prvaPorudzbina?.items[0]?.name || 'proizvod';
      const cenaPorudzbine = prvaPorudzbina?.total || '';
      const valuta = prvaPorudzbina?.currency || 'RSD';

      // Pripremi product-specific znanje
      const productKnowledge = session.pendingOrders.flatMap(o => o.items.map(i => {
        const script = productAiScripts[i.name];
        return script ? `\nZNANJE O PROIZVODU "${i.name}":\n${script}` : '';
      })).filter(Boolean).join('\n');

      // Automatski dekliniramo ime u instrumental padež (srpska gramatika)
      const [firstName, ...lastNameParts] = ime.trim().split(' ');
      const lastName = lastNameParts.join(' ');
      const imeUInstrumentalu = this.declineToInstrumental(firstName);
      const imeZaPoziv = lastName ? `${imeUInstrumentalu} ${lastName}` : imeUInstrumentalu;

      const instructions = `JEZIK: Govoriš ISKLJUČIVO srpski. Nikada drugi jezik.

IDENTITET:
Ti si Ivana, operater call centra AdStema prodavnice. Govoriš kao prava žena iz Srbije — toplo, sigurno, prirodno. NIKADA ne zvučiš kao robot.

GLASOVNA LIČNOST:
- Tempo: normalan, kao u pravom razgovoru
- Pauze: "evo gledam...", "samo sekund...", "razumem..."
- Emocija: topla i pozitivna, ali prirodna
- Samopouzdanje: sigurno govoriš, ne oklevaš
- Ako ne razumeš — pitaj ponovo, bez nervoze
- Kad kupac govori — saslušaj do kraja pre nego odgovoriš

PODACI O KUPCU:
- Ime: ${ime}
- Porudžbine: ${ordersInfo}
${productKnowledge}

TOK POZIVA:
1. ČEKAJ ODGOVOR — počni sa "Dobar dan, da li govorim sa ${imeZaPoziv}?" i ČEKAJ da kupac kaže "da", "halo", "slušam" ili slično. Nastavi tek nakon odgovora.

2. PREDSTAVI SE:
   "Super, ja sam Ivana iz AdStema. Zovem vas u vezi porudžbine ${nazivProizvoda}."

3. SPECIFIČAN PRISTUP PO TIPU PROIZVODA:
   A) Ako je ELEKTRONIKA (miš, tastatura, kablovi, adapter...):
      "Vidim da ste poručili ${nazivProizvoda} za ${cenaPorudzbine} ${valuta}. Zovem samo da potvrdimo dostavu — sve ste proverili, paket možemo odmah da pošaljemo?"
   
   B) Ako je PREPARAT/SUPLEMENT/ZDRAVLJE (mast, krem, kapsula, sirup, preparat...):
      "Vidim da ste poručili ${nazivProizvoda}. Pre nego potvrdimo, imam samo par informacija koje vam mogu biti korisne..."
      → objasni kako se koristi (iz znanja o proizvodu)
      → naglasi prednosti
      → pitaj da li imaju pitanja
      "Da li sve ovo odgovara vašim potrebama i da li da pošaljemo paket?"
   
   C) Ostali proizvodi — standardni tok potvrde

4. POTVRDA:
   "Da li da pošaljemo paket?"
   → DA: pređi na adresu
   → OKLEVAJU: "Razumem. Plaćanje je tek pri preuzimanju, nema rizika."

5. ADRESA:
   "Samo da proverimo adresu — jel' je ista adresa?"

6. UPSELL (opcionalno, prirodno):
   "Usput, imamo akciju — uz ${nazivProizvoda} mnogi uzimaju i [komplementarni proizvod] — da li vas zanima?"

7. ZATVARANJE:
   "Odlično! Paket kreće danas-sutra, stiže za 1-2 dana. Hvala i lep dan!"

OBRADA PRIGOVORA:

"Nisam zainteresovan" → "Razumem, može li da znam razlog? Da vidim šta mogu da učinim za vas."
   → Ako i dalje ne želi: "Nema problema, otkazujem bez ikakvih obaveza. Hvala na vremenu!"

"Nemam para" → "Razumem potpuno. Samo da znate — plaćate tek kad paket stigne, ni dinara unapred."

"Nisam ja naručio" → "Ah, moguće da je neko iz kućanstva? Ako nije, odmah storniram — bez problema."

"Razmisliću" → "Naravno! Porudžbina stoji 24h. Ako odlučite — tu smo. Ako ne — automatski se otkazuje."

"Loš kvalitet ranije" → "Žao mi je! Možete mi reći šta se desilo — da to ne ponovimo?"

Kupac govori nešto neočekivano → saslušaj, odgovori prirodno, vrati se na temu

ZABRANJENO:
- Ne zvuči robotski
- Ne forsiraj odbijanje
- Ne koristi engleski
- Ne postavljaj 2 pitanja odjednom
- Ne kažeš da si AI

ODMAH počni: "Dobar dan, da li govorim sa ${ime}?"`;

      openaiWs.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions,
          voice,
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: { model: 'whisper-1' },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 600,
          },
          temperature: 0.85,
        },
      }));
      } catch (openErr) {
        this.logger.error(`Error in OpenAI on('open') handler: ${openErr.message}\n${openErr.stack}`);
        session.socket.send(JSON.stringify({ type: 'error', message: `Greška pri konfiguraciji: ${openErr.message}` }));
      }
    });

    openaiWs.on('message', (rawData: Buffer) => {
      try {
        const message = JSON.parse(rawData.toString());

        switch (message.type) {
          case 'response.audio.delta':
            if (message.delta) {
              session.socket.send(JSON.stringify({ type: 'audio_output', audio: message.delta }));
              session.audioBuffer.push(Buffer.from(message.delta, 'base64'));
            }
            break;

          case 'response.audio_transcript.delta':
            if (message.delta) {
              const last = session.transcript[session.transcript.length - 1];
              if (last && last.role === 'ai') {
                last.text += message.delta;
              } else {
                session.transcript.push({ role: 'ai', text: message.delta, timestamp: Date.now() - session.startTime });
              }
              session.socket.send(JSON.stringify({ type: 'transcript_update', transcript: session.transcript }));
            }
            break;

          case 'conversation.item.input_audio_transcription.completed':
            if (message.transcript) {
              session.transcript.push({ role: 'customer', text: message.transcript, timestamp: Date.now() - session.startTime });
              session.socket.send(JSON.stringify({ type: 'transcript_update', transcript: session.transcript }));
            }
            break;

          case 'error':
            this.logger.error(`OpenAI error: ${JSON.stringify(message.error)}`);
            session.socket.send(JSON.stringify({ type: 'error', message: message.error?.message || 'OpenAI greška' }));
            break;

          case 'session.created':
            this.logger.log(`OpenAI session created for: ${sessionId}`);
            break;

          case 'session.updated':
            this.logger.log(`OpenAI session updated for: ${sessionId} — čekam da kupac kaže Halo`);
            // NE pokrećemo response.create odmah — čekamo VAD da detektuje kupčev glas
            // Ivana će progovoriti čim kupac kaže "Halo" (turn_detection)
            // Obaveštavamo frontend da je Ivana spremna
            session.socket.send(JSON.stringify({
              type: 'call_ready',
              message: 'Ivana je na vezi — recite Halo',
            }));
            break;

          case 'input_audio_buffer.speech_started':
            // Kupac je počeo da govori — VAD će automatski aktivirati Ivanu
            this.logger.log(`Kupac govori (VAD) — session: ${sessionId}`);
            session.socket.send(JSON.stringify({ type: 'customer_speaking' }));
            break;

          case 'input_audio_buffer.speech_stopped':
            session.socket.send(JSON.stringify({ type: 'customer_stopped' }));
            break;
        }
      } catch (err) {
        this.logger.error(`Error parsing OpenAI message: ${err.message}`);
      }
    });

    openaiWs.on('error', (err: Error) => {
      this.logger.error(`OpenAI WebSocket error: ${err.message}`);
      session.socket.send(JSON.stringify({ type: 'error', message: `OpenAI greška: ${err.message}` }));
    });

    openaiWs.on('close', (code: number, reason: Buffer) => {
      this.logger.log(`OpenAI WebSocket closed: code=${code}, reason=${reason?.toString()}`);
    });

    session.openaiWs = openaiWs;
  }

  private async saveCallRecording(session: RealtimeSession) {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'calls');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const audioPath = path.join(uploadsDir, `call-${session.clientId}.raw`);
      if (session.audioBuffer.length > 0) {
        fs.writeFileSync(audioPath, Buffer.concat(session.audioBuffer));
      }

      const logData: any = {
        callJobId: session.clientId,
        customerId: session.customerId,
        duration: Math.floor((Date.now() - session.startTime) / 1000),
        outcome: 'CONFIRMED',
        transcript: { messages: session.transcript },
        summary: `AI poziv sa ${session.customerName} — ${session.pendingOrders.length} pending porudžbina`,
        audioUrl: session.audioBuffer.length > 0 ? `/uploads/calls/call-${session.clientId}.raw` : null,
      };
      if (session.orderId) logData.orderId = session.orderId;

      await this.prisma.callLog.create({ data: logData });

      this.logger.log(`Call saved: ${session.clientId}`);
    } catch (err) {
      this.logger.error(`Error saving call: ${err.message}`);
    }
  }

  /**
   * Deklinira ime u instrumental padež srpskog jezika (sa kim?)
   * Muška i ženska imena koja se završavaju na -a: -a → -om
   * Muška imena na suglasnik: + om
   * Primeri: Miroslav→Miroslavom, Ivana→Ivanom, Vanja→Vanjom, Ana→Anom
   * Prezime se ne menja (ostaje kao jeste)
   */
  private declineToInstrumental(name: string): string {
    if (!name) return name;

    const n = name.trim();
    const lower = n.toLowerCase();

    // Posebni slučajevi
    const specials: Record<string, string> = {
      'nikola': 'Nikolom', 'luka': 'Lukom', 'sasha': 'Sašom', 'saša': 'Sašom',
      'đorđe': 'Đorđem', 'djordje': 'Đorđem', 'jovan': 'Jovanom',
      'stevan': 'Stevanom', 'dragan': 'Draganom', 'zoran': 'Zoranom',
      'nenad': 'Nenadom', 'bojan': 'Bojanom', 'dejan': 'Dejanom',
      'milan': 'Milanom', 'marko': 'Markom', 'stefan': 'Stefanom',
    };
    if (specials[lower]) return specials[lower];

    // Imena koja se završavaju na -ica (ženski rod)
    if (lower.endsWith('ica')) return n.slice(0, -1) + 'om'; // Milica→Milicom

    // Imena koja se završavaju na -ja (Vanja, Mija, Tija...)
    if (lower.endsWith('ja')) return n.slice(0, -1) + 'om'; // Vanja→Vanjom

    // Sva imena koja se završavaju na -a (muška i ženska: Ivana, Ana, Dragana...)
    if (lower.endsWith('a')) return n.slice(0, -1) + 'om'; // Ivana→Ivanom, Ana→Anom

    // Muška na -e (Đorđe, Miloše...)
    if (lower.endsWith('e')) return n + 'm'; // Miloše→Milošem

    // Muška na -o (Branko, Slobodan izuzetak...)
    if (lower.endsWith('o')) return n.slice(0, -1) + 'om';

    // Muška na suglasnik: Miroslav, Petar, Ivan, Aleksandar...
    return n + 'om';
  }

  private cleanupSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session?.openaiWs) {
      try { session.openaiWs.close(); } catch {}
    }
    this.sessions.delete(sessionId);
    this.logger.log(`Session cleaned up: ${sessionId}`);
  }
}
