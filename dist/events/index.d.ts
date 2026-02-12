import type { GF_EX_GameData, GF_Initial_Game } from "ghost-field-core";
import type { socketData } from "../server/server.js";
type toEventMap<DataMap extends Record<string, any>> = {
    [key in keyof DataMap]?: (data: DataMap[key]) => void;
};
export type GhostField_EventMap = toEventMap<GhostField_EventDataMap>;
export type GhostField_EventDataMap = {
    "game:init": {
        players: Record<string, unknown>;
    };
    "bind": {
        player: number;
    };
    "message": {
        message: string;
    };
};
export type GhostField_Client_EventMap = toEventMap<GhostField_Client_EventDataMap>;
export type GhostField_Client_EventDataMap = {
    "client:setName": {
        newName: string;
    };
    "client:message": {
        message: string;
    };
    "client:start": {};
};
export type GhostField_Server_EventMap<EX_Card extends GF_EX_GameData, EX_Meta extends GF_EX_GameData> = toEventMap<GhostField_Server_EventDataMap<EX_Card, EX_Meta>>;
export type GhostField_Server_EventDataMap<EX_Card extends GF_EX_GameData, EX_Meta extends GF_EX_GameData> = {
    "server:init": {
        game: GF_Initial_Game<EX_Card, EX_Meta>;
        players: Record<string, socketData>;
    };
    "server:join": {
        socketId: string;
    };
    "server:leave": {
        socketId: string;
    };
    "server:setName": {
        socketId: string;
        newName: string;
    };
    "server:message": {
        from: string;
        message: string;
    };
    "server:owner": {};
    "server:start": {};
};
export {};
