import { GF_Game, type GF_Card_ID, type GF_EX_GameData, type GF_Initial_Game, type GF_SystemAction } from "ghost-field-core";
import type { socketData } from "../server/server.js";

type toEventMap<DataMap extends Record<string, any>> = {
    [key in keyof DataMap]?: (data: DataMap[key]) => void;
}


export type GhostField_EventMap = toEventMap<GhostField_EventDataMap>;

export type GhostField_EventDataMap = {
    "game:init": {
        players: Record<string, unknown>;
    }
    "bind": {
        player: number;
    }
    "message": {
        message: string;
    }
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
}



export type GhostField_Server_EventMap<EX_Card extends GF_EX_GameData, EX_Meta extends GF_EX_GameData> = toEventMap<GhostField_Server_EventDataMap<EX_Card, EX_Meta>>;

export type GhostField_Server_EventDataMap<EX_Card extends GF_EX_GameData, EX_Meta extends GF_EX_GameData> = {
    "server:playerList": {
        players: Record<string, socketData>;
    }
    "server:init": {
        game: GF_Initial_Game<EX_Card, EX_Meta>;
        currentAction: GF_SystemAction<EX_Card> | undefined;
        currentPlayerIndex: number;
        playerCount: number;
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
    "server:start": {
        players: Record<string, socketData>;
    };
    "server:currentState": {
        /**現在の攻撃アクション */
        action: GF_SystemAction<EX_Card> | undefined;
        /**現在入力中のプレイヤーのインデックス */
        currentPlayer: number;
    };
    "server:useCard": {
        playerIndex: number;
        type: "attack" | "defense";
        cards: GF_Card_ID[];
    }

    "server:end": {
        winnerIndex: number;
    }

}