class Ticker {
    constructor() {
        this.stepsPerSecond = 30;
        this.stepDuration = 1000 / this.stepsPerSecond;
        this.prevFrameTime = undefined;
        this.tickerTime = 0.0;
    }

    tick() {
        var now = performance.now();
        var dt = now - (this.prevFrameTime || now);  // in milliseconds
        var deltaStepNo = 0;
        if (this.tickerTime >= 1000 / this.stepsPerSecond) {
            var quotient = this.tickerTime / this.stepDuration;
            deltaStepNo = Math.floor(quotient);
            this.tickerTime %= this.stepDuration;
        }
        this.tickerTime += dt;
        this.prevFrameTime = now;
        return deltaStepNo;
    }

    setStepsPerSecond(sps) {
        this.stepsPerSecond = sps;
        this.stepDuration = 1000 / sps;
        this.tickerTime = 0.0;
    }
}
