import { GF_Game, GF_Player, type GF_Card_ID, type GF_EX_GameData, type GF_Initial_Game, type GF_PlayerStatus } from "ghost-field-core";
import type { Namespace } from "socket.io";
import type { GhostField_Client_EventMap, GhostField_Server_EventMap } from "../events/index.js";
type Options = {
    /**プレイヤーが0人になったら自動的にサーバーを閉じる */
    autoClose?: boolean;
    /**ルーム初期化のタイムアウト時間(ミリ秒) */
    timeout?: number | undefined;
    /**サーバーが閉じられたときに呼ばれるコールバック */
    onClose?: () => void;
};
export type socketData = {
    name: string;
    bind: number;
    isOwner: boolean;
    socketId: string;
};
export declare class GhostField_Server<EX_Card extends GF_EX_GameData = GF_EX_GameData, EX_Meta extends GF_EX_GameData = GF_EX_GameData> {
    #private;
    getPlayerSocket(player: GF_Player<EX_Card> | number): import("socket.io").Socket<{
        "client:setName"?: (data: {
            newName: string;
        }) => void;
        "client:message"?: (data: {
            message: string;
        }) => void;
        "client:start"?: (data: {}) => void;
        "client:useCard"?: (data: {
            cards: GF_Card_ID[];
            targetIndex: number;
            useOptions?: import("ghost-field-core").GF_CardUseOptions | undefined;
        }) => void;
    }, {
        "server:init"?: (data: {
            game: GF_Initial_Game<EX_Card, EX_Meta>;
            currentField: GhostField_CurrentField<EX_Card> | undefined;
            currentPlayerIndex: number;
            sockets: GF_PlayerStatus[];
            isPlaying: boolean;
        }) => void;
        "server:playerListChange"?: (data: {
            sockets: socketData[];
        }) => void;
        "server:setName"?: (data: {
            socketId: string;
            newName: string;
        }) => void;
        "server:message"?: (data: import("../events/index.js").GhostField_Message) => void;
        "server:start"?: (data: {
            sockets: socketData[];
            gamePlayers: GF_PlayerStatus[];
        }) => void;
        "server:fieldChange"?: (data: {
            action: GhostField_CurrentField<EX_Card> | undefined;
            currentPlayer: number;
        }) => void;
        "server:playerStatusChange"?: (data: {
            playerIndex: number;
            status: GF_PlayerStatus;
        }) => void;
        "server:drawCard"?: (data: {
            card: GF_Card_ID;
            removedCard: GF_Card_ID | undefined;
        }) => void;
        "server:updateCard"?: (data: {
            handCards: Record<GF_Card_ID, number>;
            magicCards: Record<GF_Card_ID, number>;
        }) => void;
        "server:useCard"?: (data: {
            playerIndex: number;
            cards: GF_Card_ID[];
            stackCard: Record<GF_Card_ID, number>;
        }) => void;
        "server:damage"?: (data: {
            playerIndex: number;
            damage: number;
        }) => void;
        "server:end"?: (data: {
            winnerIndex: number;
        }) => void;
    }, {
        "client:setName"?: (data: {
            newName: string;
        }) => void;
        "client:message"?: (data: {
            message: string;
        }) => void;
        "client:start"?: (data: {}) => void;
        "client:useCard"?: (data: {
            cards: GF_Card_ID[];
            targetIndex: number;
            useOptions?: import("ghost-field-core").GF_CardUseOptions | undefined;
        }) => void;
    }, socketData> | undefined;
    constructor(io: Namespace<GhostField_Client_EventMap, GhostField_Server_EventMap<EX_Card, EX_Meta>, GhostField_Client_EventMap, socketData>, // | Server<GhostField_Client_EventMap, GhostField_Server_EventMap<EX_Card, EX_Meta>, GhostField_Client_EventMap, socketData>,
    data: GF_Initial_Game<EX_Card, EX_Meta>, options?: Options);
    get currentField(): GhostField_CurrentField<EX_Card> | undefined;
    get game(): GF_Game<EX_Card, EX_Meta, string>;
    get socketCount(): number;
    close(): void;
}
export type ServerInfo = {};
export type ServerDetails = {};
export type GhostField_DeckMap = {
    [cardID: GF_Card_ID]: number;
};
export type GhostField_CurrentField<EX_Card extends GF_EX_GameData> = {
    action: GF_Card_ID[] | undefined;
    source: number;
};
export {};
