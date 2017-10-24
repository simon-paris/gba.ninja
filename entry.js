
var VBAGraphics = require("./Graphics");
var VBASound = require("./Sound");
var VBASaves = require("./Saves");
var VBAInput = require("./Input");
var VBAUI = require("./UI");

var isRunning = false;



window.init = function () {

    document.querySelector(".pixels").innerHTML = '<canvas width="240" height="160"></canvas>';

    window.vbaGraphics = new VBAGraphics(window.gbaninja, document.querySelector("canvas"));
    var res = window.vbaGraphics.initScreen();
    
    if (!res) {
        window.vbaGraphics = null;
        document.querySelector(".pixels").innerHTML = "<p style='margin: 20px;'>You need to enable WebGL</p>";
        return;
    }
    
    window.vbaGraphics.drawFrame();

    window.vbaSound = new VBASound(window.gbaninja);
    window.vbaSaves = new VBASaves(window.gbaninja);
    window.vbaInput = new VBAInput(window.gbaninja);
    window.vbaUI = new VBAUI(document.querySelector(".ui"));

    document.querySelector(".pixels").style.display = "none";
    document.querySelector(".ui").style.display = "block";

    vbaUI.reset();

    window.doPerfCalc();

};


window.start = function () {
    if (window.isRunning) {
        throw new Error("Already started");
    }
    
    if (!window.vbaGraphics) {
        // webgl is disabled
        return;
    }
    
    document.querySelector(".pixels").style.display = "block";
    document.querySelector(".ui").style.display = "none";

    var onResize = window.vbaGraphics.onResize.bind(window.vbaGraphics, window.innerWidth, window.innerHeight);
    window.onresize = onResize;
    onResize();

    VBAInterface.VBA_start();

    gtag("event", "run_rom", {
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

window.deltaTimesThisSecond = [];
window.cyclesThisSecond = [];
window.renderTimesThisSecond = [];
window.spareAudioSamplesThisSecond = [];
window.audioDeadlineResultsThisSecond = [];

window.doTimestep = function (frameNum) {
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
            cyclesToDo -= Math.min(Math.floor(cyclesToDo * 0.03), GBA_CYCLES_PER_SECOND / 10000);
        }
        if (vbaSound.spareSamplesAtLastEvent < 700) {
            cyclesToDo += Math.min(Math.floor(cyclesToDo * 0.03), GBA_CYCLES_PER_SECOND / 10000);
        }
        VBAInterface.VBA_do_cycles(cyclesToDo);

        window.deltaTimesThisSecond.push(deltaTime);
        window.cyclesThisSecond.push(cyclesToDo);
        
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

window.focusCheck = function () {
    window.lastFocusTime = window.performance.now();
    window.requestAnimationFrame(window.focusCheck);
};

window.perfTimer = null;
window.lastPerfTime = performance.now();
window.doPerfCalc = function () {
    clearTimeout(window.perfTimer);

    var currentTime = window.performance.now();
    var deltaTime = currentTime - lastPerfTime;
    window.lastPerfTime = currentTime;

    if (window.vbaInput.isKeyDown(vbaInput.bindings.PERF_STATS)) {

        document.querySelector(".perf").style.display = "block";

        function samplesToMillis (samples) {
            return Math.floor(samples / window.vbaSound.getSampleRate() * 1000) + "ms";
        }

        var romCode = window.vbaSaves.getRomCode();
        var sumCycles = window.cyclesThisSecond.reduce(function (a, b) { return a + b; }, 0);
        var maxAudioSamples = window.spareAudioSamplesThisSecond.reduce(function (a, b) { return Math.max(a, b); }, 0);
        var minAudioSamples = window.spareAudioSamplesThisSecond.reduce(function (a, b) { return Math.min(a, b); }, Infinity);
        if (minAudioSamples === Infinity) {
            minAudioSamples = 0;
        }
        var audioDeadlineResults = window.audioDeadlineResultsThisSecond.reduce(function (a, b) {
            if (b) {
                a.hit++;
            } else {
                a.miss++;
            }
            return a;
        }, {hit: 0, miss: 0});
        var renderDeadlineResults = window.renderTimesThisSecond.reduce(function (a, b) {
            if (b < 20) {
                a.hit++;
            } else {
                a.miss++;
            }
            return a;
        }, {hit: 0, miss: 0});
        document.querySelector(".perf-game").innerText = (romCode ? (romCode + " ") : "") + require("./romCodeToEnglish")(romCode);
        document.querySelector(".perf-timesteps").innerText = Math.round(cyclesThisSecond.length / (deltaTime / 1000));
        document.querySelector(".perf-percentage").innerText = (sumCycles / (GBA_CYCLES_PER_SECOND * (deltaTime / 1000)) * 100).toFixed(1) + "%";
        document.querySelector(".perf-audio-lag").innerText = samplesToMillis(minAudioSamples) + " - " + samplesToMillis(maxAudioSamples);
        document.querySelector(".perf-audio-deadlines").innerText = audioDeadlineResults.hit + " / " + (audioDeadlineResults.hit + audioDeadlineResults.miss);
        document.querySelector(".perf-render-deadlines").innerText = renderDeadlineResults.hit + " / " + (renderDeadlineResults.hit + renderDeadlineResults.miss);
        
    } else {

        document.querySelector(".perf").style.display = "none";

    }


    window.cyclesThisSecond.length = 0;
    window.deltaTimesThisSecond.length = 0;
    window.renderTimesThisSecond.length = 0;
    window.spareAudioSamplesThisSecond.length = 0;
    window.audioDeadlineResultsThisSecond.length = 0;

    window.perfTimer = setTimeout(window.doPerfCalc, 1000);
};

window.scheduleStop = function () {
    isRunning = false;
};

window.gbaninja = require("./emu.js")(window.gbaninja);

