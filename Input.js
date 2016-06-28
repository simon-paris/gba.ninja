(function () {
    "use strict";
    
            
    
    function VBAInput() {
        
        
        this.downKeys = {};
        window.addEventListener("keydown", function (e) {
            this.downKeys[e.code] = 1;
        }.bind(this));
        window.addEventListener("keyup", function (e) {
            this.downKeys[e.code] = 0;
        }.bind(this));
        
        
        this.bindings = {};
        this.bindings.KEY_BUTTON_A = "KeyZ";
        this.bindings.KEY_BUTTON_B = "KeyX";
        this.bindings.KEY_BUTTON_SELECT = "Escape";
        this.bindings.KEY_BUTTON_START = "Enter";
        this.bindings.KEY_RIGHT = "ArrowRight";
        this.bindings.KEY_LEFT = "ArrowLeft";
        this.bindings.KEY_UP = "ArrowUp";
        this.bindings.KEY_DOWN = "ArrowDown";
        this.bindings.KEY_BUTTON_R = "Control";
        this.bindings.KEY_BUTTON_L = "Shift";
        
        
    }
    VBAInput.prototype = Object.create(Object.prototype);
    VBAInput.prototype.constructor = VBAInput;
    
    
    /* jshint maxcomplexity:100 */
    VBAInput.prototype.getJoypad = function () {
        var res = 0;

        if (this.downKeys[this.bindings.KEY_BUTTON_A]) {
            res |= 1;
        }
        if (this.downKeys[this.bindings.KEY_BUTTON_B]) {
            res |= 2;
        }
        if (this.downKeys[this.bindings.KEY_BUTTON_SELECT]) {
            res |= 4;
        }
        if (this.downKeys[this.bindings.KEY_BUTTON_START]) {
            res |= 8;
        }
        if (this.downKeys[this.bindings.KEY_RIGHT]) {
            res |= 16;
        }
        if (this.downKeys[this.bindings.KEY_LEFT]) {
            res |= 32;
        }
        if (this.downKeys[this.bindings.KEY_UP]) {
            res |= 64;
        }
        if (this.downKeys[this.bindings.KEY_DOWN]) {
            res |= 128;
        }
        if (this.downKeys[this.bindings.KEY_BUTTON_R]) {
            res |= 256;
        }
        if (this.downKeys[this.bindings.KEY_BUTTON_L]) {
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