export class QueueService {
    constructor(config) {
        this.queue = [];
        this.isProcessing = false;
        this.maxRetries = config.maxRetries;
        this.retryDelay = config.retryDelay;
        this.loadQueue();
        window?.addEventListener("online", () => this.processQueue());
    }
    async enqueue(request) {
        const queuedRequest = {
            ...request,
            id: Math.random().toString(36).substring(7),
            retries: 0,
            timestamp: Date.now(),
        };
        this.queue.push(queuedRequest);
        this.saveQueue();
        if (navigator?.onLine) {
            this.processQueue();
        }
    }
    getQueueSize() {
        return this.queue.length;
    }
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0)
            return;
        this.isProcessing = true;
        try {
            const requests = [...this.queue];
            for (const request of requests) {
                if (request.retries >= this.maxRetries) {
                    this.removeFromQueue(request.id);
                    continue;
                }
                try {
                    await fetch(request.endpoint, {
                        method: request.method,
                        headers: request.headers,
                        body: request.body ? JSON.stringify(request.body) : undefined,
                    });
                    this.removeFromQueue(request.id);
                }
                catch (error) {
                    request.retries++;
                    if (request.retries < this.maxRetries) {
                        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
                    }
                }
            }
        }
        finally {
            this.isProcessing = false;
            this.saveQueue();
        }
    }
    removeFromQueue(id) {
        this.queue = this.queue.filter((request) => request.id !== id);
        this.saveQueue();
    }
    saveQueue() {
        try {
            localStorage.setItem("argos_queue", JSON.stringify(this.queue));
        }
        catch (error) {
            console.error("Error saving queue:", error);
        }
    }
    loadQueue() {
        try {
            const saved = localStorage.getItem("argos_queue");
            if (saved) {
                this.queue = JSON.parse(saved);
            }
        }
        catch (error) {
            console.error("Error loading queue:", error);
            this.queue = [];
        }
    }
    destroy() {
        window?.removeEventListener("online", () => this.processQueue());
        this.queue = [];
        this.saveQueue();
    }
}
