import { GF_Game } from "ghost-field-core";
export class GhostField_Server {
    #io;
    #sockets;
    #options;
    #game;
    constructor(io, // | Server<GhostField_Client_EventMap, GhostField_Server_EventMap<EX_Card, EX_Meta>, GhostField_Client_EventMap, socketData>,
    data, options = {}) {
        let ownerSocketId;
        const { sockets } = io;
        this.#io = io;
        this.#sockets = sockets;
        this.#options = options;
        const { timeout = 1000 * 60 * 3 } = options;
        const initCloseTimeout = timeout === Infinity ? undefined : setTimeout(() => {
            this.close();
        }, timeout);
        this.#game = new GF_Game(data, {
            secureMode: true,
            events: {
                onDamage(ev) {
                }
            }
        });
        io.on("connection", (socket) => {
            const socketData = socket.data;
            socketData.bind = -1;
            socketData.name = socket.id;
            socketData.isOwner = false;
            //接続があったらタイムアウト解除
            if (initCloseTimeout)
                clearTimeout(initCloseTimeout);
            console.log(`Client connected: ${socket.id}`);
            if (!ownerSocketId) {
                ownerSocketId = socket.id;
                //ルームオーナーであることを通知
                socket.emit("server:owner", {});
            }
            //初期化データを送信
            socket.emit("server:init", {
                game: data,
                players: (sockets.values().reduce((obj, socket) => { obj[socket.id] = socket.data; return obj; }, {}))
            });
            socket.on("client:setName", (ev) => {
                socket.data.name = ev.newName;
                //全員に名前変更を通知
                io.emit("server:setName", {
                    socketId: socket.id,
                    newName: ev.newName
                });
            }).on("client:message", (ev) => {
                //全員にメッセージを送信
                io.emit("server:message", {
                    from: socket.id,
                    message: ev.message
                });
            }).on("client:start", (data) => {
                if (socket.id !== ownerSocketId)
                    return;
                this.#game.reset(this.socketCount);
                io.emit("server:start", {}); //!!! 未実装
            }).on("disconnect", () => {
                if (socket.id === ownerSocketId) {
                    const nextSocket = sockets.values().next().value;
                    if (nextSocket) {
                        ownerSocketId = nextSocket.id;
                        nextSocket.emit("server:owner", {});
                    }
                    else {
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
        if (this.#options.autoClose && this.#sockets.size === 0)
            this.close();
    }
    close() {
        this.#io.removeAllListeners();
        this.#options.onClose?.();
    }
}
