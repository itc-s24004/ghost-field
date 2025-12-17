export class EventEmitter {
    #listeners = {};
    on(event, listener) {
        const listeners = this.#listeners[event] ??= [];
        listeners.push(listener);
        return this;
    }
    off(event, listener) {
        const listeners = this.#listeners[event];
        if (!listeners)
            return this;
        listeners.splice(listeners.indexOf(listener), 1);
        return this;
    }
    emit(event, ...args) {
        const listeners = this.#listeners[event];
        if (!listeners)
            return this;
        listeners.forEach(listener => listener(...args));
        return this;
    }
}
//# sourceMappingURL=emitter.js.map