export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
export class LogService {
    constructor(config) {
        this.logs = [];
        this.minLevel = config.minLevel;
        this.maxLogs = config.maxLogs || 1000;
    }
    log(level, message, data, category) {
        if (level < this.minLevel)
            return;
        const entry = {
            level,
            message,
            data,
            category,
            timestamp: Date.now(),
        };
        this.logs.push(entry);
        // Trim logs if they exceed maxLogs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        // Console output for development
        const logMethod = this.getConsoleMethod(level);
        const prefix = category ? `[${category}] ` : "";
        if (data) {
            console[logMethod](prefix + message, data);
        }
        else {
            console[logMethod](prefix + message);
        }
    }
    getConsoleMethod(level) {
        switch (level) {
            case LogLevel.DEBUG:
                return "debug";
            case LogLevel.INFO:
                return "info";
            case LogLevel.WARN:
                return "warn";
            case LogLevel.ERROR:
                return "error";
        }
    }
    debug(message, data, category) {
        this.log(LogLevel.DEBUG, message, data, category);
    }
    info(message, data, category) {
        this.log(LogLevel.INFO, message, data, category);
    }
    warn(message, data, category) {
        this.log(LogLevel.WARN, message, data, category);
    }
    error(message, data, category) {
        this.log(LogLevel.ERROR, message, data, category);
    }
    getLogs(level, category) {
        let filtered = this.logs;
        if (level !== undefined) {
            filtered = filtered.filter((log) => log.level >= level);
        }
        if (category) {
            filtered = filtered.filter((log) => log.category === category);
        }
        return filtered;
    }
    clearLogs() {
        this.logs = [];
    }
}
