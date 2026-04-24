export declare class OpenAIService {
    private readonly logger;
    private readonly apiKey;
    private readonly model;
    private readonly voice;
    private readonly language;
    private readonly systemPrompt;
    constructor();
    simulateCall(orderData: {
        orderNumber: string;
        customerName: string;
        total: number;
        currency: string;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
    }): Promise<{
        transcript: any;
        summary: string;
        duration: number;
        outcome: 'CONFIRMED' | 'CANCELLED' | 'UPSELL' | 'CALLBACK' | 'NO_ANSWER' | 'FAILED';
    }>;
    private mockCall;
    private parseConversation;
    private generateSummary;
    private determineOutcome;
}
