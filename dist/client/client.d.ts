import type { GhostField_Server_EventMap } from "../events/index.js";
export declare class GhostField_Client {
    #private;
    constructor(event: GhostField_Server_EventMap<{}, {}>);
    connect(url: URL): Promise<void>;
    disconnect(): void;
    sendMessage(message: string): void;
}
