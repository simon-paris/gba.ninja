(function () {
    "use strict";
    
    
    function VBAUI(el) {
        this.el = el;
        
        this.currentlyBinding = false;
        this.initialHTML = el.innerHTML;
        
        this.el.addEventListener("keydown", this.onKeyDown.bind(this));
        
    }
    VBAUI.prototype = Object.create(Object.prototype);
    VBAUI.prototype.constructor = VBAUI;
    
    
    VBAUI.prototype.reset = function () {
        this.el.innerHTML = this.initialHTML;
        this.currentlyBinding = false;
        
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
        if (!saves.length) {
            savesHTML += "&nbsp;None";
        }
        savesHTML += "</table>";
        savesEl.innerHTML = savesHTML;
        
        let keyboardBindingsEl = window.document.querySelector(".keyboard-bindings");
        let keyboardBindingsHTML = "<table>";
        let keyboardBindings = window.vbaInput.listBindings();
        for (let i = 0; i < keyboardBindings.length; i++) {
            keyboardBindingsHTML += "<tr>" +
                "<td>" + keyboardBindings[i].friendlyName + "</td>" +
                "<td>" + keyboardBindings[i].codes.join(", ").replace(/Key/im, "Key ").replace(/Arrow/im, "Arrow ") + "</td>" +
                "<td><a class='rebind-key-button' onclick='vbaUI.startRebinding(this, \"" + keyboardBindings[i].name + "\")' href='javascript:void 0;'>Rebind</a></td>" +
            "</tr>";
        }
        keyboardBindingsHTML += "</table>";
        keyboardBindingsEl.innerHTML = keyboardBindingsHTML;
        
    };
    
    VBAUI.prototype.export = function (e) {
        vbaSaves.exportSave();
    };
    
    
    VBAUI.prototype.onKeyDown = function (e) {
        if (this.currentlyBinding) {
            vbaInput.setBinding(this.currentlyBinding, e.code, e.keyCode);
            this.reset();
        }
    };
    
    
    VBAUI.prototype.startRebinding = function (el, name) {
        this.currentlyBinding = name;
        el.innerText = "Rebinding...";
    };
    
    VBAUI.prototype.resetBindings = function () {
        vbaInput.resetBindings();
        this.reset();
    };
    
    
    module.exports = VBAUI;
    
    
}());