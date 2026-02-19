import { GF_Card, GF_Error, GF_Game, GF_Player } from "ghost-field-core";
export class GhostField_Server {
    #io;
    #sockets;
    #options;
    #game;
    #firstConnectTimeOut;
    #ownerSocketId;
    getPlayerSocket(player) {
        const index = typeof player === "number" ? player : this.#game.getPlayerIndex(player);
        return this.#sockets.values().find(socket => socket.data.bind === index);
    }
    constructor(io, // | Server<GhostField_Client_EventMap, GhostField_Server_EventMap<EX_Card, EX_Meta>, GhostField_Client_EventMap, socketData>,
    data, options = {}) {
        const { sockets } = io;
        this.#io = io;
        this.#sockets = sockets;
        this.#options = options;
        const { timeout = 1000 * 60 * 3 } = options;
        this.#firstConnectTimeOut = timeout === Infinity ? undefined : setTimeout(() => {
            this.close();
        }, timeout);
        this.#game = new GF_Game(data);
        this.#initGameListeners();
        this.#initSocketListeners();
    }
    #initSocketListeners() {
        this.#io.on("connection", (socket) => {
            //タイムアウト解除
            clearTimeout(this.#firstConnectTimeOut);
            //接続したクライアントのソケットに初期データを設定
            socket.data.bind = -1;
            socket.data.name = "名無し";
            socket.data.isOwner = false;
            socket.data.socketId = socket.id;
            if (!this.#ownerSocketId) { //最初の接続をオーナーにする
                this.#ownerSocketId = socket.id;
                socket.data.isOwner = true;
            }
            this.#IO_PlayerList();
            //接続したクライアントに初期化データを送信
            socket.emit("server:init", {
                game: this.#game.initData,
                currentField: this.currentField,
                currentPlayerIndex: this.#game.currentPlayerIndex,
                sockets: this.#game.allPlayers.map(player => player.status),
                isPlaying: this.#game.isPlaying
            });
            socket.on("client:setName", (ev) => {
                socket.data.name = ev.newName;
                this.#IO_ChangeName(socket.id, ev.newName);
            }).on("client:message", (ev) => {
                this.#IO_Message(socket.id, ev.message);
            }).on("client:start", () => {
                if (socket.id !== this.#ownerSocketId)
                    return;
                console.log("ゲームを開始します。");
                this.#sockets.values().forEach((socket, index) => {
                    socket.data.bind = index;
                });
                this.#IO_PlayerList();
                this.#game.reset(this.#sockets.size);
                this.#io.emit("server:start", {
                    sockets: this.#sockets.values().map(socket => socket.data).toArray(),
                    gamePlayers: this.#game.allPlayers.map(player => player.status)
                });
                this.#IO_FieldChange();
            }).on("client:useCard", (ev) => {
                if (!this.#game.isPlaying)
                    return;
                const playerIndex = socket.data.bind;
                //行動中のプレイヤー以外からの入力は無視
                if (playerIndex === -1 || playerIndex !== this.#game.currentPlayerIndex) {
                    socket.disconnect();
                    return;
                }
                try {
                    const { cards, targetIndex, useOptions } = ev;
                    this.#game.next(cards, targetIndex, useOptions);
                }
                catch (e) {
                    if (e instanceof GF_Error)
                        console.error(`Error: ${e.message}`);
                    socket.disconnect();
                }
            }).on("disconnect", () => {
                const player = this.#game.getPlayerByIndex(socket.data.bind);
                if (player)
                    this.#game.kill(player);
                if (socket.id === this.#ownerSocketId) { //オーナーが抜けたとき
                    const nextOwner = this.#sockets.values().next().value;
                    if (nextOwner) { //次のオーナーがいるとき
                        this.#ownerSocketId = nextOwner.data.socketId;
                        nextOwner.data.isOwner = true;
                    }
                    else {
                        this.#ownerSocketId = undefined;
                        this.#autoClose();
                        return;
                    }
                }
                this.#IO_PlayerList();
            });
        });
    }
    get currentField() {
        const action = this.#game.currentAction;
        if (!action)
            return undefined;
        return {
            action: action.cards.map(c => c.id),
            source: this.#game.getPlayerIndex(action.src)
        };
    }
    #initGameListeners() {
        this.#game.on("gameSystem", "onDrawCard", (data) => {
            const socket = this.getPlayerSocket(data.player);
            if (socket) {
                socket.emit("server:drawCard", {
                    card: data.drawnCard.id,
                    removedCard: data.removedCard?.id
                });
            }
        }).on("gameSystem", "onDamage", (data) => {
            console.log(`プレイヤー${this.#game.getPlayerIndex(data.player)}が${data.damage}ダメージを受けました。`);
            const playerIndex = this.#game.getPlayerIndex(data.player);
            this.#IO_PlayerStatusChange(playerIndex, data.player.status);
        }).on("gameSystem", "onHeal", (data) => {
            const playerIndex = this.#game.getPlayerIndex(data.player);
            this.#IO_PlayerStatusChange(playerIndex, data.player.status);
        }).on("gameSystem", "onUseCard", (data) => {
            const playerIndex = this.#game.getPlayerIndex(data.player);
            this.#io.emit("server:useCard", {
                playerIndex,
                cards: data.cards.map(c => c.id),
                stackCard: Object.fromEntries(data.result.stackCards.entries().map(([card, count]) => ([card.id, count])))
            });
        }).on("gameSystem", "onNextTurn", (data) => {
            console.log(`プレイヤー${this.#game.currentPlayerIndex}の${this.currentField ? "防御" : "攻撃"}ターンになりました。`);
            this.#IO_FieldChange();
        }).on("gameSystem", "onGameEnd", (data) => {
            console.log("ゲームが終了しました。");
            const winnerIndex = data.winner ? this.#game.getPlayerIndex(data.winner) : -1;
            this.#io.emit("server:end", {
                winnerIndex
            });
        });
    }
    #IO_PlayerList() {
        this.#io.emit("server:playerListChange", {
            sockets: this.#sockets.values().map(socket => socket.data).toArray()
        });
    }
    #IO_ChangeName(socketId, newName) {
        this.#io.emit("server:setName", {
            socketId,
            newName
        });
    }
    #IO_Message(socketId, message) {
        this.#io.emit("server:message", {
            from: socketId,
            message
        });
    }
    #IO_PlayerStatusChange(playerIndex, status) {
        this.#io.emit("server:playerStatusChange", {
            playerIndex,
            status
        });
    }
    #IO_FieldChange() {
        this.#io.emit("server:fieldChange", {
            action: this.currentField,
            currentPlayer: this.#game.currentPlayerIndex
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
        this.#io.sockets.forEach(socket => socket.disconnect(true));
        this.#options.onClose?.();
    }
}
