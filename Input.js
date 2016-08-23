(function () {
    "use strict";
    
    let defaultBindings = {}; 

    defaultBindings.KEY_BUTTON_A = {
        friendlyName: "A",
        codes: ["KeyZ"],
        keyCodes: [90],
    };
    defaultBindings.KEY_BUTTON_B = {
        friendlyName: "B",
        codes: ["KeyX"],
        keyCodes: [88],
    };
    defaultBindings.KEY_BUTTON_SELECT = {
        friendlyName: "Select",
        codes: ["Backspace"],
        keyCodes: [27, 8],
    };
    defaultBindings.KEY_BUTTON_START = {
        friendlyName: "Start",
        codes: ["Enter"],
        keyCodes: [13],
    };
    defaultBindings.KEY_RIGHT = {
        friendlyName: "Right",
        codes: ["ArrowRight"],
        keyCodes: [39],
    };
    defaultBindings.KEY_LEFT = {
        friendlyName: "Left",
        codes: ["ArrowLeft"],
        keyCodes: [37],
    };
    defaultBindings.KEY_UP = {
        friendlyName: "Up",
        codes: ["ArrowUp"],
        keyCodes: [38],
    };
    defaultBindings.KEY_DOWN = {
        friendlyName: "Down",
        codes: ["ArrowDown"],
        keyCodes: [40],
    };
    defaultBindings.KEY_BUTTON_R = {
        friendlyName: "R",
        codes: ["Control"],
        keyCodes: [17],
    };
    defaultBindings.KEY_BUTTON_L = {
        friendlyName: "L",
        codes: ["Shift"],
        keyCodes: [16],
    };
        
    
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
        
        this.bindings = null;
        this.loadBindings();
        if (this.bindings === null) {
            this.resetBindings();
        }
        
    }
    VBAInput.prototype = Object.create(Object.prototype);
    VBAInput.prototype.constructor = VBAInput;
    
    
    VBAInput.prototype.listBindings = function () {
        return Object.keys(this.bindings).map(function (v) {
            return {
                name: v,
                friendlyName: this.bindings[v].friendlyName,
                codes: this.bindings[v].codes,
            };
        }.bind(this));
    };
    
    
    VBAInput.prototype.setBinding = function (name, code, keyCode) {
        this.bindings[name].codes = [code];
        this.bindings[name].keyCodes = [keyCode];
        this.saveBindings();
    };
    
    VBAInput.prototype.loadBindings = function () {
        this.bindings = JSON.parse(localStorage["VBABindings"] || "null");
    };
    
    VBAInput.prototype.saveBindings = function () {
        localStorage["VBABindings"] = JSON.stringify(this.bindings); 
    };
    
    VBAInput.prototype.resetBindings = function () {
        this.bindings = defaultBindings;
        // Lazy clone bindings object
        this.saveBindings();
        this.loadBindings();
    };
    
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
            res &= ~48;
        }
        if ((res & 192) === 192) {
            res &= ~192;
        }

        return res;
    };
    
    
    
    module.exports = VBAInput;
    
    
}());