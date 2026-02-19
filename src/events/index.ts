import { GF_Game, type GF_Card_ID, type GF_EX_GameData, type GF_Initial_Game, type GF_SystemAction, type GF_GameEventMap, type GF_SystemEventDataMap, type GF_PlayerStatus } from "ghost-field-core";
import type { GhostField_CurrentField, socketData } from "../server/server.js";
import type { GF_CardUseOptions } from "ghost-field-core/dist/util/card/index.js";

type toEventMap<DataMap extends Record<string, any>> = {
    [key in keyof DataMap]?: (data: DataMap[key]) => void;
}



export type GhostField_Client_EventMap = toEventMap<GhostField_Client_EventDataMap>;

export type GhostField_Client_EventDataMap = {
    "client:setName": {
        newName: string;
    }
    "client:message": {
        message: string;
    }
    "client:start": {}
    "client:useCard": {
        cards: GF_Card_ID[];
        targetIndex: number;
        useOptions?: GF_CardUseOptions | undefined;
    }
}



export type GhostField_Message = {
    from: string;
    message: string;
}



export type GhostField_Server_EventMap<EX_Card extends GF_EX_GameData, EX_Meta extends GF_EX_GameData> = toEventMap<GhostField_Server_EventDataMap<EX_Card, EX_Meta>>;

export type GhostField_Server_EventDataMap<EX_Card extends GF_EX_GameData, EX_Meta extends GF_EX_GameData> = {
    // 接続時に発生するイベント
    "server:init": {
        game: GF_Initial_Game<EX_Card, EX_Meta>;
        currentField: GhostField_CurrentField<EX_Card> | undefined;
        currentPlayerIndex: number;
        sockets: GF_PlayerStatus[];
        isPlaying: boolean;
    };
    // プレイヤーのリストが変更されたときに発生するイベント
    "server:playerListChange": {
        sockets: socketData[];
    }
    // プレイヤーの名前が変更されたときに発生するイベント
    "server:setName": {
        socketId: string;
        newName: string;
    };
    // チャットメッセージが送信されたときに発生するイベント
    "server:message": GhostField_Message;
    // ゲームが開始したときに発生するイベント
    "server:start": {
        sockets: socketData[];
        gamePlayers: GF_PlayerStatus[];
    };
    // フィールドの状態が変化したときに発生するイベント
    "server:fieldChange": {
        /**現在の攻撃アクション */
        action: GhostField_CurrentField<EX_Card> | undefined;
        /**現在入力中のプレイヤーのインデックス */
        currentPlayer: number;
    };
    /// プレイヤーの状態が変化したときに発生するイベント
    "server:playerStatusChange": {
        playerIndex: number;
        status: GF_PlayerStatus;
    };
    // プレイヤーがカードを引いたときに発生するイベント
    "server:drawCard": {
        card: GF_Card_ID;
        removedCard: GF_Card_ID | undefined;
    };
    "server:updateCard": {
        handCards: Record<GF_Card_ID, number>;
        magicCards: Record<GF_Card_ID, number>;
    };
    // プレイヤーがカードを使用したときに発生するイベント
    "server:useCard": {
        playerIndex: number;
        cards: GF_Card_ID[];
        stackCard: Record<GF_Card_ID, number>;
    };
    // プレイヤーがダメージを受けたときに発生するイベント
    "server:damage": {
        playerIndex: number;
        damage: number;
    };
    // ゲームが終了したときに発生するイベント
    "server:end": {
        winnerIndex: number;
    }

}