import type { GhostField_CardID, GhostField_PlayerID, GhostField_SystemTick } from "ghost-field-core"

export type GhostField_SocketEventMap = {
    "server:tick": (data: GhostField_SystemTick) => void;
    "client:tick": (data: GhostField_ClientTick) => void;
    "global:message": (data: string) => void;
}

export type GhostField_ClientTick = {
    type: "use_card";
    card: GhostField_CardID[];
    options?: {
        hp?: number;
        mp?: number;
        gold?: number;
    };
    target: GhostField_PlayerID;
    
};