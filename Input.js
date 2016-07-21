(function () {
    "use strict";
    
            
    
    function VBAInput() {
        
        
        this.downCodes = {};
        this.downKeyCodes = {};
        window.addEventListener("keydown", function (e) {
            this.downCodes[e.code] = 1;
            this.downKeyCodes[e.keyCode] = 1;
            return false;
        }.bind(this));
        window.addEventListener("keyup", function (e) {
            this.downCodes[e.code] = 0;
            this.downKeyCodes[e.keyCode] = 0;
            return false;
        }.bind(this));
        this.bindings = {}; 
        
        this.bindings.KEY_BUTTON_A = {
            codes: ["KeyZ"],
            keyCodes: [90],
        };
        this.bindings.KEY_BUTTON_B = {
            codes: ["KeyX"],
            keyCodes: [88],
        };
        this.bindings.KEY_BUTTON_SELECT = {
            codes: ["Escape", "Backspace"],
            keyCodes: [27, 8],
        };
        this.bindings.KEY_BUTTON_START = {
            codes: ["Enter"],
            keyCodes: [13],
        };
        this.bindings.KEY_RIGHT = {
            codes: ["ArrowRight"],
            keyCodes: [39],
        };
        this.bindings.KEY_LEFT = {
            codes: ["ArrowLeft"],
            keyCodes: [37],
        };
        this.bindings.KEY_UP = {
            codes: ["ArrowUp"],
            keyCodes: [38],
        };
        this.bindings.KEY_DOWN = {
            codes: ["ArrowDown"],
            keyCodes: [40],
        };
        this.bindings.KEY_BUTTON_R = {
            codes: ["Control", "ControlLeft", "ControlRight"],
            keyCodes: [17],
        };
        this.bindings.KEY_BUTTON_L = {
            codes: ["Shift", "ShiftLeft", "ShiftRight"],
            keyCodes: [16],
        };
        
        
    }
    VBAInput.prototype = Object.create(Object.prototype);
    VBAInput.prototype.constructor = VBAInput;
    
    
    VBAInput.prototype.isKeyDown = function (binding) {
        for (let i = 0; i < binding.codes.length; i++) {
            if (this.downCodes[binding.codes[i]]) {
                return true;
            }
        }
        for (let i = 0; i < binding.keyCodes.length; i++) {
            if (this.downKeyCodes[binding.keyCodes[i]]) {
                return true;
            }
        }
    };
    
    VBAInput.prototype.getJoypad = function () {
        var res = 0;

        if (this.isKeyDown(this.bindings.KEY_BUTTON_A)) {
            res |= 1;
        }
        if (this.isKeyDown(this.bindings.KEY_BUTTON_B)) {
            res |= 2;
        }
        if (this.isKeyDown(this.bindings.KEY_BUTTON_SELECT)) {
            res |= 4;
        }
        if (this.isKeyDown(this.bindings.KEY_BUTTON_START)) {
            res |= 8;
        }
        if (this.isKeyDown(this.bindings.KEY_RIGHT)) {
            res |= 16;
        }
        if (this.isKeyDown(this.bindings.KEY_LEFT)) {
            res |= 32;
        }
        if (this.isKeyDown(this.bindings.KEY_UP)) {
            res |= 64;
        }
        if (this.isKeyDown(this.bindings.KEY_DOWN)) {
            res |= 128;
        }
        if (this.isKeyDown(this.bindings.KEY_BUTTON_R)) {
            res |= 256;
        }
        if (this.isKeyDown(this.bindings.KEY_BUTTON_L)) {
            res |= 512;
        }

        // disallow L+R or U+D of being pressed at the same time
        if ((res & 48) === 48) {
            res &= ~16;
        }
        if ((res & 192) === 192) {
            res &= ~128;
        }

        return res;
    };
    
    
    
    window.VBAInput = VBAInput;
    
    
}());