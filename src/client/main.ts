import io, { type Socket } from "socket.io-client"
import type { GhostField_SocketEventMap, ServerInfo } from "../server/index.js";

import type { GhostField_ClientEventMap } from "./event.js";
import { EventEmitter } from "./emitter.js";

export class GhostFieldClient {
    static get id() {
        return "f6ec02df-6937-41cb-a8f9-9487c07ee58d"
    }
    static get version() {
        return 0;
    }
    static get repository_url() {
        return "https://github.com/itc-s24004/ghost-field.git";
    }

    static async getServerInfo(url: URL) {
        const infoUrl = new URL("/ghost-field/info", url);
        const res = await fetch(infoUrl.toString(), {
            method: "OPTIONS",

        }).catch(() => null);

        if (!res || !res.ok) return null;

        const info = await res.json().catch(() => null);
        if (!info) return null;

        return info as ServerInfo;
    }


    constructor() {}

    #emitter = new EventEmitter<GhostField_SocketEventMap & GhostField_ClientEventMap>();

    #socket: Socket<GhostField_SocketEventMap>  | null = null;

    async connect(url: URL) {
        if (this.#socket) return;

        this.#socket = io(url.toString(), {
            autoConnect: true,
            reconnection: false,
        });
        this.#initSocketListeners();
    }

    disconnect() {
        this.#socket?.disconnect();
    }


    /**
     * socketのイベントリスナーを初期化する
     * @returns 
     */
    #initSocketListeners() {
        if (!this.#socket) return;
        this.#socket.on("connect", () => {
            this.#emitter.emit("connect");

        }).on("connect_error", () => {
            this.#socket?.removeAllListeners();
            this.#socket = null;
            this.#emitter.emit("connect_error");

        }).on("disconnect", () => {
            this.#socket?.removeAllListeners();
            this.#socket = null;
            this.#emitter.emit("disconnect");

        }).on("global:message", (msg) => {
            this.#emitter.emit("global:message", msg);

        });
    }

    on<K extends keyof (GhostField_SocketEventMap & GhostField_ClientEventMap)>(event: K, callback: (GhostField_SocketEventMap & GhostField_ClientEventMap)[K]) {
        return this.#emitter.on(event, callback);
    }

    off<K extends keyof (GhostField_SocketEventMap & GhostField_ClientEventMap)>(event: K, callback: (GhostField_SocketEventMap & GhostField_ClientEventMap)[K]) {
        return this.#emitter.off(event, callback);
    }


    sendGlobalMessage(message: string) {
        if (this.#socket) this.#socket.emit("global:message", message);
    }

}