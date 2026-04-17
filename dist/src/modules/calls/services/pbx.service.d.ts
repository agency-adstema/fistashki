export interface IPbxService {
    initiateCall(phoneNumber: string, callJobId: string): Promise<string>;
    hangupCall(callId: string): Promise<void>;
    sendAudio(callId: string, audioData: Buffer): Promise<void>;
    getCallStatus(callId: string): Promise<string>;
}
export declare class PbxService implements IPbxService {
    private readonly logger;
    private yeastarHost;
    private yeastarPort;
    private yeastarUsername;
    private yeastarPassword;
    initiateCall(phoneNumber: string, callJobId: string): Promise<string>;
    hangupCall(callId: string): Promise<void>;
    sendAudio(callId: string, audioData: Buffer): Promise<void>;
    getCallStatus(callId: string): Promise<string>;
}
