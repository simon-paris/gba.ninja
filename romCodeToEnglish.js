(function () {
    "use strict";
        
    module.exports = function romCodeToEnglish (romCode) {
        return ({
            AA2E: "Super Mario Advance 2",
            BPRE: "Pokemon Fire Red",
            BPGE: "Pokemon Leaf Green",
            AXVE: "Pokemon Ruby",
            AXPE: "Pokemon Sapphire",
            BPEE: "Pokemon Emerald",
            AE7E: "Fire Emblem",
            ASOE: "Sonic Advance",
            ASOP: "Sonic Advance",
            A7KE: "Kirby - Nightmare in Dream Land",
            A7KP: "Kirby - Nightmare in Dream Land",
            AX4E: "Super Mario Advance 4",
            BMVP: "Super Mario Ball",
            BM5P: "Mario vs. Donkey Kong",
            BMGD: "Mario Golf",
            A88E: "Mario &amp; Luigi - Superstar Saga",
            ALFP: "Dragon Ball Z - The Legacy of Goku II",
            ALFE: "Dragon Ball Z - The Legacy of Goku II",
            BG3E: "Dragon Ball Z - Buu's Fury",
            BGTE: "Grand Theft Auto Advance",
            BL7E: "LEGO Star Wars II",
            BMXE: "Metroid - Zero Mission",
        }[romCode]) || "Unknown Game";
    }

}());
