import { GhostField } from "ghost-field-core";
import { GhostFieldClient } from "../client/index.js";
export class GhostFieldServer {
    static listen(router, io) {
        router.options("/ghost-field/info", (req, res) => {
            console.log("OPTIONS /ghost-field/info");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            res.json(GhostFieldServer.info);
        }).get("/ghost-field/room", (req, res) => {
            res.json(this.roomList);
        }).get("/ghost-field/room/:id", (req, res) => {
            const id = req.params.id;
            const room = this.getRoom(id);
            if (!room)
                return res.status(404).json({});
            ;
            res.json(room.toJSON());
        });
        io.on("connection", (socket) => {
            const url = socket.request.url;
            if (!url)
                return socket.disconnect(true);
            // const uri = new URL(url);
            // uri.pathname
            socket.on("global:message", (data) => {
                io.emit("global:message", data);
            });
        });
    }
    static #info = {
        version: 0,
        core_version: 0,
        supported_client: [
            {
                id: GhostFieldClient.id,
                repository_url: "",
                max_version: GhostFieldClient.version,
                min_version: 0
            }
        ]
    };
    static addSupportedClient(...client) {
        this.#info.supported_client.push(...structuredClone(client));
    }
    static get info() {
        return structuredClone(this.#info);
    }
    static #rooms = {};
    static get roomList() {
        return Object.keys(this.#rooms);
    }
    static hasRoom(id) {
        return id in this.#rooms;
    }
    static getRoom(id) {
        if (!this.hasRoom(id))
            return null;
        return this.#rooms[id];
    }
    #roomId;
    get roomId() {
        return this.#roomId;
    }
    #masterKey = crypto.randomUUID();
    get masterKey() {
        return this.#masterKey;
    }
    #ghostField;
    constructor(data) {
        this.#roomId = crypto.randomUUID();
        GhostFieldServer.#rooms[this.#roomId] = this;
        this.#ghostField = new GhostField(data);
    }
    close() {
        if (GhostFieldServer.hasRoom(this.#roomId))
            delete GhostFieldServer.#rooms[this.#roomId];
    }
    toJSON() {
        return this.#ghostField.toJSON();
    }
}
//# sourceMappingURL=main.js.map