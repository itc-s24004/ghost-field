import { Server as IO_Server } from "socket.io";
import { GhostField_Server, type socketData } from "../server/server.js";
import { GameInitData } from "ghost-field-core";
import type { GhostField_Client_EventMap, GhostField_Server_EventMap } from "../events/index.js";


const io = new IO_Server<GhostField_Client_EventMap, GhostField_Server_EventMap<{}, {}>, GhostField_Client_EventMap, socketData>(
    {
        transports: ["websocket"],
    }
);


const test = io.of("/test");

const server = new GhostField_Server(test, GameInitData);


io.listen(5000,  {});

console.log("GhostField server is running on port 5000");