export declare class AudioConverterService {
    private readonly logger;
    convertToPcm24k(inputBuffer: Buffer): Promise<Buffer>;
    convertToUlaw(inputBuffer: Buffer): Promise<Buffer>;
}
