import { io } from "socket.io-client";
export class GhostField_Client {
    #eventMap;
    #socket = null;
    constructor(event) {
        this.#eventMap = event;
    }
    async connect(url) {
        if (this.#socket)
            return;
        this.#socket = io(url.toString(), {
            autoConnect: true,
            reconnection: true,
            transports: ["websocket"],
        }).once("connect", () => {
            console.log(`Connected to server: ${url.toString()}`);
        });
        this.#initSocketListeners();
        // this.#socket.connect();
    }
    disconnect() {
        this.#socket?.disconnect();
        this.#socket?.removeAllListeners();
        this.#socket = null;
    }
    #initSocketListeners() {
        if (!this.#socket)
            return;
        this.#socket
            .on("server:init", (data) => this.#eventMap["server:init"]?.(data))
            .on("server:join", (data) => this.#eventMap["server:join"]?.(data))
            .on("server:leave", (data) => this.#eventMap["server:leave"]?.(data))
            .on("server:message", (data) => this.#eventMap["server:message"]?.(data));
    }
    sendMessage(message) {
        this.#socket?.emit("client:message", { message });
    }
}
