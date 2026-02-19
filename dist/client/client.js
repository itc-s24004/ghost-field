import { io } from "socket.io-client";
import { CategoryEventEmitter, GF_Card, GF_Deck, GF_Player, GF_PlayerDeck, GF_Util } from "ghost-field-core";
import { GhostFieldCore } from "../index.js";
export class GhostField_Client extends CategoryEventEmitter {
    #socket = null;
    get socketID() {
        return this.#socket?.id;
    }
    get isConnected() {
        return this.#socket?.connected ?? false;
    }
    #field = null;
    #currentPlayerIndex = -1;
    get currentPlayerIndex() {
        return this.#currentPlayerIndex;
    }
    get currentPlayer() {
        return this.#gamePlayers[this.#currentPlayerIndex];
    }
    #gamePlayers = [];
    get allGamePlayers() {
        return this.#gamePlayers;
    }
    #sockets = [];
    get sockets() {
        return this.#sockets;
    }
    getGamePlayerStatus(bind) {
        return this.#gamePlayers[bind];
    }
    getStatusBySocketID(socketID) {
        return this.#sockets.find(player => player.socketId === socketID);
    }
    getStatusByBind(bind) {
        return this.#sockets.find(p => p.bind === bind);
    }
    get state() {
        return this.sockets.find(player => player.socketId === this.#socket?.id);
    }
    #deck = null;
    #player = null;
    #playerDeck = null;
    #isPlaying = false;
    get isPlaying() {
        return this.#isPlaying;
    }
    get field() {
        return this.#field;
    }
    get isMyTurn() {
        return this.currentPlayerIndex === this.state?.bind;
    }
    get hp() {
        return this.#player?.hp ?? 0;
    }
    get mp() {
        return this.#player?.mp ?? 0;
    }
    get gold() {
        return this.#player?.gold ?? 0;
    }
    get hand() {
        const hand = this.#playerDeck?.hand;
        return hand ? new Map(hand) : new Map();
    }
    get magicStack() {
        const magics = this.#playerDeck?.magicStack;
        return magics ? new Map(magics) : new Map();
    }
    get deck() {
        return this.#deck;
    }
    canUseCard(cards) {
        if (!this.isMyTurn)
            return false;
        const cardData = cards.map(c => {
            if (c instanceof GF_Card)
                return c;
            return this.#deck?.masterDeck.getCardByID(c);
        }).filter(c => c !== undefined);
        const isAttack = this.#field === null;
        if (cards.length === 0) {
            if (isAttack && this.#playerDeck?.hasCanUseCard()) {
                console.log("使用可能なカードがあります。");
                return false;
            }
            return true;
        }
        const baseCard = cardData[0];
        const multiCard = cardData.slice(1);
        if (!baseCard)
            return false;
        try {
            const mix = isAttack ?
                GF_Util.useOffensive(this.currentPlayer, baseCard, { cards: multiCard }) :
                GF_Util.useDefensive(this.currentPlayer, baseCard, { cards: multiCard });
            return this.#playerDeck?.canUseCards(mix) ?? false;
        }
        catch (e) {
            return false;
        }
    }
    #messages = [];
    get messages() {
        //!!! clone data
        return this.#messages;
    }
    constructor() {
        super();
    }
    //外部から発火させないために、emitはオーバーライドして空実装にする
    emit(eventName, data) {
        return this;
    }
    async connect(url) {
        if (this.#socket)
            return;
        this.#socket = io(url.toString(), {
            autoConnect: true,
            reconnection: true,
            transports: ["websocket"],
        }).once("connect", () => {
            console.log(`Connected to server: ${url.toString()}`);
        });
        this.#initSocketListeners();
        // this.#socket.connect();
    }
    disconnect() {
        this.#socket?.disconnect();
        this.#socket?.removeAllListeners();
        this.#socket = null;
    }
    toSystemAction(action) {
        if (!action)
            return null;
        const cards = action.action?.map(id => this.#deck?.masterDeck.getCardByID(id)).filter((c) => c !== undefined);
        if (!cards)
            return null;
        const gamePlayer = this.#gamePlayers[action.source];
        if (!gamePlayer)
            return null;
        const baseCard = cards[0];
        if (!baseCard)
            return null;
        const multiCard = cards.slice(1);
        const mix = GF_Util.useOffensive(gamePlayer, baseCard, { cards: multiCard, });
        if (mix.type !== "attack")
            return null;
        return mix;
    }
    #initSocketListeners() {
        if (!this.#socket)
            return;
        this.#socket
            .on("connect", () => {
            super.emit("connect", {});
        })
            .on("disconnect", () => {
            super.emit("disconnect", {});
        })
            //プレイヤーリストの更新 - 入室、退室、名前変更などで送られてくる
            .on("server:playerListChange", (data) => {
            this.#sockets = data.sockets;
            super.emit("server:playerListChange", data);
        })
            //ゲーム初期化 - 入室時にゲーム情報を送る
            .on("server:init", (data) => {
            Object.freeze(data);
            const deck = new GF_Deck(data.game.cards);
            const player = new GF_Player(deck);
            const playerDeck = new GF_PlayerDeck(player, deck);
            this.#deck = playerDeck;
            this.#player = player;
            this.#playerDeck = playerDeck;
            this.#currentPlayerIndex = data.currentPlayerIndex;
            this.#gamePlayers = data.sockets;
            this.#isPlaying = data.isPlaying;
            this.#field = data.currentField ? this.toSystemAction(data.currentField) : null;
            super.emit("server:init", data);
        })
            .on("server:setName", (data) => {
            const { socketId, newName } = data;
            const player = this.#sockets.find(p => p.socketId === socketId);
            if (player)
                player.name = newName;
            super.emit("server:setName", data);
        })
            //ゲームチャット
            .on("server:message", (data) => {
            Object.freeze(data);
            this.#messages.push(data);
            super.emit("server:message", data);
        })
            //ゲーム開始
            .on("server:start", (data) => {
            this.#sockets = data.sockets;
            this.#gamePlayers = data.gamePlayers;
            this.#isPlaying = true;
            super.emit("server:start", data);
        })
            //現在のゲーム状態
            .on("server:fieldChange", (data) => {
            Object.freeze(data);
            this.#field = this.toSystemAction(data.action);
            this.#currentPlayerIndex = data.currentPlayer;
            super.emit("server:fieldChange", data);
        })
            //カードドロー
            .on("server:drawCard", (data) => {
            this.#playerDeck?.addHandCard(data.card);
            if (data.removedCard)
                this.#playerDeck?.removeHandCard(data.removedCard);
            super.emit("server:drawCard", data);
        })
            //カード更新
            .on("server:updateCard", (data) => {
            const { handCards, magicCards } = data;
            this.#playerDeck?.clearAll();
            this.#playerDeck?.setHandCards(handCards);
            this.#playerDeck?.setMagicStackCards(magicCards);
            super.emit("server:updateCard", data);
        })
            //プレイヤーの状態変化 - ダメージ、回復
            .on("server:playerStatusChange", (data) => {
            const { playerIndex, status } = data;
            const gamePlayer = this.#gamePlayers[playerIndex];
            if (gamePlayer)
                this.#gamePlayers[playerIndex] = status;
            super.emit("server:playerStatusChange", data);
        })
            //カード使用
            .on('server:useCard', (data) => {
            const { playerIndex, cards, stackCard } = data;
            if (playerIndex === this.state?.bind) {
                cards.forEach(cardID => {
                    this.#playerDeck?.removeHandCard(cardID);
                });
                Object.entries(stackCard).forEach(([cardID, count]) => {
                    this.#playerDeck?.addMagicStackCard(cardID, count);
                });
            }
            super.emit("server:useCard", data);
        })
            .on("server:end", (data) => {
            this.#playerDeck?.clearAll();
            this.#isPlaying = false;
            super.emit("server:end", data);
        })
            .onAny((event, ...args) => {
            super.emit("all", event);
        });
    }
    changeName(name) {
        this.#socket?.emit("client:setName", { newName: name });
    }
    sendMessage(message) {
        this.#socket?.emit("client:message", { message });
    }
    startGame() {
        this.#socket?.emit("client:start", {});
    }
    useCard(cards, targetIndex, useOptions) {
        if (!this.isMyTurn)
            return;
        const cardIDs = cards.map(c => c instanceof GF_Card ? c.id : c);
        this.#socket?.emit("client:useCard", {
            cards: cardIDs,
            targetIndex,
            useOptions
        });
    }
}
