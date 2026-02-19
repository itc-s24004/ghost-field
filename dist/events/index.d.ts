import { type GF_Card_ID, type GF_EX_GameData, type GF_Initial_Game, type GF_PlayerStatus } from "ghost-field-core";
import type { GhostField_CurrentField, socketData } from "../server/server.js";
import type { GF_CardUseOptions } from "ghost-field-core/dist/util/card/index.js";
type toEventMap<DataMap extends Record<string, any>> = {
    [key in keyof DataMap]?: (data: DataMap[key]) => void;
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
    "client:useCard": {
        cards: GF_Card_ID[];
        targetIndex: number;
        useOptions?: GF_CardUseOptions | undefined;
    };
};
export type GhostField_Message = {
    from: string;
    message: string;
};
export type GhostField_Server_EventMap<EX_Card extends GF_EX_GameData, EX_Meta extends GF_EX_GameData> = toEventMap<GhostField_Server_EventDataMap<EX_Card, EX_Meta>>;
export type GhostField_Server_EventDataMap<EX_Card extends GF_EX_GameData, EX_Meta extends GF_EX_GameData> = {
    "server:init": {
        game: GF_Initial_Game<EX_Card, EX_Meta>;
        currentField: GhostField_CurrentField<EX_Card> | undefined;
        currentPlayerIndex: number;
        sockets: GF_PlayerStatus[];
        isPlaying: boolean;
    };
    "server:playerListChange": {
        sockets: socketData[];
    };
    "server:setName": {
        socketId: string;
        newName: string;
    };
    "server:message": GhostField_Message;
    "server:start": {
        sockets: socketData[];
        gamePlayers: GF_PlayerStatus[];
    };
    "server:fieldChange": {
        /**現在の攻撃アクション */
        action: GhostField_CurrentField<EX_Card> | undefined;
        /**現在入力中のプレイヤーのインデックス */
        currentPlayer: number;
    };
    "server:playerStatusChange": {
        playerIndex: number;
        status: GF_PlayerStatus;
    };
    "server:drawCard": {
        card: GF_Card_ID;
        removedCard: GF_Card_ID | undefined;
    };
    "server:updateCard": {
        handCards: Record<GF_Card_ID, number>;
        magicCards: Record<GF_Card_ID, number>;
    };
    "server:useCard": {
        playerIndex: number;
        cards: GF_Card_ID[];
        stackCard: Record<GF_Card_ID, number>;
    };
    "server:damage": {
        playerIndex: number;
        damage: number;
    };
    "server:end": {
        winnerIndex: number;
    };
};
export {};
