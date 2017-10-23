(function () {
    "use strict";
    
    
    var saveAs = require("./saveAs").saveAs;
    
    function VBASaves(emscriptenModule) {
        this.emscriptenModule = emscriptenModule;
        
        this.safeSaveTimeout = null;
        this.unsafeSaveTimeout = null;
        this.unsafeSaveBuffer = null;
        this.localStoragePrefix = "VBAsave_";
    }
    VBASaves.prototype = Object.create(Object.prototype);
    VBASaves.prototype.constructor = VBASaves;
    
    
    VBASaves.prototype.getRomCode = function () {
        return this.emscriptenModule.Pointer_stringify(VBAInterface.VBA_get_rom() + 0xAC).substr(0, 4);
    };
    
    
    VBASaves.prototype.getSave = function (romCode) {
        // If no rom code supplied, use the currently loaded game
        romCode = romCode || this.getRomCode();
        var base64 = localStorage[this.localStoragePrefix + romCode];
        if (!base64) {
            return new Uint8Array(0);
        }
        return new Uint8Array(atob(base64).split("").map(function(c) {
            return c.charCodeAt(0);
        }));
    };

    VBASaves.prototype.getSaveSize = function () {
        return this.getSave().byteLength;
    };

    VBASaves.prototype.softCommit = function (pointer8, size) {
        var heapu8 = this.emscriptenModule.HEAPU8;
        var bufu8 = new Uint8Array(size);
        for (var i = 0; i < size; i++) {
            bufu8[i] = heapu8[pointer8 + i];
        }
        this.unsafeSaveBuffer = bufu8;
    };

    VBASaves.prototype.hardCommit = function (romCode, uint8Array) {
        var binary = "";
        var len = uint8Array.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( uint8Array[i]);
        }
        localStorage[this.localStoragePrefix + romCode] = window.btoa(binary);
    };

    VBASaves.prototype.restoreSaveMemory = function (pointer8, targetBufferSize) {
        var save = this.getSave();
        var heap8 = this.emscriptenModule.HEAPU8;

        if (save.byteLength !== targetBufferSize) {
            throw new Error("Incompatible save size");
        }

        for (var i = 0; i < targetBufferSize; i++) {
            heap8[pointer8 + i] = save[i];
        }

    };
    
    VBASaves.prototype.checkSaves = function () {
        if (VBAInterface.VBA_get_systemSaveUpdateCounter()) {

            // Copy the save to a temporary buffer if it's
            // recently updated.
            if (!this.unsafeSaveTimeout) {
                this.unsafeSaveTimeout = setTimeout(function () {
                    this.unsafeSaveTimeout = null;
                    if (VBAInterface.VBA_get_emulating()) {
                        console.log("[SAVE] changes detected");
                        VBAInterface.VBA_emuWriteBattery();
                        VBAInterface.VBA_reset_systemSaveUpdateCounter();
                    }
                }.bind(this), 32);
            }
            
        }

        // Commit the save to localstorage if it hasn't been
        // changed in a while.
        if (this.unsafeSaveBuffer) {
            var tempUnsafeSaveBuffer = this.unsafeSaveBuffer;
            this.unsafeSaveBuffer = null;
            clearTimeout(this.safeSaveTimeout);
            this.safeSaveTimeout = setTimeout(function () {
                this.safeSaveTimeout = null;
                if (VBAInterface.VBA_get_emulating()) {
                    this.hardCommit(this.getRomCode(), tempUnsafeSaveBuffer);
                    console.log("[SAVE] changes committed");
                } else {
                    console.log("[SAVE] changes discarded, emulator not running");
                }
            }.bind(this), 70);
        }
        
    };
    
    VBASaves.prototype.exportSave = function (romCode) {
        var blob = new Blob([this.getSave(romCode)], {contentType: "application/octet-stream"});
        saveAs(blob, romCode + ".sav", true);
    };
    
    VBASaves.prototype.deleteSave = function (romCode) {
        if (confirm("Are you sure you want to delete your save for " + romCode + "?")) {
            delete localStorage[this.localStoragePrefix + romCode];
        }
    };
    
    VBASaves.prototype.onFileImportInputChanged = function (e, callback) {
        var binaryFile = e.currentTarget.files[0];
        var fr = new FileReader();
        if (FileReader && binaryFile) {
            fr.readAsArrayBuffer(binaryFile);
            fr.onload = function () {
				var romCodeValidator = /^[A-Z]{4}$/;
                var romCode = binaryFile.name.substr(0, 4);
                if (romCode.search(romCodeValidator) === -1) {
                    romCode = window.prompt("What is the ROM code of the game that this save file belongs to? (4 uppercase letters)");
					if (!romCode) return;
                }
                if (romCode.search(romCodeValidator) === -1) {
                    alert("Invalid ROM code.");
                } else {
                    this.importSave(romCode, new Uint8Array(fr.result));
                    callback();
                }
            }.bind(this);
        }
    };
    
    
    VBASaves.prototype.listSaves = function () {
        return Object.keys(localStorage).filter(function (v) {
            return v.indexOf(this.localStoragePrefix) === 0;
        }.bind(this)).map(function (v) {
            return {
                romCode: v.substr(this.localStoragePrefix.length, 4),
            };
        }.bind(this));
    };
    
    VBASaves.prototype.importSave = function (romCode, byteArray) {
        this.hardCommit(romCode, byteArray);
    };
    
    
    module.exports = VBASaves;
    
    
}());









