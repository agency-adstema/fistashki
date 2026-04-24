"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OpenAIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let OpenAIService = OpenAIService_1 = class OpenAIService {
    logger = new common_1.Logger(OpenAIService_1.name);
    apiKey = process.env.OPENAI_API_KEY;
    model = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-1.5';
    voice = process.env.OPENAI_VOICE || 'nova';
    language = process.env.OPENAI_LANGUAGE || 'en';
    systemPrompt = process.env.OPENAI_SYSTEM_PROMPT || 'You are a helpful assistant.';
    constructor() {
        if (!this.apiKey) {
            this.logger.warn('OPENAI_API_KEY not set. Using mock responses.');
        }
    }
    async simulateCall(orderData) {
        try {
            const startTime = Date.now();
            this.logger.log(`Starting AI call simulation for order ${orderData.orderNumber}`);
            if (!this.apiKey) {
                return this.mockCall(orderData);
            }
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
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const aiResponse = response.data.choices[0]?.message?.content || '';
            const transcript = this.parseConversation(aiResponse);
            const summary = await this.generateSummary(transcript, orderData);
            const duration = Math.floor((Date.now() - startTime) / 1000) || 30;
            const outcome = this.determineOutcome(transcript);
            this.logger.log(`Call completed for order ${orderData.orderNumber}: ${outcome} (${duration}s)`);
            return {
                transcript,
                summary,
                duration,
                outcome,
            };
        }
        catch (error) {
            this.logger.error(`Error in AI call simulation: ${error.message}`);
            return this.mockCall(orderData);
        }
    }
    mockCall(orderData) {
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
            outcome: 'CONFIRMED',
        };
    }
    parseConversation(aiResponse) {
        const lines = aiResponse.split('\n').filter((line) => line.trim());
        const transcript = [];
        let timestamp = 0;
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('ai:') ||
                lowerLine.includes('zastupnica:') ||
                lowerLine.includes('prodajac:')) {
                const text = line.replace(/^(ai:|zastupnica:|prodajac:)/i, '').trim();
                if (text) {
                    transcript.push({
                        role: 'ai',
                        text,
                        timestamp,
                    });
                    timestamp += 3;
                }
            }
            else if (lowerLine.includes('customer:') ||
                lowerLine.includes('kupac:') ||
                lowerLine.includes('customer said:')) {
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
    async generateSummary(transcript, orderData) {
        try {
            const conversationText = transcript.map((t) => `${t.role}: ${t.text}`).join('\n');
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Kreiraj kratak profesionalan summary od 1-2 rečenice razgovora prodajnog poziva. Budi na srpskom jeziku.',
                    },
                    {
                        role: 'user',
                        content: `Evo razgovora:\n\n${conversationText}\n\nNarudžbina: ${orderData.orderNumber}, Kupac: ${orderData.customerName}, Iznos: ${orderData.total} ${orderData.currency}`,
                    },
                ],
                max_tokens: 200,
                temperature: 0.3,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return (response.data.choices[0]?.message?.content ||
                `Kupac ${orderData.customerName} je potvrdi narudžbinu ${orderData.orderNumber}.`);
        }
        catch (error) {
            this.logger.warn(`Error generating summary: ${error.message}`);
            return `Kupac ${orderData.customerName} je potvrdi narudžbinu ${orderData.orderNumber} u vrednosti ${orderData.total} ${orderData.currency}.`;
        }
    }
    determineOutcome(transcript) {
        if (transcript.length === 0) {
            return 'NO_ANSWER';
        }
        const text = transcript.map((t) => t.text.toLowerCase()).join(' ');
        if (text.includes('ne') ||
            text.includes('odbija') ||
            text.includes('ne trebam') ||
            text.includes('otkaži')) {
            return 'CANCELLED';
        }
        if (text.includes('potvrdi') ||
            text.includes('da') ||
            text.includes('hvala') ||
            text.includes('ok')) {
            return 'CONFIRMED';
        }
        return 'CONFIRMED';
    }
};
exports.OpenAIService = OpenAIService;
exports.OpenAIService = OpenAIService = OpenAIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OpenAIService);
//# sourceMappingURL=openai.service.js.map