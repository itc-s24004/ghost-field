import { io, type Socket } from "socket.io-client";
import type { GhostField_Client_EventMap, GhostField_Server_EventMap } from "../events/index.js";

export class GhostField_Client {
    #eventMap: GhostField_Server_EventMap<{}, {}>;
    
    
    #socket: Socket<GhostField_Server_EventMap<{}, {}>, GhostField_Client_EventMap> | null = null;
    
    constructor(event: GhostField_Server_EventMap<{}, {}>) {
        this.#eventMap = event;
    }

    async connect(url: URL) {
        if (this.#socket) return;

        this.#socket = io(url.toString(),
            {
                autoConnect: true,
                reconnection: true,
                transports: ["websocket"],
            }
        ).once("connect", () => {
            console.log(`Connected to server: ${url.toString()}`);
        })

        this.#initSocketListeners();

        // this.#socket.connect();
    }

    disconnect() {
        this.#socket?.disconnect();
        this.#socket?.removeAllListeners();
        this.#socket = null;
    }



    #initSocketListeners() {
        if (!this.#socket) return;
        
        this.#socket
            .on("server:playerList", (data) => this.#eventMap["server:playerList"]?.(data))
            .on("server:init", (data) => this.#eventMap["server:init"]?.(data))
            .on("server:join", (data) => this.#eventMap["server:join"]?.(data))
            .on("server:leave", (data) => this.#eventMap["server:leave"]?.(data))
            .on("server:message", (data) => this.#eventMap["server:message"]?.(data))
            .on("server:start", (data) => this.#eventMap["server:start"]?.(data))
            .on("server:currentState", (data) => this.#eventMap["server:currentState"]?.(data))
            
    }


    changeName(name: string) {
        this.#socket?.emit("client:setName", { newName: name });
    }
    
    sendMessage(message: string) {
        this.#socket?.emit("client:message", { message });
    }
}
