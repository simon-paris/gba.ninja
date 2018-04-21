(function () {
    "use strict";
    
    
    function VBAUI(el) {
        this.el = el;
        
        this.currentlyBinding = false;
        this.initialHTML = el.innerHTML;
        
        this.el.addEventListener("keydown", this.onKeyDown.bind(this));
        
        this.paused = false;
    }
    VBAUI.prototype = Object.create(Object.prototype);
    VBAUI.prototype.constructor = VBAUI;
    

    VBAUI.prototype.setPausedState = function (paused) {
        this.paused = paused;
        this.el.querySelector(".load-rom-section").style.display = paused ? "none" : "";
        this.el.querySelector(".paused-section").style.display = paused ? "" : "none";
    };

    
    VBAUI.prototype.reset = function () {
        this.el.innerHTML = this.initialHTML;
        this.currentlyBinding = false;
        
        var i;
        var savesEl = this.el.querySelector(".saves-list");
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
        if (window.isShittyLocalstorage) {
            savesHTML += "<tr><td><strong>Saving will not be possible because the 'LocalStorage'<br/>feature of your browser is disabled.</strong></td></tr>";
        }
        savesHTML += "</table>";
        savesEl.innerHTML = savesHTML;
        
        var keyboardBindingsEl = this.el.querySelector(".keyboard-bindings");
        var keyboardBindingsHTML = "<table>";
        var keyboardBindings = window.vbaInput.listBindings();

        function codesToName (codes) {
            return codes.join(", ")
                .replace(/Key/im, "Key ").replace(/Arrow/im, "Arrow ")
                .replace(/Digit/im, "Digit ").replace(/Numpad/im, "Numpad ")
                .replace(/Left/im, " Left").replace(/Right/im, " Right");
        }

        for (i = 0; i < keyboardBindings.length; i++) {

            keyboardBindingsHTML += "<tr>" +
                "<td>" + keyboardBindings[i].friendlyName + "</td>" +
                "<td>" + codesToName(keyboardBindings[i].codes) + "</td>" +
                "<td><a class='rebind-key-button' onclick='vbaUI.startRebinding(this, \"" + keyboardBindings[i].name + "\")' href='javascript:void 0;'>Rebind</a></td>" +
            "</tr>";

            if (keyboardBindings[i].name === "PAUSE") {
                this.el.querySelector(".unpause-key-prompt").innerText = codesToName(keyboardBindings[i].codes);
            }

        }
        keyboardBindingsHTML += "</table>";
        keyboardBindingsEl.innerHTML = keyboardBindingsHTML;
        
        this.setPausedState(this.paused);
    };
    
    VBAUI.prototype.export = function () {
        vbaSaves.exportSave();
    };
    
    
    VBAUI.prototype.onKeyDown = function (e) {
        if (this.currentlyBinding) {
            var prev = vbaInput.bindings[this.currentlyBinding].codes.join();
            vbaInput.setBinding(this.currentlyBinding, e.code, e.keyCode);
            var current = vbaInput.bindings[this.currentlyBinding].codes.join();
            
            gtag("event", "rebind_key_1", {
                event_label: "Change " + this.currentlyBinding + " from " + prev + " to " + current,
            });

            this.reset();
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
        
        gtag("event", "reset_bindings_1", {});

        vbaInput.resetBindings();
        this.reset();
    };
    
    VBAUI.prototype.exportSave = function (romCode) {
        vbaSaves.exportSave(romCode);
        this.reset();

        gtag("event", "export_save_1", {
            event_label: romCode + " " + require("./romCodeToEnglish")(romCode),
        });

    };
    
    VBAUI.prototype.deleteSave = function (romCode) {

        var modalOpts = modal("Are you sure you want to delete your save for [" + romCode + "] " + require("./romCodeToEnglish")(romCode) + "?", {
            title: "Confirm Deletion",
            leftButtonText: "Delete",
            leftButtonFn: function () {
                
                vbaSaves.deleteSave(romCode);
                this.reset();
                gtag("event", "delete_save_1", {
                    event_label: romCode + " " + require("./romCodeToEnglish")(romCode),
                });

            }.bind(this),
            rightButtonText: "Cancel",
            rightButtonFn: function () {
                modalOpts.hideModal();
            },
        });
        
    };
    
    module.exports = VBAUI;
    
    
}());