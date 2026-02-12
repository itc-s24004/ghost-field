export function Input() {
    return new Promise<string>((resolve) => {
        process.stdin.once("data", (data) => {
            resolve(data.toString().trim());
        });
    });
}


export async function InputString(label: string): Promise<string> {
    process.stdout.write(`${label}: `);
    const input = await Input();
    return input;
}


export async function InputSelect(options: string[]): Promise<number> {
    options.forEach((option, index) => {
        console.log(`${index + 1}: ${option}`);
    });
    while (true) {
        const input = await InputString("選択肢の番号を入力");
        const index = parseInt(input, 10) - 1;
        if (index >= 0 && index < options.length) {
            return index;
        }
        console.log("無効な入力です。もう一度入力してください。");
    }
}