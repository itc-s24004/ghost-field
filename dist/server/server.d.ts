import { GF_Game, type GF_EX_GameData, type GF_Initial_Game } from "ghost-field-core";
import type { Namespace } from "socket.io";
import type { GhostField_Client_EventMap, GhostField_Server_EventMap } from "../events/index.js";
type Options = {
    /**プレイヤーが0人になったら自動的にサーバーを閉じる */
    autoClose?: boolean;
    /**ルーム初期化のタイムアウト時間(ミリ秒) */
    timeout?: number;
    /**サーバーが閉じられたときに呼ばれるコールバック */
    onClose?: () => void;
};
export type socketData = {
    name: string;
    bind: number;
    isOwner: boolean;
};
export declare class GhostField_Server<EX_Card extends GF_EX_GameData = GF_EX_GameData, EX_Meta extends GF_EX_GameData = GF_EX_GameData> {
    #private;
    constructor(io: Namespace<GhostField_Client_EventMap, GhostField_Server_EventMap<EX_Card, EX_Meta>, GhostField_Client_EventMap, socketData>, // | Server<GhostField_Client_EventMap, GhostField_Server_EventMap<EX_Card, EX_Meta>, GhostField_Client_EventMap, socketData>,
    data: GF_Initial_Game<EX_Card, EX_Meta>, options?: Options);
    get game(): GF_Game<EX_Card, EX_Meta>;
    get socketCount(): number;
    close(): void;
}
export type ServerInfo = {};
export type ServerDetails = {};
export {};
