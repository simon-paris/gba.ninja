
var VBAGraphics = require("./Graphics");
var VBASound = require("./Sound");
var VBASaves = require("./Saves");
var VBAInput = require("./Input");
var VBAUI = require("./UI");

window.init = function () {

    document.querySelector(".pixels").innerHTML = '<canvas width="240" height="160"></canvas>';

    window.vbaGraphics = new VBAGraphics(window.Module, document.querySelector("canvas"));
    window.vbaGraphics.initScreen();
    window.vbaGraphics.drawFrame();

    window.vbaSound = new VBASound(window.Module);
    window.vbaSaves = new VBASaves(window.Module);
    window.vbaInput = new VBAInput(window.Module);
    window.vbaUI = new VBAUI(document.querySelector(".ui"));

    document.querySelector(".pixels").style.display = "none";
    document.querySelector(".ui").style.display = "block";

    vbaUI.reset();

};


window.start = function () {
    if (window.isRunning) {
        throw new Error("Already started");
    }

    document.querySelector(".pixels").style.display = "block";
    document.querySelector(".ui").style.display = "none";

    var onResize = window.vbaGraphics.onResize.bind(window.vbaGraphics, window.innerWidth, window.innerHeight);
    window.onresize = onResize;
    onResize();

    VBAInterface.VBA_start();

    var GBA_CYCLES_PER_SECOND = 16777216;
    window.isRunning = true;
    var lastFrameTime = Date.now();
    function eachFrame () {
        var currentTime = Date.now();
        var deltaTime = currentTime - lastFrameTime;
        lastFrameTime = currentTime;

        if (isRunning) {
            vbaSaves.checkSaves();

            // Use the number of sound samples to determine if the emulation is running too fast
            if (vbaSound.getNumExtraSamples() < 10000) {
                var cycles = Math.min(
                    GBA_CYCLES_PER_SECOND / 60,
                    Math.floor(GBA_CYCLES_PER_SECOND / (1000 / deltaTime))
                );
                VBAInterface.VBA_do_cycles(cycles);
                requestAnimationFrame(eachFrame, 0);
            } else {
                setTimeout(eachFrame);
            }
        } else {
            VBAInterface.VBA_stop();
            document.querySelector(".pixels").style.display = "none";
            document.querySelector(".ui").style.display = "block";
        }
    };
    eachFrame();

};

window.scheduleStop = function () {
    window.isRunning = false;
};

