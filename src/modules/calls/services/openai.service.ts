import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface TranscriptItem {
  role: 'ai' | 'customer';
  text: string;
  timestamp?: number;
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly model = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-1.5';
  private readonly voice = process.env.OPENAI_VOICE || 'nova';
  private readonly language = process.env.OPENAI_LANGUAGE || 'en';
  private readonly systemPrompt = process.env.OPENAI_SYSTEM_PROMPT || 'You are a helpful assistant.';

  constructor() {
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY not set. Using mock responses.');
    }
  }

  /**
   * Simulira razgovor sa AI korisćenjem OpenAI API
   * Za sada koristi HTTP zahteve, kasnije će biti WebSocket za real-time
   */
  async simulateCall(orderData: {
    orderNumber: string;
    customerName: string;
    total: number;
    currency: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<{
    transcript: any;
    summary: string;
    duration: number;
    outcome: 'CONFIRMED' | 'CANCELLED' | 'UPSELL' | 'CALLBACK' | 'NO_ANSWER' | 'FAILED';
  }> {
    try {
      const startTime = Date.now();
      this.logger.log(`Starting AI call simulation for order ${orderData.orderNumber}`);

      // Ako nema API key-a, koristi mock
      if (!this.apiKey) {
        return this.mockCall(orderData);
      }

      // Kreiraj conversation prompt za AI
      const conversationPrompt = `
        Trebate da pozoveš kupca o sledećoj narudžbini:
        
        Broj narudžbine: ${orderData.orderNumber}
        Kupac: ${orderData.customerName}
        Iznos: ${orderData.total} ${orderData.currency}
        Proizvodi: ${orderData.items.map((i) => `${i.name} (${i.quantity}x)`).join(', ')}
        
        Zadaci:
        1. Pozdravite kupca prijatnom prodajnom linijom
        2. Potrdite da je ovo o njegovoj narudžbini
        3. Objasnite što se nalazi u narudžbini
        4. Ponudite upsell proizvoda ako je prikladno
        5. Završite poziv sa zahvaljenjem
        
        Simulirajte raspored sa kupcem. Odgovori kupca su random ali realističan.
      `;

      // Pozovi OpenAI API za generisanje razgovora
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: this.systemPrompt,
            },
            {
              role: 'user',
              content: conversationPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const aiResponse = response.data.choices[0]?.message?.content || '';
      
      // Parse razgovora iz AI odgovora — vraća flat array
      const transcript = this.parseConversation(aiResponse);
      
      // Generiši summary
      const summary = await this.generateSummary(transcript, orderData);

      const duration = Math.floor((Date.now() - startTime) / 1000) || 30;

      // Determiniši outcome
      const outcome = this.determineOutcome(transcript);

      this.logger.log(
        `Call completed for order ${orderData.orderNumber}: ${outcome} (${duration}s)`,
      );

      return {
        transcript,
        summary,
        duration,
        outcome,
      };
    } catch (error) {
      this.logger.error(`Error in AI call simulation: ${error.message}`);
      // Fallback na mock ako je greška
      return this.mockCall(orderData);
    }
  }

  /**
   * Mock poziv ako API nije dostupan
   */
  private mockCall(orderData: {
    orderNumber: string;
    customerName: string;
    total: number;
    currency: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }) {
    const transcript = [
      {
        role: 'ai',
        text: `Zdravo, ${orderData.customerName}! Ovde je ${process.env.COMPANY_NAME || 'naša prodavnica'}. Zovem u vezi vaše narudžbine broj ${orderData.orderNumber}.`,
        timestamp: 0,
      },
      {
        role: 'customer',
        text: 'Zdravo, da, slušam.',
        timestamp: 3,
      },
      {
        role: 'ai',
        text: `Odlično! Vaša narudžbina iznosi ${orderData.total} ${orderData.currency} i uključuje: ${orderData.items.map((i) => `${i.name} (${i.quantity}x)`).join(', ')}. Da li možete potvrditi narudžbinu?`,
        timestamp: 5,
      },
      {
        role: 'customer',
        text: 'Da, potvrđujem. Sve je u redu.',
        timestamp: 10,
      },
      {
        role: 'ai',
        text: 'Sjajno! Narudžbina je potvrđena. Dostava će biti organizovana u najkraćem mogućem roku. Hvala što kupujete kod nas!',
        timestamp: 13,
      },
    ];

    const summary = `Kupac ${orderData.customerName} je potvrdio narudžbinu ${orderData.orderNumber} u vrednosti ${orderData.total} ${orderData.currency}. Dostava je zakazana.`;

    return {
      transcript,
      summary,
      duration: 30,
      outcome: 'CONFIRMED' as const,
    };
  }

  /**
   * Parsira razgovor iz AI odgovora
   */
  private parseConversation(aiResponse: string): TranscriptItem[] {
    // Pokušaj da razdvoji AI i customer poruke
    const lines = aiResponse.split('\n').filter((line) => line.trim());
    const transcript: TranscriptItem[] = [];
    let timestamp = 0;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (
        lowerLine.includes('ai:') ||
        lowerLine.includes('zastupnica:') ||
        lowerLine.includes('prodajac:')
      ) {
        const text = line.replace(/^(ai:|zastupnica:|prodajac:)/i, '').trim();
        if (text) {
          transcript.push({
            role: 'ai',
            text,
            timestamp,
          });
          timestamp += 3;
        }
      } else if (
        lowerLine.includes('customer:') ||
        lowerLine.includes('kupac:') ||
        lowerLine.includes('customer said:')
      ) {
        const text = line.replace(/^(customer:|kupac:|customer said:)/i, '').trim();
        if (text) {
          transcript.push({
            role: 'customer',
            text,
            timestamp,
          });
          timestamp += 2;
        }
      }
    }

    // Ako ne uspede da parsira, vrati mock
    if (transcript.length === 0) {
      return [
        {
          role: 'ai',
          text: 'Zdravo, potvrđujem vašu narudžbinu.',
          timestamp: 0,
        },
        {
          role: 'customer',
          text: 'Hvala!',
          timestamp: 3,
        },
      ];
    }

    return transcript;
  }

  /**
   * Generisanje summary-ja razgovora
   */
  private async generateSummary(
    transcript: TranscriptItem[],
    orderData: any,
  ): Promise<string> {
    try {
      const conversationText = transcript.map((t) => `${t.role}: ${t.text}`).join('\n');

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Kreiraj kratak profesionalan summary od 1-2 rečenice razgovora prodajnog poziva. Budi na srpskom jeziku.',
            },
            {
              role: 'user',
              content: `Evo razgovora:\n\n${conversationText}\n\nNarudžbina: ${orderData.orderNumber}, Kupac: ${orderData.customerName}, Iznos: ${orderData.total} ${orderData.currency}`,
            },
          ],
          max_tokens: 200,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return (
        response.data.choices[0]?.message?.content ||
        `Kupac ${orderData.customerName} je potvrdi narudžbinu ${orderData.orderNumber}.`
      );
    } catch (error) {
      this.logger.warn(`Error generating summary: ${error.message}`);
      return `Kupac ${orderData.customerName} je potvrdi narudžbinu ${orderData.orderNumber} u vrednosti ${orderData.total} ${orderData.currency}.`;
    }
  }

  /**
   * Determiniši outcome na osnovu transcript-a
   */
  private determineOutcome(
    transcript: TranscriptItem[],
  ): 'CONFIRMED' | 'CANCELLED' | 'UPSELL' | 'CALLBACK' | 'NO_ANSWER' | 'FAILED' {
    if (transcript.length === 0) {
      return 'NO_ANSWER';
    }

    const text = transcript.map((t) => t.text.toLowerCase()).join(' ');

    if (
      text.includes('ne') ||
      text.includes('odbija') ||
      text.includes('ne trebam') ||
      text.includes('otkaži')
    ) {
      return 'CANCELLED';
    }

    if (
      text.includes('potvrdi') ||
      text.includes('da') ||
      text.includes('hvala') ||
      text.includes('ok')
    ) {
      return 'CONFIRMED';
    }

    return 'CONFIRMED'; // Default
  }
}
