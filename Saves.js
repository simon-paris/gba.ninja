(function () {
    "use strict";
    
    var MODE_LOCAL = "local";
    var MODE_DRIVE = "drive";
    
    var saveAs = require("./saveAs").saveAs;
    
    function VBASaves(emscriptenModule) {
        this.emscriptenModule = emscriptenModule;
        
        this.mode = MODE_LOCAL;
        
        this.safeSaveTimeout = null;
        this.unsafeSaveTimeout = null;
        this.unsafeSaveBuffer = null;
        this.localStoragePrefix = "VBAsave_";
        this.lastWarningTime = 0;

    }
    VBASaves.prototype = Object.create(Object.prototype);
    VBASaves.prototype.constructor = VBASaves;
    
    
    VBASaves.prototype.getRomCode = function () {
        var heapu8 = this.emscriptenModule.HEAPU8;
        var romAddress8 = VBAInterface.VBA_get_rom();
        var romCode = String.fromCharCode(
            heapu8[romAddress8 + 0xAC], heapu8[romAddress8 + 0xAD],
            heapu8[romAddress8 + 0xAE], heapu8[romAddress8 + 0xAF]
        ).replace(/[^ -~]/g, function () { return "?"; });
        return romCode;
    };
    
    
    VBASaves.prototype.getSave = function (romCode) {
        // If no rom code supplied, use the currently loaded game
        romCode = romCode || this.getRomCode();
        var base64 = localStorage[this.localStoragePrefix + romCode];
        if (!base64) {
            return null;
        }
        return new Uint8Array(atob(base64).split("").map(function(c) {
            return c.charCodeAt(0);
        }));
    };

    VBASaves.prototype.getSaveSize = function () {
        var save = this.getSave();
        return save ? save.byteLength : 0;
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
        try {
            localStorage[this.localStoragePrefix + romCode] = window.btoa(binary);
        } catch (e) {
            if (window.isShittyLocalstorage) {
                return; // User is already warned.
            }
            if (this.lastWarningTime < Date.now() - 5000) {
                this.lastWarningTime = Date.now();
                modal("Unable to save because the storage quota is exceeded. Try opening a new gba.ninja tab and deleting some saves, then save again.", {title: "Error"});
            }
        }
    };

    VBASaves.prototype.restoreSaveMemory = function (pointer8, targetBufferSize) {
        var save = this.getSave();
        if (!save) {
            return;
        }
        
        if (save.byteLength !== targetBufferSize) {
            throw new Error("Incompatible save size");
        }
        
        var heap8 = this.emscriptenModule.HEAPU8;
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
        var save = this.getSave(romCode);
        if (!save) {
            throw new Error("No save found for " + romCode);
        }
        var blob = new Blob([save], {contentType: "application/octet-stream"});
        saveAs(blob, romCode + " " + require("./romCodeToEnglish")(romCode) + ".sav", true);
    };
    
    VBASaves.prototype.deleteSave = function (romCode) {
        delete localStorage[this.localStoragePrefix + romCode];
    };
    
    VBASaves.prototype.onFileImportInputChanged = function (e, callback) {

        var binaryFile = e.currentTarget.files[0];
        e.currentTarget.form.reset();
        
        if (binaryFile) {
            var fr = new FileReader();
            fr.readAsArrayBuffer(binaryFile);
            fr.onload = function () {

				var romCodeValidator = /^[A-Z1-9]{4}/;
                var romCode = binaryFile.name.substr(0, 4);

                var romCodeOk = function () {
                    this.importSave(romCode, new Uint8Array(fr.result));
                    callback();
                }.bind(this);
                var romCodeNotOk = function () {
                    return window.modal("Invalid ROM Code", {title: "Error"});
                }.bind(this);

                if (romCode.search(romCodeValidator) === -1) {
                    var modalOpts = window.modal("What is the ROM code of the game that this save file belongs to? (4 uppercase letters or numbers)", {
                        title: "Enter ROM Code",
                        input: "",
                        leftButtonText: "Submit",
                        leftButtonFn: function () {
                            romCode = modalOpts.getInputValue();
                            modalOpts.hideModal();
                            if (romCode.search(romCodeValidator) === -1) {
                                romCodeNotOk();
                                return false;
                            } else {
                                romCodeOk();
                            }
                        },
                        rightButtonText: "Cancel",
                        rightButtonFn: function () {
                            modalOpts.hideModal();
                        },
                    });
                } else {
                    romCodeOk();
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









