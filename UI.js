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
        let savesHTML = "<table>";
        let saves = window.vbaSaves.listSaves();
        for (let i = 0; i < saves.length; i++) {
            savesHTML += "<tr>" +
                "<td>" + saves[i].romCode + "</td>" +
                "<td><a class='export-save-button' onclick='vbaSaves.exportSave(\"" + saves[i].romCode + "\")' href='javascript:void 0;' data-rom-code='" + saves[i].romCode + "'>Export</a></td>" +
                "<td><a class='delete-save-button' onclick='vbaSaves.deleteSave(\"" + saves[i].romCode + "\")' href='javascript:void 0;' data-rom-code='" + saves[i].romCode + "'>Delete</a></td>" +
            "</tr>";
        }
        savesEl.innerHTML = savesHTML;
        
    };
    
    VBAUI.prototype.export = function (e) {
        vbaSaves.exportSave();
    };
    
    
    module.exports = VBAUI;
    
    
}());