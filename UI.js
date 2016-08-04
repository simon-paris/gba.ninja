(function () {
    "use strict";
    
    
    function VBAUI(el) {
        this.el = el;
        
        this.initialHTML = el.innerHTML;
    }
    VBAUI.prototype = Object.create(Object.prototype);
    VBAUI.prototype.constructor = VBAUI;
    
    
    VBAUI.prototype.reset = function () {
        this.el.innerHTML = this.initialHTML;
        
        let savesEl = window.document.querySelector(".saves-list");
        let savesHTML = "";
        let saves = window.vbaSaves.listSaves();
        for (let i = 0; i < saves.length; i++) {
            savesHTML += "<li>" + saves[i].romCode + " " +
                "<a class='export-save-button' href='javascript:void 0;' data-rom-code='" + saves[i].romCode + "'>Export</a>" +
            "</li>";
        }
        savesEl.innerHTML = savesHTML;
        
    };
    
    
    
    window.VBAUI = VBAUI;
    
    
}());