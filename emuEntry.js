import * as emulator from "./build/emu.js";

// Fix after updating to webpack 5 and switching to import rather than require
// It tries to come in here multiple times for some reason so checks for this
const isReadyNotDefined = window.gbaninja && window.gbaninja.ready === undefined;
if (isReadyNotDefined) {
    const readyPromise = emulator(window.gbaninja);
    readyPromise.then(gbaNinja => {
        // Replace global object with the emulator object
        window.gbaninja = gbaNinja;
    });
}