export declare class EventEmitter<T extends Record<string, (...args: never[]) => void>> {
    #private;
    on<K extends keyof T>(event: K, listener: T[K]): this;
    off<K extends keyof T>(event: K, listener: T[K]): this;
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): this;
}
//# sourceMappingURL=emitter.d.ts.map