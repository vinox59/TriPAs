"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const TripasTimerModule_1 = require("./TripasTimerModule");
const TripasTimerStatus_1 = require("./TripasTimerStatus");
class TripasManager {
    constructor(workTime = 2, pauseTime = 0.5, lunchTime = 1) {
        this.workTime = workTime;
        this.pauseTime = pauseTime;
        this.lunchTime = lunchTime;
        // create status bar items
        this._tripasIndex = 0;
        this.tripasi = [];
        if (!this._statusBarText) {
            this._statusBarText = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
            this._statusBarText.show();
        }
        this.reset();
        this.draw();
    }
    get currentTripas() {
        return this.tripasi[this._tripasIndex];
    }
    get currentState() {
        switch (this.currentTripas.status) {
            case TripasTimerStatus_1.default.Work:
                return " - Work Time";
            case TripasTimerStatus_1.default.Rest:
                return " - Rest Time";
            case TripasTimerStatus_1.default.Lunch:
                return " - Lunch Time";
            case TripasTimerStatus_1.default.Paused:
                return " - paused";
            case TripasTimerStatus_1.default.Break:
                return " - break";
            default:
                return "";
        }
    }
    get isSessionFinished() {
        return !this.currentTripas;
    }
    // private methods
    update() {
        // handle launch of the next Tripas
        if (this.currentTripas.status === TripasTimerStatus_1.default.Done) {
            this._tripasIndex++;
            if (!this.isSessionFinished) {
                this.start();
            }
        }
    }
    draw() {
        if (this.isSessionFinished) {
            // show text when all Tripas sessions are over
            //this._statusBarText.text = "Restart session?";
            // show message if user needs a longer break
            if (this.tripasi.length > 1) {
                vscode_1.window.showInformationMessage("Well done! You should now take a longer break.");
            }
            return;
        }
        const seconds = this.currentTripas.timer.currentTime % 60;
        const minutes = (this.currentTripas.timer.currentTime - seconds) / 60;
        // update status bar (text)
        const timerPart = ((minutes < 10) ? "0" : "") + minutes + ":" + ((seconds < 10) ? "0" : "") + seconds;
        let tripasNumberPart = "";
        if (this.tripasi.length > 1) {
            tripasNumberPart += " (" + (this._tripasIndex + 1) + " out of " + this.tripasi.length + " tripasi)";
        }
        this._statusBarText.text = timerPart + this.currentState + tripasNumberPart;
        this._statusBarText.show();
    }
    // public methods
    start() {
        // launch a new session if the previous is already finished
        if (this.isSessionFinished) {
            this._tripasIndex = 0;
        }
        this.currentTripas.start();
        this.currentTripas.onTick = () => {
            this.update();
            this.draw();
        };
    }
    pause() {
        this.currentTripas.pause();
        this.update();
        this.draw();
    }
    reset() {
        this._tripasIndex = 0;
        this.tripasi = [];
        this.tripasi.push(new TripasTimerModule_1.default(this.workTime * 60, this.pauseTime * 60, this.lunchTime * 60));
    }
    dispose() {
        // stop current Tripas
        this.currentTripas.dispose();
        // reset UI
        this._statusBarText.dispose();
    }
}
exports.default = TripasManager;
//# sourceMappingURL=TripasTimerManager.js.map