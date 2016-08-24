# gba.ninja

This is an emscripten port of https://github.com/visualboyadvance-m/visualboyadvance-m. It's using custom bindings to get pixel/audio/input/savegame data into & out of the emulator. (as opposed to using emstripten's built in file system and sdl support).

Eventually, it should work on all browsers that support WebGL. Currently, it also requires HTML5 Audio
and localStorage (so IE11 and Safari private won't work). Input doesn't work on IE currently.

# Build

Install nodejs and emscripten. Ensure that `node` and `emcc` are on your path.

Run `node build`. Open `index.html`.

## TODOs
 * Fix input on IE
 * Keep aspect ratio
 * Touch controls
 * Loading screen
 * Enable frameskip on slow devices
 * Ability to load BIOS
 * Load ROM from URL
 * Support for roms in zip files
 * Cache roms in HTML5 FS
 * Investigate busy loop elimination
 * Mute button (should disable audio emulation)

## Licence
VisualBoyAdvance - Nintendo Gameboy/GameboyAdvance (TM) emulator.
Copyright (C) 1999-2016 VBA & VBA-M Contributors 

Javascript Port
Copyright (C) 2016 Simon Paris

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


