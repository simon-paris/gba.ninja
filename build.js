(function () {
    "use strict";
    
    
    var files = [
        // Real Entry Point
        "./src/emscripten/VBA.cpp",
        
        // Driver classes
        "./src/emscripten/EmscriptenSoundDriver.cpp",
        
        // Util
        "./src/Util.cpp",
        
        // Settings File
        "./src/common/ConfigManager.cpp",
        
        // APU files
        "./src/apu/Blip_Buffer.cpp",
        "./src/apu/Effects_Buffer.cpp",
        "./src/apu/Gb_Apu.cpp",
        "./src/apu/Gb_Apu_State.cpp",
        "./src/apu/Gb_Oscs.cpp",
        "./src/apu/Multi_Buffer.cpp",
        
        // GBA Files
        "./src/gba/bios.cpp",
        "./src/gba/EEprom.cpp",
        "./src/gba/Flash.cpp",
        "./src/gba/GBA.cpp",
        "./src/gba/GBA-arm.cpp",
        "./src/gba/GBA-thumb.cpp",
        "./src/gba/GBAGfx.cpp",
        "./src/gba/GBALink.cpp",
        "./src/gba/GBASockClient.cpp",
        "./src/gba/Globals.cpp",
        "./src/gba/Mode0.cpp",
        "./src/gba/Mode1.cpp",
        "./src/gba/Mode2.cpp",
        "./src/gba/Mode3.cpp",
        "./src/gba/Mode4.cpp",
        "./src/gba/Mode5.cpp",
        "./src/gba/RTC.cpp",
        "./src/gba/Sound.cpp",
        "./src/gba/Sram.cpp",
        "./src/gba/ereader.cpp",
        "./src/gba/agbprint.cpp",
        
    ];
    
    var opt = require("yargs").argv.opt;
    
    var MB = Math.pow(2, 20);

    var options = [
        "--memory-init-file 0",
        "-Werror",
        opt ? "--closure 1" : "",
        opt ? "-O3" : "-g3",
        "-DC_CORE",
        "-DNO_PNG",
        "-DNO_LINK",
        "-DNO_DEBUGGER",
        "-DFINAL_BUILD",
        "-DFINAL_VERSION",
		"-s MODULARIZE=1",
		"-s EXPORT_NAME=\"'gbaninja'\"",
        opt ? "" : "-s ASSERTIONS=2",
        "-s NO_FILESYSTEM=1",
        "-s NO_EXIT_RUNTIME=1",
	"-s EXTRA_EXPORTED_RUNTIME_METHODS=['ccall']",
        "-s TOTAL_MEMORY=" + (80 * MB),
    ].filter(function (v) {return v;}).join(" ");
    
    function fix (file) {
        let str = require("fs").readFileSync(file).toString()
                    .replace(/require\("fs"\)/g, "(function () { throw new Error('cant use fs in browser')}())");
        require("fs").writeFileSync(file, str);
    }

    require("child_process").execSync(`emcc ${options} ${files.join(" ")} -o ./emu.js`);
    fix("./emu.js");
    require("child_process").execSync(`emcc ${options} ${files.join(" ")} -s WASM=1 -o ./emu-wasm.js`);
    fix("./emu-wasm.js");
    
}());

