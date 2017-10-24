(function () {
    "use strict";
    
    let data = require("!!./gameDbLoader.js!./gameDb.xml");

    module.exports = function romCodeToEnglish (romCode) {
        if (!data[romCode]) {
            return "Unknown Game";
        }
        return escapeHtml(data[romCode][0]);
    }

}());
