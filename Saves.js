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
    
    
    VBASaves.prototype.getSave = function () {
        let base64 = localStorage[this.localStoragePrefix + this.getRomCode()];
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
                        let base64 = btoa(String.fromCharCode.apply(null, this.unsafeSaveBuffer));
                        localStorage[this.localStoragePrefix + this.getRomCode()] = base64;
                        this.unsafeSaveBuffer = null;
                    }
                }, 70);
            }

        }
    };
    
    
    window.VBASaves = VBASaves;
    
    
}());