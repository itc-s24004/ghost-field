export class EventEmitter<T extends Record<string, (...args: never[]) => void>> {
    #listeners: {[K in keyof T]?: T[K][]} = {};

    on<K extends keyof T>(event: K, listener: T[K]) {
        const listeners = this.#listeners[event] ??= [];
        listeners.push(listener);
        return this;
    }

    off<K extends keyof T>(event: K, listener: T[K]) {
        const listeners = this.#listeners[event];
        if (!listeners) return this;
        listeners.splice(listeners.indexOf(listener), 1);
        return this;
    }

    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>) {
        const listeners = this.#listeners[event];
        if (!listeners) return this;
        listeners.forEach(listener => listener(...args));
        return this;
    }
}