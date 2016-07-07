(function () {
    "use strict";
    
    
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
        return this.emscriptenModule.Pointer_stringify(window.VBA_get_rom() + 0xAC).substr(0, 4);
    };
    
    
    VBASaves.prototype.getSave = function (romCode) {
        // If no rom code supplied, use the currently loaded game
        romCode = romCode || this.getRomCode();
        let base64 = localStorage[this.localStoragePrefix + romCode];
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
        let heapu8 = this.emscriptenModule.HEAPU8;
        let bufu8 = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            bufu8[i] = heapu8[pointer8 + i];
        }
        this.unsafeSaveBuffer = bufu8;
    };

    VBASaves.prototype.hardCommit = function (romCode, byteArray) {
        let base64 = btoa(String.fromCharCode.apply(null, byteArray));
        localStorage[this.localStoragePrefix + romCode] = base64;
    };

    VBASaves.prototype.restoreSaveMemory = function (pointer8, targetBufferSize) {
        let save = this.getSave();
        let heap8 = this.emscriptenModule.HEAPU8;

        if (save.byteLength !== targetBufferSize) {
            throw new Error("Incompatible save size");
        }

        for (let i = 0; i < targetBufferSize; i++) {
            heap8[pointer8 + i] = save[i];
        }

    };
    
    VBASaves.prototype.checkSaves = function () {
        if (window.VBA_get_systemSaveUpdateCounter()) {

            // Copy the save to a temporary buffer if it's
            // recently updated.
            if (!this.unsafeSaveTimeout) {
                this.unsafeSaveTimeout = setTimeout(function () {
                    this.unsafeSaveTimeout = null;
                    if (this.VBA_get_emulating()) {
                        console.log("writing battery file");
                        this.VBA_emuWriteBattery();
                        this.VBA_reset_systemSaveUpdateCounter();
                    }
                }, 32);
            }

            // Commit the save to localstorage if it hasn't been
            // changed in a while.
            clearTimeout(this.safeSaveTimeout);
            this.safeSaveTimeout = null;
            if (this.unsafeSaveBuffer) {
                this.safeSaveTimeout = setTimeout(function () {
                    if (this.VBA_get_emulating()) {
                        this.hardCommit(this.getRomCode(), this.unsafeSaveBuffer);
                        this.unsafeSaveBuffer = null;
                    }
                }, 70);
            }

        }
    };
    
    VBASaves.prototype.exportSave = function (romCode) {
        var blob = new Blob([this.getSave(romCode)], {contentType: "application/octet-stream"});
        window.saveAs(blob, "GBA Save " + romCode + ".sav", true);
    };
    
    
    VBASaves.prototype.onFileImportInputChanged = function (e) {
        let binaryFile = e.currentTarget.files[0];
        var fr = new FileReader();
        if (FileReader && binaryFile) {
            fr.readAsArrayBuffer(binaryFile);
            fr.onload = function () {
                let romCode = "????";
                this.importSave(romCode, fr.result);
            };
        }
    };
    
    
    VBASaves.prototype.importSave = function (romCode, byteArray) {
        this.hardCommit(romCode, byteArray);
    };
    
    
    window.VBASaves = VBASaves;
    
    
}());