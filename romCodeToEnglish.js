(function () {
    "use strict";
    
    var data = require("!!./gameDbLoader.js!./gameDb.xml");

    module.exports = function romCodeToEnglish (romCode) {
        if (!data[romCode]) {
            return "Unknown Game";
        }
        return escapeHtml(data[romCode][0]);
    }

}());
