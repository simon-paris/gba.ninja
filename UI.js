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
        
        var i;
        var savesEl = window.document.querySelector(".saves-list");
        var savesHTML = "<table>";
        var saves = window.vbaSaves.listSaves();
        for (i = 0; i < saves.length; i++) {
            savesHTML += "<tr>" +
                "<td>[" + saves[i].romCode + "] " + require("./romCodeToEnglish")(saves[i].romCode) + "</td>" +
                "<td><a class='export-save-button' onclick='vbaUI.exportSave(\"" + saves[i].romCode + "\")' href='javascript:void 0;' data-rom-code='" + saves[i].romCode + "'>Export</a></td>" +
                "<td><a class='delete-save-button' onclick='vbaUI.deleteSave(\"" + saves[i].romCode + "\")' href='javascript:void 0;' data-rom-code='" + saves[i].romCode + "'>Delete</a></td>" +
            "</tr>";
        }
        if (!saves.length) {
            savesHTML += "<tr><td>None</td></tr>";
        }
        savesHTML += "</table>";
        savesEl.innerHTML = savesHTML;
        
        var keyboardBindingsEl = window.document.querySelector(".keyboard-bindings");
        var keyboardBindingsHTML = "<table>";
        var keyboardBindings = window.vbaInput.listBindings();
        for (i = 0; i < keyboardBindings.length; i++) {
            keyboardBindingsHTML += "<tr>" +
                "<td>" + keyboardBindings[i].friendlyName + "</td>" +
                "<td>" + keyboardBindings[i].codes.join(", ")
                    .replace(/Key/im, "Key ").replace(/Arrow/im, "Arrow ")
                    .replace(/Digit/im, "Digit ").replace(/Numpad/im, "Numpad ")
                    .replace(/Left/im, " Left").replace(/Right/im, " Right")
                     + "</td>" +
                "<td><a class='rebind-key-button' onclick='vbaUI.startRebinding(this, \"" + keyboardBindings[i].name + "\")' href='javascript:void 0;'>Rebind</a></td>" +
            "</tr>";
        }
        keyboardBindingsHTML += "</table>";
        keyboardBindingsEl.innerHTML = keyboardBindingsHTML;
        
    };
    
    VBAUI.prototype.export = function () {
        vbaSaves.exportSave();
    };
    
    
    VBAUI.prototype.onKeyDown = function (e) {
        if (this.currentlyBinding) {
            var prev = vbaInput.bindings[this.currentlyBinding];
            vbaInput.setBinding(this.currentlyBinding, e.code, e.keyCode);
            var current = vbaInput.bindings[this.currentlyBinding];
            this.reset();
            
            gtag("event", "rebind_key", {
                event_label: "Change " + this.currentlyBinding + " from " + prev.codes.join() + " to " + current.codes.join(),
            });
        }
    };
    
    
    VBAUI.prototype.startRebinding = function (el, name) {
        this.currentlyBinding = name;
        this.el.querySelectorAll(".rebind-key-button").forEach(function (el) {
            el.innerText = "Rebind";
        });
        el.innerText = "Rebinding...";
    };
    
    VBAUI.prototype.resetBindings = function () {
        vbaInput.resetBindings();
        this.reset();
    };
    
    VBAUI.prototype.exportSave = function () {
        vbaSaves.exportSave.apply(vbaSaves, arguments);
        this.reset();
    };
    
    VBAUI.prototype.deleteSave = function () {
        vbaSaves.deleteSave.apply(vbaSaves, arguments);
        this.reset();
    };
    
    module.exports = VBAUI;
    
    
}());