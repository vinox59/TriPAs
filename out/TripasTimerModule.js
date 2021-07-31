"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode = require("vscode");
const TripasTimerStatus_1 = require("./TripasTimerStatus");
const TripasTimer_1 = require("./TripasTimer");
class Tripas {
    constructor(workTime = 3 * 60, pauseTime = 0.5 * 60, lunchTime = 1 * 60) {
        this.workTime = workTime;
        this.pauseTime = pauseTime;
        this.lunchTime = lunchTime;
        this.tripasIndex = 0;
        this.workTime = Math.floor(this.workTime);
        this.pauseTime = Math.floor(this.pauseTime);
        this.lunchTime = Math.floor(this.lunchTime);
        this._timer = new TripasTimer_1.default();
        this.status = TripasTimerStatus_1.default.None;
    }
    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
    }
    get timer() {
        return this._timer;
    }
    // private methods
    done() {
        this.stop();
        this.status = TripasTimerStatus_1.default.Done;
    }
    resetTimer(status) {
        if (status === TripasTimerStatus_1.default.Work) {
            this.timer.reset(this.workTime);
        }
        if (status === TripasTimerStatus_1.default.Rest) {
            this.timer.reset(this.pauseTime);
        }
        if (status === TripasTimerStatus_1.default.Lunch) {
            this.timer.reset(this.lunchTime);
        }
    }
    // public methods
    start(status = TripasTimerStatus_1.default.Work) {
        if (status === TripasTimerStatus_1.default.Work || status === TripasTimerStatus_1.default.Rest || status === TripasTimerStatus_1.default.Lunch) {
            if (this.status !== TripasTimerStatus_1.default.Paused) {
                this.resetTimer(status);
            }
            this.status = status;
            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            this._timer.start(async () => {
                // stop the timer if no second left
                if (this.timer.currentTime <= 0) {
                    if (this.status === TripasTimerStatus_1.default.Work) {
                        if (this.tripasIndex === 2) {
                            this.timer.stop();
                            const Yes = 'Yes';
                            const No = 'Need more Time';
                            vscode.window.showInformationMessage('Its Lunch Time, Begin the AI Process?', Yes, No)
                                .then(selection => {
                                if (selection === Yes) {
                                    //vscode.env.openExternal(vscode.Uri.parse(
                                    //'https://www.merriam-webster.com/dictionary/hep'));
                                    this.workTime = 20;
                                    this.start(TripasTimerStatus_1.default.Lunch);
                                }
                                if (selection === No) {
                                    this.tripasIndex--;
                                    this.workTime = 30;
                                    this.start(TripasTimerStatus_1.default.Work);
                                }
                            });
                            await delay(10000);
                            this.workTime = 20;
                            this.start(TripasTimerStatus_1.default.Work);
                        }
                        else {
                            vscode_1.window.showInformationMessage("Work done! Take a break.");
                            this.start(TripasTimerStatus_1.default.Rest);
                        }
                        this.tripasIndex++;
                    }
                    else if (this.status === TripasTimerStatus_1.default.Rest) {
                        vscode_1.window.showInformationMessage("Please resume the work.");
                        this.start(TripasTimerStatus_1.default.Work);
                    }
                    else if (this.status === TripasTimerStatus_1.default.Lunch) {
                        vscode_1.window.showInformationMessage("AI work done. Please resume work.");
                        this.start(TripasTimerStatus_1.default.Work);
                    }
                }
                if (this.onTick) {
                    this.onTick();
                }
            });
        }
        else {
            console.error("Start timer error");
        }
    }
    pause() {
        this.stop();
        this.status = TripasTimerStatus_1.default.Paused;
    }
    reset() {
        this.stop();
        this.status = TripasTimerStatus_1.default.None;
        this._timer.currentTime = this.workTime;
    }
    stop() {
        this._timer.stop();
    }
    dispose() {
        this.stop();
        this.status = TripasTimerStatus_1.default.None;
    }
}
exports.default = Tripas;
//# sourceMappingURL=TripasTimerModule.js.map