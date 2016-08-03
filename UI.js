(function () {
    "use strict";
    
    
    function VBAUI(el) {
        this.el = el;
    }
    VBAUI.prototype = Object.create(Object.prototype);
    VBAUI.prototype.constructor = VBAUI;
    
    
    VBAUI.prototype.reset = function () {
    };
    
    
    
    window.VBAUI = VBAUI;
    
    
}());