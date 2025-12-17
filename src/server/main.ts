import type * as express from "express";
import type { Server } from "socket.io";
import { GhostField, type GhostField_Custom, type GhostField_InitialData } from "ghost-field-core";
import { GhostFieldClient } from "../client/index.js";

import type { GhostField_SocketEventMap } from "./event.js";

export type ServerInfo = {
    version: number;
    core_version: number;

    supported_client: SupportedClient[];
}

export type SupportedClient = {
    id: string;

    web_url?: string;
    repository_url?: string;

    min_version: number;
    max_version: number;
}
    

export class GhostFieldServer<card extends GhostField_Custom = {}, ghost extends GhostField_Custom = {}, game extends GhostField_Custom = {}> {
    static listen(router: express.Router, io: Server<GhostField_SocketEventMap>) {
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

            if (!room) return res.status(404).json({});;
            res.json(room.toJSON());

        });
        
        io.on("connection", (socket) => {
            const url = socket.request.url;
            if (!url) return socket.disconnect(true);

            // const uri = new URL(url);
            // uri.pathname


            socket.on("global:message", (data) => {
                io.emit("global:message", data);
            });
        })
    }




    static #info: ServerInfo = {
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
    }

    static addSupportedClient(...client: SupportedClient[]) {
        this.#info.supported_client.push(...structuredClone(client));
    }

    static get info() {
        return structuredClone(this.#info);
    }



    static #rooms: {[id: string]: GhostFieldServer} = {};

    static get roomList() {
        return Object.keys(this.#rooms);
    }

    static hasRoom(id: string) {
        return id in this.#rooms;
    }

    static getRoom(id: string) {
        if (!this.hasRoom(id)) return null;
        return this.#rooms[id];
    }













    #roomId: string;
    get roomId() {
        return this.#roomId;
    }

    #masterKey = crypto.randomUUID();
    get masterKey() {
        return this.#masterKey;
    }

    #ghostField: GhostField<card, ghost, game>;

    constructor(data: GhostField_InitialData<card, ghost, game>) {
        this.#roomId = crypto.randomUUID();
        GhostFieldServer.#rooms[this.#roomId] = this;
        this.#ghostField = new GhostField<card, ghost, game>(data);
    }

    close() {
        if (GhostFieldServer.hasRoom(this.#roomId)) delete GhostFieldServer.#rooms[this.#roomId];
    }


    toJSON(): GhostField_InitialData {
        return this.#ghostField.toJSON();
    }
}