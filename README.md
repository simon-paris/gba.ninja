# gba.ninja

This is an emscripten port of https://github.com/visualboyadvance-m/visualboyadvance-m. It's using custom bindings to get pixel/audio/input/savegame data into & out of the emulator. (as opposed to using emstripten's built in file system and sdl support).

Eventually, it should work on all browsers that support WebGL. Currently, it also requires localStorage
(so Safari private browsing won't work).

# Build

1. `npm install`.
2. **in a separate terminal window:**
    * download Emscripten from https://github.com/emscripten-core/emsdk. (Download as zip)
    * in emscripten, `emsdk install latest && emsdk activate`
    * (confirmed working in emsdk commit 0490c5f with sdk-1.37.1-64bit installed)
    * Run `node build --opt` (the `--opt` is production mode). This takes a while.
4. Run `npm run webpack`. 
5. Open `build/index.html`.

**(the separate terminal window is because emscripten comes bundled with a really old version of node)**

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
Copyright (C) 1999-2018 VBA & VBA-M Contributors 

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


