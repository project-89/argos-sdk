import { EventEmitter } from 'events';
export class PresenceTracker extends EventEmitter {
    constructor(config) {
        super();
        this.isTracking = false;
        this.retryCount = 0;
        this.interval = config?.interval || 30000; // 30 seconds
        this.retryAttempts = config?.retryAttempts || 3;
        this.retryDelay = config?.retryDelay || 5000; // 5 seconds
    }
    start() {
        if (this.isTracking)
            return;
        this.isTracking = true;
        this.track();
    }
    stop() {
        this.isTracking = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
    isActive() {
        return this.isTracking;
    }
    track() {
        if (!this.isTracking)
            return;
        this.updatePresence()
            .then(() => {
            this.retryCount = 0;
            if (this.isTracking) {
                this.timeoutId = setTimeout(() => this.track(), this.interval);
            }
        })
            .catch((error) => {
            this.handleError(error);
        });
    }
    async updatePresence() {
        try {
            const presenceData = {
                timestamp: new Date().toISOString(),
                status: navigator.onLine ? 'online' : 'offline',
            };
            this.emit('presence', presenceData);
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to update presence');
            this.emit('error', err);
            throw err;
        }
    }
    handleError(error) {
        this.emit('error', error);
        if (this.retryCount < this.retryAttempts) {
            this.retryCount++;
            if (this.isTracking) {
                this.timeoutId = setTimeout(() => this.track(), this.retryDelay);
            }
        }
        else {
            this.stop();
            this.emit('maxRetries');
        }
    }
    on(event, handler) {
        return super.on(event, handler);
    }
    off(event, handler) {
        return super.off(event, handler);
    }
}
