
var VBAGraphics = require("./Graphics");
var VBASound = require("./Sound");
var VBASaves = require("./Saves");
var VBAInput = require("./Input");
var VBAUI = require("./UI");

var isRunning = false;
var isPaused = false;



window.init = function () {

    document.querySelector(".pixels").innerHTML = '<canvas width="240" height="160"></canvas>';

    window.vbaGraphics = new VBAGraphics(window.gbaninja, document.querySelector("canvas"));
    var res = window.vbaGraphics.initScreen();
    
    if (!res) {
        window.vbaGraphics = null;
        document.querySelector(".pixels").innerHTML = "<p style='margin: 20px;'>You need to enable WebGL</p>";
        gtag("event", "webgl_disabled_at_init_1", {});
        return;
    }
    
    window.vbaGraphics.drawFrame();

    window.vbaSound = new VBASound(window.gbaninja);
    window.vbaSaves = new VBASaves(window.gbaninja);
    window.vbaInput = new VBAInput(window.gbaninja);
    window.vbaUI = new VBAUI(document.querySelector(".ui"));

    document.querySelector(".pixels").style.display = "none";

    if (!qs.exclusive) {
        document.querySelector(".ui").style.display = "block";
    }

    vbaUI.reset();

    window.doPerfCalc();

};


window.start = function () {
    if (window.isRunning) {
        throw new Error("Already started");
    }
    
    if (!window.vbaGraphics) {
        // webgl is disabled
        gtag("event", "webgl_disabled_at_start_1", {});
        return;
    }
    
    document.querySelector(".pixels").style.display = "block";
    document.querySelector(".ui").style.display = "none";

    var onResize = window.vbaGraphics.onResize.bind(window.vbaGraphics, window.innerWidth, window.innerHeight);
    window.onresize = onResize;
    onResize();

    VBAInterface.VBA_start();

    gtag("event", "run_rom_1", {
        event_label: window.vbaSaves.getRomCode() + " " + require("./romCodeToEnglish")(window.vbaSaves.getRomCode()),
    });

    isRunning = true;    
    window.focusCheck();
    window.doTimestep(window.frameNum + 1);
    
    

};

var GBA_CYCLES_PER_SECOND = 16777216;
var TARGET_FRAMERATE = 500;
window.lastFrameTime = window.performance.now();
window.frameTimeout = null;
window.animationFrameRequest = null;
window.frameNum = 1;
window.lastFocusTime = 0;

window.vbaPerf = {};
vbaPerf.deltaTimesThisSecond = [];
vbaPerf.cyclesThisSecond = [];
vbaPerf.renderDeadlineResultsThisSecond = [];
vbaPerf.spareAudioSamplesThisSecond = [];
vbaPerf.audioDeadlineResultsThisSecond = [];

window.doTimestep = function (frameNum, mustRender) {

    if (!hasEmuModule()) {
        return;
    }

    if (frameNum !== window.frameNum + 1) {
        return;
    }
    window.frameNum = frameNum;

    var currentTime = window.performance.now();
    var deltaTime = currentTime - lastFrameTime;
    var clampedDeltaTime = Math.min(50, deltaTime);

    if (currentTime - window.lastFocusTime > 100 || deltaTime < 0.1) {
        window.animationFrameRequest = window.requestAnimationFrame(function () {
            window.doTimestep(frameNum + 1);
        });
        return;
    }
    lastFrameTime = currentTime;

    if (isRunning) {
        vbaSaves.checkSaves();
        
        var cyclesToDo = Math.floor(GBA_CYCLES_PER_SECOND / (1000 / clampedDeltaTime));
        if (vbaSound.spareSamplesAtLastEvent > 1000) {
            cyclesToDo -= Math.floor(Math.min(cyclesToDo * 0.03, GBA_CYCLES_PER_SECOND / 10000));
        }
        if (vbaSound.spareSamplesAtLastEvent < 700) {
            cyclesToDo += Math.floor(Math.min(cyclesToDo * 0.03, GBA_CYCLES_PER_SECOND / 10000));
        }
        if (!isPaused) {
            VBAInterface.VBA_do_cycles(cyclesToDo);
        }

        vbaPerf.deltaTimesThisSecond.push(deltaTime);
        vbaPerf.cyclesThisSecond.push(cyclesToDo);
        
        clearTimeout(window.frameTimeout);
        window.frameTimeout = setTimeout(function () {
            window.doTimestep(frameNum + 1);
        }, 1000 / TARGET_FRAMERATE);
        cancelAnimationFrame(window.animationFrameRequest);
        window.animationFrameRequest = window.requestAnimationFrame(function () {
            window.doTimestep(frameNum + 1);
        });

    } else if (VBAInterface.VBA_get_emulating()) {
        VBAInterface.VBA_stop();
        document.querySelector(".pixels").style.display = "none";
        document.querySelector(".ui").style.display = "block";
    }

};

window.hasRequestedFrameButNotRendered = false;
window.focusCheck = function () {
    window.lastFocusTime = window.performance.now();
    window.hasRequestedFrameButNotRendered = true;
    window.requestAnimationFrame(window.focusCheck);
};

window.perfTimer = null;
window.lastPerfTime = performance.now();
window.doPerfCalc = function () {
    
    clearTimeout(window.perfTimer);

    var currentTime = window.performance.now();
    var deltaTime = currentTime - lastPerfTime;
    window.lastPerfTime = currentTime;

    if (hasEmuModule() && window.vbaInput.isKeyDown(vbaInput.bindings.PERF_STATS)) {

        document.querySelector(".perf").style.display = "block";

        function samplesToMillis (samples) {
            return Math.floor(samples / window.vbaSound.getSampleRate() * 1000) + "ms";
        }

        var romCode = window.vbaSaves.getRomCode();
        var sumCycles = vbaPerf.cyclesThisSecond.reduce(function (a, b) { return a + b; }, 0);
        var maxAudioSamples = vbaPerf.spareAudioSamplesThisSecond.reduce(function (a, b) { return Math.max(a, b); }, 0);
        var minAudioSamples = vbaPerf.spareAudioSamplesThisSecond.reduce(function (a, b) { return Math.min(a, b); }, Infinity);
        if (minAudioSamples === Infinity) {
            minAudioSamples = 0;
        }
        var audioDeadlineResults = vbaPerf.audioDeadlineResultsThisSecond.reduce(function (a, b) {
            if (b) {
                a.hit++;
            } else {
                a.miss++;
            }
            return a;
        }, {hit: 0, miss: 0});
        var renderDeadlineResults = vbaPerf.renderDeadlineResultsThisSecond.reduce(function (a, b) {
            if (b) {
                a.hit++;
            } else {
                a.miss++;
            }
            return a;
        }, {hit: 0, miss: 0});
        document.querySelector(".perf-game").innerText = (romCode ? (romCode + " ") : "") + require("./romCodeToEnglish")(romCode);
        document.querySelector(".perf-timesteps").innerText = Math.round(vbaPerf.cyclesThisSecond.length / (deltaTime / 1000));
        document.querySelector(".perf-percentage").innerText = (sumCycles / (GBA_CYCLES_PER_SECOND * (deltaTime / 1000)) * 100).toFixed(1) + "%";
        document.querySelector(".perf-audio-lag").innerText = samplesToMillis(minAudioSamples) + " - " + samplesToMillis(maxAudioSamples);
        document.querySelector(".perf-audio-deadlines").innerText = audioDeadlineResults.hit + " / " + (audioDeadlineResults.hit + audioDeadlineResults.miss);
        document.querySelector(".perf-render-deadlines").innerText = renderDeadlineResults.hit + " / " + (renderDeadlineResults.hit + renderDeadlineResults.miss);
        
    } else {

        document.querySelector(".perf").style.display = "none";

    }


    vbaPerf.cyclesThisSecond.length = 0;
    vbaPerf.deltaTimesThisSecond.length = 0;
    vbaPerf.renderDeadlineResultsThisSecond.length = 0;
    vbaPerf.spareAudioSamplesThisSecond.length = 0;
    vbaPerf.audioDeadlineResultsThisSecond.length = 0;

    window.perfTimer = setTimeout(window.doPerfCalc, 1000);
};

window.togglePause = function () {
    if (!isRunning) {
        return;
    }
    isPaused = !isPaused;
    document.querySelector(".ui").style.display = isPaused ? "block" : "none";
    window.vbaUI.setPausedState(isPaused);
};

window.scheduleStop = function () {
    isRunning = false;
};


