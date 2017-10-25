
let xml = require("xml2js");

module.exports = function (code) {

    let callback = this.async();
    xml.parseString(code, (err, res) => {
        if (err) {
            return callback(err);
        }
        let out = {};
        res.games.game.forEach((game) => {
            if (game.title[0].search(/^[-a-z0-9 &!\.',+$]+$/i) === -1) {
                this.emitWarning(game.title[0] + " contains non-allowed characters");
            }
            let name = game.title[0];

            // These are case sensitive
            if (name.search(/, The(?: |$)/) !== -1) {
                name = "The " + name.replace(", The", "");
            }
            if (name.search(/, Die(?: |$)/) !== -1) {
                name = "Die " + name.replace(", Die", "");
            }
            if (name.search(/, Les(?: |$)/) !== -1) {
                name = "Les " + name.replace(", Les", "");
            }
            if (name.search(/, La(?: |$)/) !== -1) {
                name = "La " + name.replace(", La", "");
            }
            if (name === "Fantastici 4, I") {
                name = "I Fantastici 4";
            }

            let options = game.cartridge[0] || {};
            for (let prop in options) {
                if (options.hasOwnProperty(prop)) {
                    if (Array.isArray(options[prop]) && options[prop].length === 1 && options[prop][0] === "") {
                        options[prop] = true;
                    } else if (options[prop].length === 1 && options[prop][0].$) {
                        options[prop] = options[prop][0].$;
                    } else {
                        this.emitWarning("unexpected structure on " + name);
                    }
                }
            }

            out[game.$.code] = [name, options];
        });
        callback(null, "module.exports = " + JSON.stringify(out));
    });

};
