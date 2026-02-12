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
}

export type socketData = {
    name: string;
    bind: number;
    isOwner: boolean;
}


export class GhostField_Server<EX_Card extends GF_EX_GameData = GF_EX_GameData, EX_Meta extends GF_EX_GameData = GF_EX_GameData> {
    #io
    #sockets
    
    #options: Options;


    #game

    
    constructor(
        io: Namespace<GhostField_Client_EventMap, GhostField_Server_EventMap<EX_Card, EX_Meta>, GhostField_Client_EventMap, socketData>,// | Server<GhostField_Client_EventMap, GhostField_Server_EventMap<EX_Card, EX_Meta>, GhostField_Client_EventMap, socketData>,
        data: GF_Initial_Game<EX_Card, EX_Meta>,
        options: Options = {}
    ) {
        let ownerSocketId: string | undefined;
        
        const { sockets } = io;
        this.#io = io;
        this.#sockets = sockets;
        this.#options = options;

        const { timeout = 1000*60*3 } = options;
        
        const initCloseTimeout = timeout === Infinity ? undefined : setTimeout(() => {
            this.close();
        }, timeout);


        const game = new GF_Game<EX_Card, EX_Meta>(data,  {
            secureMode: true,
            events: {
                onDamage(ev) {
                    
                },
                onGameEnd(ev) {
                    const { winner } = ev;
                    io.emit("server:currentState", {
                        "action": undefined,
                        "currentPlayer": -1
                    });
                    sockets.forEach((socket) => {
                        socket.data.bind = -1;
                    });
                    io.emit("server:playerList", { players: genPlayerList() });
                    io.emit("server:end", {
                        winnerIndex: winner !== undefined ?  game.getPlayerIndex(winner) : -1
                    });
                }
            }
        });
        this.#game = game;

        

        function genPlayerList() {
            return (sockets.values().reduce((all, socket) => {
                all[socket.id] = socket.data;
                return all;
            }, {} as Record<string, socketData>));
        }
        
        io.on("connection", (socket) => {
            const socketData = socket.data;
            socketData.bind = -1;
            socketData.name = socket.id;
            socketData.isOwner = false;

            //接続があったらタイムアウト解除
            if (initCloseTimeout) clearTimeout(initCloseTimeout);

            //最初の接続者をオーナーに設定
            if (!ownerSocketId) ownerSocketId = socket.id;

            //最初にプレイヤーリストを送信
            io.emit("server:playerList", { players: genPlayerList() });

            
            //初期化データを送信
            socket.emit("server:init", {
                game: data,
                currentAction: this.game.currentAction,
                currentPlayerIndex: this.game.currentPlayerIndex,
                playerCount: this.#game.playerCount
            });

            //クライアントからの各種イベントを処理
            socket.on("client:setName", (ev) => {//名前変更
                socket.data.name = ev.newName;
                //全員に名前変更を通知
                io.emit("server:setName", {
                    socketId:socket.id,
                    newName: ev.newName
                });
                
            }).on("client:message", (ev) => {//メッセージ送信
                //全員にメッセージを送信
                io.emit("server:message", {
                    from: socket.id,
                    message: ev.message
                });

            }).on("client:start", (data) =>  {//ゲーム開始
                if (socket.id !== ownerSocketId) return;
                this.#game.reset(this.socketCount);
                //全員にゲーム開始を通知
                io.emit("server:start", { players: genPlayerList() });

            }).on("disconnect", () => {
                if (socket.id === ownerSocketId) {
                    const nextSocket = sockets.values().next().value
                    if (nextSocket)  {
                        nextSocket.data.isOwner = true;
                        ownerSocketId = nextSocket.id;
                        //オーナー変更を通知
                        io.emit("server:playerList", { players: genPlayerList() });

                    } else {
                        this.#autoClose();

                    }
                }

            });

        });
    }

    get game() {
        return this.#game;
    }

    get socketCount() {
        return this.#sockets.size;
    }



    #autoClose() {
        if (this.#options.autoClose && this.#sockets.size === 0) this.close();
    }
    
    
    close(){
        this.#io.removeAllListeners();
        this.#options.onClose?.();
    }
}


export type ServerInfo = {

}

export type ServerDetails = {

}