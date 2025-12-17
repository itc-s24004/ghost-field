import type * as express from "express";
import type { Server } from "socket.io";
import { type GhostField_Custom, type GhostField_InitialData } from "ghost-field-core";
import type { GhostField_SocketEventMap } from "./event.js";
export type ServerInfo = {
    version: number;
    core_version: number;
    supported_client: SupportedClient[];
};
export type SupportedClient = {
    id: string;
    web_url?: string;
    repository_url?: string;
    min_version: number;
    max_version: number;
};
export declare class GhostFieldServer<card extends GhostField_Custom = {}, ghost extends GhostField_Custom = {}, game extends GhostField_Custom = {}> {
    #private;
    static listen(router: express.Router, io: Server<GhostField_SocketEventMap>): void;
    static addSupportedClient(...client: SupportedClient[]): void;
    static get info(): ServerInfo;
    static get roomList(): string[];
    static hasRoom(id: string): boolean;
    static getRoom(id: string): GhostFieldServer<{}, {}, {}> | null | undefined;
    get roomId(): string;
    get masterKey(): `${string}-${string}-${string}-${string}-${string}`;
    constructor(data: GhostField_InitialData<card, ghost, game>);
    close(): void;
    toJSON(): GhostField_InitialData;
}
//# sourceMappingURL=main.d.ts.map