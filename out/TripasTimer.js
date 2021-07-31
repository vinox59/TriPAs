"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Timer {
    constructor(currentTime = 0, interval = 1000) {
        this.currentTime = currentTime;
        this.interval = interval;
        this._timerId = null;
    }
    get isRunning() {
        return this._timerId != null;
    }
    reset(time) {
        this.stop();
        this.currentTime = time;
    }
    start(callback) {
        if (this._timerId == null) {
            this._timerId = setInterval(() => {
                this.tick();
                callback();
            }, this.interval);
        }
        else {
            console.error("A timer instance is already running...");
        }
    }
    stop() {
        if (this._timerId != null) {
            clearInterval(this._timerId);
        }
        this._timerId = null;
    }
    tick() {
        this.currentTime -= this.interval / 1000;
    }
}
exports.default = Timer;
//# sourceMappingURL=TripasTimer.js.map