# gba.ninja

This is an emscripten port of https://github.com/visualboyadvance-m/visualboyadvance-m. It's using custom bindings to get pixel/audio/input/savegame data into & out of the emulator. (as opposed to using emstripten's built in file system and sdl support).

Eventually, it should work on all browsers that support WebGL. Currently, it also requires localStorage
(so Safari private browsing won't work).

# Build

1. Install nodejs and emscripten (from http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html).
2. `npm install`.
3. Run `node build --opt` (the `--opt` is production mode) with the emscripten sdk enabled.
4. Run `webpack` with the emscripten sdk NOT enabled.
5. Open `build/index.html`.

**(Note that emscripten is bundled with and requires a version of node that is older than the minimum required version to run webpack. The easiest way to deal with this is to have one terminal for emscripten, and another for webpack)**

## TODOs
 * Fix frame drop problems
 * Fix bug where audio stops if headphones are unplugged
 * Google Drive sync for save games
 * Touch controls
 * Enable frameskip on slow devices
 * Ability to load BIOS
 * UI for loading ROMs from URLs
 * Support for roms in zip files
 * Cache roms in HTML5 FS
 * Mute button (should disable audio emulation)


## VBA-M Licence
VisualBoyAdvance - Nintendo Gameboy/GameboyAdvance (TM) emulator.
Copyright (C) 1999-2017 VBA & VBA-M Contributors 

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2, or(at your option)
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software Foundation,
Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


