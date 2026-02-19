import { GhostField_Client } from "../client/client.js";
import { Input, InputSelect, InputString } from "./util.js";

const client = new GhostField_Client();

client.on("hello", "server:playerListChange", (data) => {
    console.log("プレイヤーリストが更新されました:");
    data.sockets.forEach((state) => {
        console.log(`- ${state.name} (${state.socketId})${state.isOwner ? " [オーナー]" : ""} ${client.state?.socketId === state.socketId ? " <- 自分" : ""}`);
    });
    
}).on("hello", "server:message", (data) => {
    console.log(`[${data.from}] ${data.message}`);

});

(async () => {
    const _serverIP = await InputString("サーバーアドレスを入力");
    const serverIP = _serverIP.trim() === "" ? "ws://localhost:5000/test" : _serverIP.trim();
    console.log(`Connecting to server at ${serverIP}...`);
    const url = new URL(serverIP);
    console.log(`Connecting to ${url.toString()}...`);
    await client.connect(url);


    while (true) {
        await Input();
        const cmd = await InputSelect(["exit", "名前を変更", "メッセージ送信"]);
        if (cmd === 0) {
            console.log("Exiting...");
            process.exit(0);

        } else if (cmd == 1) {
            const name = await InputString("新しい名前を入力");
            client.changeName(name);

        } else if (cmd === 2) {
            const message = await InputString("送信するメッセージを入力");
            client.sendMessage(message);
        }
    }
    
})()