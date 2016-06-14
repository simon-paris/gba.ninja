
#include "EmscriptenSoundDriver.h"

#include <emscripten.h>

/**
 * Destructor. Free the resources allocated by the sound driver.
 */
EmscriptenSoundDriver::~EmscriptenSoundDriver() {
}


bool EmscriptenSoundDriver::init(long sampleRate) {
    EM_ASM_INT({return window["VBAInterface"]["initSound"]()}, 0);
    return true;
}

void EmscriptenSoundDriver::pause() {
    EM_ASM_INT({return window["VBAInterface"]["pauseSound"]()}, 0);
}

void EmscriptenSoundDriver::reset() {
    EM_ASM_INT({return window["VBAInterface"]["resetSound"]()}, 0);
}

void EmscriptenSoundDriver::resume() {
    EM_ASM_INT({return window["VBAInterface"]["resumeSound"]()}, 0);
}

void EmscriptenSoundDriver::write(u16 * finalWave, int length) {
    EM_ASM_INT({return window["VBAInterface"]["writeSound"]($0, $1)}, (int) finalWave, length);
}

