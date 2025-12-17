import type { GhostField_SocketEventMap, ServerInfo } from "../server/index.js";
import type { GhostField_ClientEventMap } from "./event.js";
import { EventEmitter } from "./emitter.js";
export declare class GhostFieldClient {
    #private;
    static get id(): string;
    static get version(): number;
    static get repository_url(): string;
    static getServerInfo(url: URL): Promise<ServerInfo | null>;
    constructor();
    connect(url: URL): Promise<void>;
    disconnect(): void;
    on<K extends keyof (GhostField_SocketEventMap & GhostField_ClientEventMap)>(event: K, callback: (GhostField_SocketEventMap & GhostField_ClientEventMap)[K]): EventEmitter<GhostField_SocketEventMap & GhostField_ClientEventMap>;
    off<K extends keyof (GhostField_SocketEventMap & GhostField_ClientEventMap)>(event: K, callback: (GhostField_SocketEventMap & GhostField_ClientEventMap)[K]): EventEmitter<GhostField_SocketEventMap & GhostField_ClientEventMap>;
    sendGlobalMessage(message: string): void;
}
//# sourceMappingURL=main.d.ts.map