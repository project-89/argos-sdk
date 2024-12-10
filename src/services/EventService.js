export class EventService {
    constructor() {
        this.listeners = new Map();
    }
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
            if (this.listeners.get(event)?.size === 0) {
                this.listeners.delete(event);
            }
        };
    }
    emit(event, data) {
        this.listeners.get(event)?.forEach((callback) => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
    listenerCount(event) {
        return this.listeners.get(event)?.size || 0;
    }
    removeAllListeners() {
        this.listeners.clear();
    }
}
