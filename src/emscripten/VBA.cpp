#import "../System.h"
#import "../common/ConfigManager.h"
#import "../gba/GBA.h"
#import "../gba/Sound.h"
#import "../gba/agbprint.h"
#import "../Util.h"
#import "EmscriptenSoundDriver.h"
#import <emscripten.h>
#include <cstddef>

#define ENTRY_FN extern "C" int EMSCRIPTEN_KEEPALIVE




void log(const char * format, ...) {
    EM_ASM(debugger;);
//    va_list argptr;
//    va_start(argptr, format);
//    vfprintf(stderr, format, argptr);
//    va_end(argptr);
}

bool systemPauseOnFrame() {
    return false;
}

void systemGbPrint(u8 *,int,int,int,int,int) {
    printf("System GB Print\n");
}

void systemScreenCapture(int num) {}

void systemDrawScreen() {
    // This is not the frame ready callback
}

bool systemReadJoypads() {
    // This indicates that we should prepare for systemReadJoypad, but we don't
    // care, we're always prepared for it.
    return true;
}

u32 systemReadJoypad(int joypadNum) {
    return EM_ASM_INT({return window["VBAInterface"]["getJoypad"]($0)}, joypadNum);
}

u32 systemGetClock() {
    return emscripten_get_now();
}

void systemMessage(int code, const char * format, ...) {
    printf("System Message (%d):\n", code);
    EM_ASM(debugger;);
//    va_list argptr;
//    va_start(argptr, format);
//    vfprintf(stderr, format, argptr);
//    va_end(argptr);
}

void systemSetTitle(const char * title) {
    // Not used
}

SoundDriver * systemSoundInit() {
    soundShutdown();
    return new EmscriptenSoundDriver();
}

void systemOnWriteDataToSoundBuffer(const u16 * finalWave, int length) {
    // This is used for recording sound, not for realtime sound.
}

void systemOnSoundShutdown() {
    // Don't need this callback, the EmscriptenSoundDriver has an identical callback.
}

void systemScreenMessage(const char * msg) {
    printf("System Screen Message: %s\n", msg);
}

void systemUpdateMotionSensor() {}

int systemGetSensorX() {
    return 0;
}

int systemGetSensorY() {
    return 0;
}

int systemGetSensorZ() {
    return 0;
}

u8 systemGetSensorDarkness() {
    return 0xE8; // Not sure why, but this is what the other frontends use...
}

void systemCartridgeRumble(bool) {}

void systemPossibleCartridgeRumble(bool) {}

void updateRumbleFrame() {}

bool systemCanChangeSoundQuality() {
    return false;
}

void systemShowSpeed(int n) {
    // Don't care about VBA's calculated speed. I can calculate it better.
}

void system10Frames(int always60) {
    // I have no idea what this is for...
}

void systemFrame() {
    // This is called when the emulator wants to submit a frame.
    EM_ASM_INT({return window["VBAInterface"]["renderFrame"]($0)}, (int) pix);
}

void systemGbBorderOn() {
    // Don't care
}

void Sm60FPS_Init() {
    // Don't know what this is
}

bool Sm60FPS_CanSkipFrame() {
    // Don't know what this is
    return false;
}

void Sm60FPS_Sleep() {
    // Don't know what this is
}

void DbgMsg(const char *msg, ...) {
    EM_ASM(debugger;);
//    va_list argptr;
//    va_start(argptr, format);
//    vfprintf(stderr, format, argptr);
//    va_end(argptr);
}


void (*dbgOutput)(const char *s, u32 addr);
void _dbgOutput(const char *s, u32 addr) {
    EM_ASM_INT({return window["VBAInterface"]["dbgOutput"]($0, $1)}, (int) s, (int) addr);
}

u16 systemColorMap16[0x10000]; // This gets filled by utilUpdateSystemColorMaps in VBA_start
u32 systemColorMap32[0x10000]; // This gets filled by utilUpdateSystemColorMaps in VBA_start
u16 systemGbPalette[24]; // This gets filled by settings

// This is to convert to RGBA5551
int systemColorDepth = 16;
int systemRedShift = 11;
int systemGreenShift = 6;
int systemBlueShift = 1;

int systemFrameSkip = 0;
int systemSaveUpdateCounter = SYSTEM_SAVE_NOT_UPDATED;

int systemVerbose = 1;

int emulating = 0;


struct EmulatedSystem emulator = {
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  0
};

ENTRY_FN VBA_start () {
    
    // Misc setup
    utilUpdateSystemColorMaps();
    agbPrintEnable(true);
    soundSetSampleRate(EM_ASM_INT({return window["VBAInterface"]["getAudioSampleRate"]()}, 0));
    dbgOutput = _dbgOutput;
    
    // Edit settings for pokemon
    mirroringEnable = 0;
    rtcEnabled = 1;
    flashSize = 0x20000;
    
    
    int size = CPULoadRomData(NULL, EM_ASM_INT({return window["VBAInterface"]["getRomSize"]()}, 0));
    int failed = (size == 0);
    if (!failed) {
        if (cpuSaveType == 0)
            utilGBAFindSave(size);
        else
            saveType = cpuSaveType;

        // Don't know what this does
        doMirroring(mirroringEnable);
        
        soundInit();
        
        emulator = GBASystem;
        
        emulator.emuReadBattery("");
        
        emulating = 1;

        CPUInit("", useBios);
        CPUReset();
    }
    
    return 1;
}

ENTRY_FN VBA_get_emulating () {
    return emulating;
}

ENTRY_FN VBA_stop () {
    CPUReset();
    CPUCleanUp();
    return 1;
}


ENTRY_FN VBA_do_cycles (int cycles) {
    emulator.emuMain(cycles);
    return 1;
}


ENTRY_FN VBA_get_bios () {
    return (int) bios;
}


ENTRY_FN VBA_get_rom () {
    return (int) rom;
}


ENTRY_FN VBA_get_internalRAM () {
    return (int) internalRAM;
}


ENTRY_FN VBA_get_workRAM () {
    return (int) workRAM;
}


ENTRY_FN VBA_get_paletteRAM () {
    return (int) paletteRAM;
}


ENTRY_FN VBA_get_vram () {
    return (int) vram;
}


ENTRY_FN VBA_get_pix () {
    return (int) pix;
}


ENTRY_FN VBA_get_oam () {
    return (int) oam;
}


ENTRY_FN VBA_get_ioMem () {
    return (int) ioMem;
}


ENTRY_FN VBA_get_systemColorMap16 () {
    return (int) systemColorMap16;
}


ENTRY_FN VBA_get_systemColorMap32 () {
    return (int) systemColorMap32;
}


ENTRY_FN VBA_get_systemFrameSkip () {
    return (int) systemFrameSkip;
}


ENTRY_FN VBA_set_systemFrameSkip (int frameSkip) {
    systemFrameSkip = frameSkip;
    return 1;
}


ENTRY_FN VBA_get_systemSaveUpdateCounter () {
    return systemSaveUpdateCounter;
}


ENTRY_FN VBA_reset_systemSaveUpdateCounter () {
    systemSaveUpdateCounter = SYSTEM_SAVE_NOT_UPDATED;
    return 1;
}

ENTRY_FN VBA_emuWriteBattery () {
    emulator.emuWriteBattery("");
    return 1;
};

ENTRY_FN VBA_agbPrintFlush() {
    agbPrintFlush();
    return 1;
};

