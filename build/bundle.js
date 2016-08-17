/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	let VBAGraphics = __webpack_require__(1);
	let VBASound = __webpack_require__(2);
	let VBASaves = __webpack_require__(3);
	let VBAInput = __webpack_require__(4);
	let VBAUI = __webpack_require__(5);

	window.init = function () {

	    document.querySelector(".pixels").innerHTML = '<canvas width="240" height="160"></canvas>';

	    window.vbaGraphics = new VBAGraphics(window.Module, document.querySelector("canvas"));
	    window.vbaGraphics.initScreen();
	    window.vbaGraphics.drawFrame();

	    window.vbaSound = new VBASound(window.Module);
	    window.vbaSaves = new VBASaves(window.Module);
	    window.vbaInput = new VBAInput(window.Module);
	    window.vbaUI = new VBAUI(document.querySelector(".ui"));

	    document.querySelector(".pixels").style.display = "none";
	    document.querySelector(".ui").style.display = "block";

	    vbaUI.reset();

	};


	window.start = function () {
	    if (window.isRunning) {
	        throw new Error("Already started");
	    }

	    document.querySelector(".pixels").style.display = "block";
	    document.querySelector(".ui").style.display = "none";

	    var onResize = window.vbaGraphics.onResize.bind(window.vbaGraphics, window.innerWidth, window.innerHeight);
	    window.onresize = onResize;
	    onResize();

	    VBAInterface.VBA_start();

	    var GBA_CYCLES_PER_SECOND = 16777216;
	    window.isRunning = true;
	    let lastFrameTime = Date.now();
	    function eachFrame () {
	        let currentTime = Date.now();
	        let deltaTime = currentTime - lastFrameTime;
	        lastFrameTime = currentTime;

	        if (isRunning) {
	            vbaSaves.checkSaves();

	            // Use the number of sound samples to determine if the emulation is running too fast
	            if (vbaSound.getNumExtraSamples() < 10000) {
	                var cycles = Math.min(
	                    GBA_CYCLES_PER_SECOND / 60,
	                    Math.floor(GBA_CYCLES_PER_SECOND / (1000 / deltaTime))
	                );
	                VBAInterface.VBA_do_cycles(cycles);
	                requestAnimationFrame(eachFrame, 0);
	            } else {
	                setTimeout(eachFrame);
	            }
	        } else {
	            VBAInterface.VBA_stop();
	            document.querySelector(".pixels").style.display = "none";
	            document.querySelector(".ui").style.display = "block";
	        }
	    };
	    eachFrame();

	};

	window.scheduleStop = function () {
	    window.isRunning = false;
	};



/***/ },
/* 1 */
/***/ function(module, exports) {

	(function () {
	    "use strict";
	    
	    
	    var util = {
	        compileShader: function (gl, shaderSource, shaderType) {
	            var shader = gl.createShader(shaderType);
	            gl.shaderSource(shader, shaderSource);
	            gl.compileShader(shader);
	            var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	            if (!success) {
	                throw new Error("could not compile shader:" + gl.getShaderInfoLog(shader));
	            }
	            return shader;
	        },

	        createProgram: function (gl, vertexShader, fragmentShader) {
	            var program = gl.createProgram();
	            gl.attachShader(program, vertexShader);
	            gl.attachShader(program, fragmentShader);
	            gl.linkProgram(program);
	            var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	            if (!success) {
	                throw new Error("program filed to link:" + gl.getProgramInfoLog (program));
	            }
	            return program;
	        },

	        createShaderFromScript: function (gl, scriptId, opt_shaderType) {
	            // look up the script tag by id.
	            var shaderScript = document.getElementById(scriptId);
	            var shaderSource = shaderScript.text;
	            if (!opt_shaderType) {
	                if (shaderScript.type === "x-shader/x-vertex") {
	                    opt_shaderType = gl.VERTEX_SHADER;
	                } else if (shaderScript.type === "x-shader/x-fragment") {
	                    opt_shaderType = gl.FRAGMENT_SHADER;
	                } else {
	                    throw new Error("Unreachable");
	                }
	            }
	            return this.compileShader(gl, shaderSource, opt_shaderType);
	        },

	        createProgramFromScripts: function (gl, vertexShaderId, fragmentShaderId) {
	            var vertexShader = this.createShaderFromScript(gl, vertexShaderId);
	            var fragmentShader = this.createShaderFromScript(gl, fragmentShaderId);
	            return this.createProgram(gl, vertexShader, fragmentShader);
	        },
	        
	        createTexture: function (gl, size) {
	            var texture = gl.createTexture();
	            gl.bindTexture(gl.TEXTURE_2D, texture);
	            var tempPixels = new Uint16Array(size * size);
	            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, tempPixels);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	            return texture;
	        },
	        
	        updateTexture: function (gl, texture, width, height, pixels) {
	            gl.bindTexture(gl.TEXTURE_2D, texture);
	            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0,
	                                  width, height, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, pixels);
	        },
	        
	        createFullscreenQuad: function  (gl, lower, upper) {
	            var fullscreenQuadBuffer = gl.createBuffer();
	            gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuadBuffer);
	            gl.bufferData(
	                gl.ARRAY_BUFFER,
	                new Float32Array([
	                       lower,    lower,
	                       upper,    lower,
	                       lower,    upper,
	                       lower,    upper,
	                       upper,    lower,
	                       upper,    upper]),
	                gl.STATIC_DRAW);
	            return fullscreenQuadBuffer;
	        },

	    };

	    
	    
	    
	    
	    
	    
	    
	    var GBA_WIDTH = 240;
	    var GBA_HEIGHT = 160;
	    var TEXTURE_SIZE = 256;
	    
	    function VBAGraphics (emscriptenModule, canvas) {
	        this.emscriptenModule = emscriptenModule;
	        this.canvas = canvas;
	        
	        this.totalFrames = 0;
	        this.lastFrameTime = (window.performance.now() / 1000);
	        
	        // Webgl assets
	        this.gl = null;
	        this.fullscreenQuadBuffer = null;
	        this.texture = null;
	        this.shaderProgram = null;
	        this.positionLocation = null;
	        this.textureSamplerLocation = null;
	        
	        // Temporary buffer to store pixels as they're being
	        // sub'd into the texture.
	        this.pixels = new Uint16Array(GBA_WIDTH * GBA_HEIGHT);
	        
	    }
	    VBAGraphics.prototype = Object.create(Object.prototype);
	    VBAGraphics.prototype.constructor = VBAGraphics;
	    
	    VBAGraphics.prototype.initScreen = function () {

	        // Get webgl
	        this.gl = this.canvas.getContext("webgl", {alpha: false}) ||
	            this.canvas.getContext("experimental-webgl", {alpha: false});

	        // Set up assets
	        this.shaderProgram = util.createProgramFromScripts(this.gl, "2d-vertex-shader", "2d-fragment-shader");
	        this.texture = util.createTexture(this.gl, TEXTURE_SIZE);
	        this.fullscreenQuadBuffer = util.createFullscreenQuad(this.gl, 0, 1);
	        
	        // Get locations
	        this.positionLocation = this.gl.getAttribLocation(this.shaderProgram, "a_position");
	        this.textureSamplerLocation = this.gl.getUniformLocation(this.shaderProgram, "u_sampler");
	    };



	    VBAGraphics.prototype.drawGBAFrame = function  (gbaPointer8) {
	        
	        this.lastFrameTime = (window.performance.now() / 1000);
	        
	        var gbaPointer16 = gbaPointer8 / 2;
	        var gbaHeap16 = this.emscriptenModule.HEAP16;
	        for (var i = 0; i < this.pixels.length; i++) {
	            this.pixels[i] = gbaHeap16[gbaPointer16 + i];
	        }
	        util.updateTexture(this.gl, this.texture, GBA_WIDTH, GBA_HEIGHT, this.pixels);
	        this.drawFrame();
	        this.totalFrames++;
	    };

	    VBAGraphics.prototype.drawFrame = function  () {
	        
	        // Bind shader
	        this.gl.useProgram(this.shaderProgram);

	        // Bind verts
	        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.fullscreenQuadBuffer);
	        this.gl.enableVertexAttribArray(this.positionLocation);
	        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

	        // Bind texture
	        this.gl.activeTexture(this.gl.TEXTURE0);
	        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	        this.gl.uniform1i(this.textureSamplerLocation, 0);

	        // Draw
	        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

	    };



	    VBAGraphics.prototype.onResize = function (/*windowWidth, windowHeight*/) {
	        var canvas = this.canvas;
	//        canvas.style.top = canvas.style.bottom = canvas.style.left = canvas.style.right = "0";
	//        canvas.style.width = "";
	//        canvas.style.height = "";
	//
	//        var aspect = GBA_WIDTH / GBA_HEIGHT;
	//
	//        if (windowWidth < windowHeight * aspect) {
	//            // Change width
	//            var offset = (windowHeight - (windowWidth / aspect)) / 2;
	//            canvas.style.top = canvas.style.bottom = offset + "px";
	//            canvas.style.width = "100%";
	//        }
	//        if (windowHeight < windowWidth / aspect) {
	//            // Change height
	//            var offset = (windowWidth - (windowHeight * aspect)) / 2;
	//            canvas.style.left = canvas.style.right = offset + "px";
	//            canvas.style.height = "100%";
	//        }
	        canvas.width = canvas.clientWidth;
	        canvas.height = canvas.clientHeight;
	        this.gl.viewport(0, 0, canvas.width, canvas.height);
	    };
	    
	    
	    module.exports = VBAGraphics;


	}());




/***/ },
/* 2 */
/***/ function(module, exports) {

	(function () {
	    "use strict";
	    
	    if (window.AudioContext) {
	    
	        function VBASound(emscriptenModule) {

	            this.emscriptenModule = emscriptenModule;

	            var AudioContext = window.AudioContext || window.webkitAudioContext;
	            this.audioCtx = new AudioContext();
	            this.audioChannels = 2;
	            this.audioScriptNode = this.audioCtx.createScriptProcessor(1024, 2);
	            this.audioScriptNode.onaudioprocess = this.handleAudioEvent.bind(this)
	            this.audioScriptNode.connect(this.audioCtx.destination);
	            this.audioSpareSamplesRingBuffer = new Int16Array(1024 * 16);
	            this.audioSpareWritePtr = 0;
	            this.audioSpareReadPtr = 0;

	        }
	        VBASound.prototype = Object.create(Object.prototype);
	        VBASound.prototype.constructor = VBASound;

	        VBASound.prototype.getSampleRate = function () {
	            return this.audioCtx.sampleRate;
	        };

	        VBASound.prototype.currentAudioTime = function () {
	            return this.audioCtx.currentTime;
	        };

	        VBASound.prototype.getNumExtraSamples = function () {
	            let samples = this.audioSpareWritePtr - this.audioSpareReadPtr;
	            return samples >= 0 ? samples : (samples + this.audioSpareSamplesRingBuffer.length);
	        };

	        VBASound.prototype.resetSound = function () {
	        };

	        VBASound.prototype.writeSound = function (pointer8, length16) {

	            if (pointer8 % 2 === 1) {
	                console.error("Audio pointer must be 16 bit aligned.");
	                return;
	            }
	            if (length16 % 2 !== 0) {
	                console.error("Number of audio samples must be even.");
	                return;
	            }
	            var pointer16 = pointer8 >> 1;
	            var heap16 = this.emscriptenModule.HEAP16;
	            var i;

	            for (i = 0; i < length16; i++) {
	                this.audioSpareSamplesRingBuffer[this.audioSpareWritePtr] = heap16[pointer16 + i];
	                this.audioSpareWritePtr++;
	                if (this.audioSpareWritePtr >= this.audioSpareSamplesRingBuffer.length) {
	                    this.audioSpareWritePtr = 0;
	                }
	            }

	        };

	        VBASound.prototype.handleAudioEvent = function (event) {
	            var audioBuffers = [];
	            var numChannels = event.outputBuffer.numberOfChannels;
	            var requiredSamples = event.outputBuffer.length;
	            var i, channel;

	            for (i = 0; i < numChannels; i++) {
	                audioBuffers.push(event.outputBuffer.getChannelData(i));
	            }

	            for (i = 0; i < requiredSamples; i++) {
	                for (channel = 0; channel < numChannels; channel++) {
	                    if (this.audioSpareReadPtr === this.audioSpareWritePtr) {
	                        audioBuffers[channel][i] = 0;
	                    } else {
	                        audioBuffers[channel][i] = this.audioSpareSamplesRingBuffer[this.audioSpareReadPtr] / 0x4000;
	                        this.audioSpareReadPtr++;
	                        if (this.audioSpareReadPtr >= this.audioSpareSamplesRingBuffer.length) {
	                            this.audioSpareReadPtr -= this.audioSpareSamplesRingBuffer.length;
	                        }
	                    }
	                }
	            }

	        };

	        module.exports = VBASound;
	        
	    } else {
	        
	        // Implementation for browsers without audio support
	        function IE_VBASound(emscriptenModule) {
	            this.emscriptenModule = emscriptenModule;
	        }
	        IE_VBASound.prototype = Object.create(Object.prototype);
	        IE_VBASound.prototype.constructor = IE_VBASound;

	        IE_VBASound.prototype.getSampleRate = function () {
	            return 44100;
	        };

	        IE_VBASound.prototype.currentAudioTime = function () {
	            return Date.now() / 1000;
	        };

	        IE_VBASound.prototype.getNumExtraSamples = function () {
	            return 0;
	        };

	        IE_VBASound.prototype.resetSound = function () {
	        };

	        IE_VBASound.prototype.writeSound = function (pointer8, length16) {
	        };

	        IE_VBASound.prototype.handleAudioEvent = function (event) {
	        };

	        module.exports = IE_VBASound;
	        
	    }
	    
	}());


/***/ },
/* 3 */
/***/ function(module, exports) {

	(function () {
	    "use strict";
	    
	    
	    function VBASaves(emscriptenModule) {
	        this.emscriptenModule = emscriptenModule;
	        
	        this.safeSaveTimeout = null;
	        this.unsafeSaveTimeout = null;
	        this.unsafeSaveBuffer = null;
	        this.localStoragePrefix = "VBAsave_";
	    }
	    VBASaves.prototype = Object.create(Object.prototype);
	    VBASaves.prototype.constructor = VBASaves;
	    
	    
	    VBASaves.prototype.getRomCode = function () {
	        return this.emscriptenModule.Pointer_stringify(VBAInterface.VBA_get_rom() + 0xAC).substr(0, 4);
	    };
	    
	    
	    VBASaves.prototype.getSave = function (romCode) {
	        // If no rom code supplied, use the currently loaded game
	        romCode = romCode || this.getRomCode();
	        let base64 = localStorage[this.localStoragePrefix + romCode];
	        if (!base64) {
	            return new Uint8Array(0);
	        }
	        return new Uint8Array(atob(base64).split("").map(function(c) {
	            return c.charCodeAt(0);
	        }));
	    };

	    VBASaves.prototype.getSaveSize = function () {
	        return this.getSave().byteLength;
	    };

	    VBASaves.prototype.softCommit = function (pointer8, size) {
	        let heapu8 = this.emscriptenModule.HEAPU8;
	        let bufu8 = new Uint8Array(size);
	        for (let i = 0; i < size; i++) {
	            bufu8[i] = heapu8[pointer8 + i];
	        }
	        this.unsafeSaveBuffer = bufu8;
	    };

	    VBASaves.prototype.hardCommit = function (romCode, uint8Array) {
	        var binary = "";
	        var len = uint8Array.byteLength;
	        for (var i = 0; i < len; i++) {
	            binary += String.fromCharCode( uint8Array[i]);
	        }
	        localStorage[this.localStoragePrefix + romCode] = window.btoa(binary);
	    };

	    VBASaves.prototype.restoreSaveMemory = function (pointer8, targetBufferSize) {
	        let save = this.getSave();
	        let heap8 = this.emscriptenModule.HEAPU8;

	        if (save.byteLength !== targetBufferSize) {
	            throw new Error("Incompatible save size");
	        }

	        for (let i = 0; i < targetBufferSize; i++) {
	            heap8[pointer8 + i] = save[i];
	        }

	    };
	    
	    VBASaves.prototype.checkSaves = function () {
	        if (VBAInterface.VBA_get_systemSaveUpdateCounter()) {

	            // Copy the save to a temporary buffer if it's
	            // recently updated.
	            if (!this.unsafeSaveTimeout) {
	                this.unsafeSaveTimeout = setTimeout(function () {
	                    this.unsafeSaveTimeout = null;
	                    if (VBAInterface.VBA_get_emulating()) {
	                        console.log("[SAVE] soft commit done");
	                        VBAInterface.VBA_emuWriteBattery();
	                        VBAInterface.VBA_reset_systemSaveUpdateCounter();
	                    }
	                }.bind(this), 32);
	            }
	            
	        }

	        // Commit the save to localstorage if it hasn't been
	        // changed in a while.
	        if (this.unsafeSaveBuffer) {
	            console.log("[SAVE] hard commit timer reset");
	            let tempUnsafeSaveBuffer = this.unsafeSaveBuffer;
	            this.unsafeSaveBuffer = null;
	            clearTimeout(this.safeSaveTimeout);
	            this.safeSaveTimeout = setTimeout(function () {
	                this.safeSaveTimeout = null;
	                if (VBAInterface.VBA_get_emulating()) {
	                    this.hardCommit(this.getRomCode(), tempUnsafeSaveBuffer);
	                    console.log("[SAVE] hard commit done");
	                } else {
	                    console.log("[SAVE] abandoned hard commit, emulator not running");
	                }
	            }.bind(this), 70);
	        }
	        
	    };
	    
	    VBASaves.prototype.exportSave = function (romCode) {
	        var blob = new Blob([this.getSave(romCode)], {contentType: "application/octet-stream"});
	        window.saveAs(blob, romCode + ".sav", true);
	    };
	    
	    VBASaves.prototype.deleteSave = function (romCode) {
	        if (confirm("Are you sure you want to delete your save for " + romCode + "?")) {
	            delete localStorage[this.localStoragePrefix + romCode];
	        }
	    };
	    
	    VBASaves.prototype.onFileImportInputChanged = function (e, callback) {
	        let binaryFile = e.currentTarget.files[0];
	        var fr = new FileReader();
	        if (FileReader && binaryFile) {
	            fr.readAsArrayBuffer(binaryFile);
	            fr.onload = function () {
	                let romCode = binaryFile.name.substr(0, 4);
	                if (romCode.search(/^[A-Z]{4}$/) === -1) {
	                    romCode = window.prompt("What is the ROM code of the game that this save file belongs to?");
	                }
	                if (romCode.search(/^[A-Z]{4}$/) === -1) {
	                    alert("Invalid ROM code.");
	                } else {
	                    this.importSave(romCode, new Uint8Array(fr.result));
	                    callback();
	                }
	            }.bind(this);
	        }
	    };
	    
	    
	    VBASaves.prototype.listSaves = function (e) {
	        return Object.keys(localStorage).filter(function (v) {
	            return v.indexOf(this.localStoragePrefix) === 0;
	        }.bind(this)).map(function (v) {
	            return {
	                romCode: v.substr(this.localStoragePrefix.length, 4),
	            };
	        }.bind(this));
	    };
	    
	    VBASaves.prototype.importSave = function (romCode, byteArray) {
	        this.hardCommit(romCode, byteArray);
	    };
	    
	    
	    module.exports = VBASaves;
	    
	    
	}());











/***/ },
/* 4 */
/***/ function(module, exports) {

	(function () {
	    "use strict";
	    
	            
	    
	    function VBAInput() {
	        
	        
	        this.downCodes = {};
	        this.downKeyCodes = {};
	        window.addEventListener("keydown", function (e) {
	            this.downCodes[e.code] = 1;
	            this.downKeyCodes[e.keyCode] = 1;
	            return false;
	        }.bind(this));
	        window.addEventListener("keyup", function (e) {
	            this.downCodes[e.code] = 0;
	            this.downKeyCodes[e.keyCode] = 0;
	            return false;
	        }.bind(this));
	        this.bindings = {}; 
	        
	        this.bindings.KEY_BUTTON_A = {
	            codes: ["KeyZ"],
	            keyCodes: [90],
	        };
	        this.bindings.KEY_BUTTON_B = {
	            codes: ["KeyX"],
	            keyCodes: [88],
	        };
	        this.bindings.KEY_BUTTON_SELECT = {
	            codes: ["Escape", "Backspace"],
	            keyCodes: [27, 8],
	        };
	        this.bindings.KEY_BUTTON_START = {
	            codes: ["Enter"],
	            keyCodes: [13],
	        };
	        this.bindings.KEY_RIGHT = {
	            codes: ["ArrowRight"],
	            keyCodes: [39],
	        };
	        this.bindings.KEY_LEFT = {
	            codes: ["ArrowLeft"],
	            keyCodes: [37],
	        };
	        this.bindings.KEY_UP = {
	            codes: ["ArrowUp"],
	            keyCodes: [38],
	        };
	        this.bindings.KEY_DOWN = {
	            codes: ["ArrowDown"],
	            keyCodes: [40],
	        };
	        this.bindings.KEY_BUTTON_R = {
	            codes: ["Control", "ControlLeft", "ControlRight"],
	            keyCodes: [17],
	        };
	        this.bindings.KEY_BUTTON_L = {
	            codes: ["Shift", "ShiftLeft", "ShiftRight"],
	            keyCodes: [16],
	        };
	        
	        
	    }
	    VBAInput.prototype = Object.create(Object.prototype);
	    VBAInput.prototype.constructor = VBAInput;
	    
	    
	    VBAInput.prototype.isKeyDown = function (binding) {
	        for (let i = 0; i < binding.codes.length; i++) {
	            if (this.downCodes[binding.codes[i]]) {
	                return true;
	            }
	        }
	        for (let i = 0; i < binding.keyCodes.length; i++) {
	            if (this.downKeyCodes[binding.keyCodes[i]]) {
	                return true;
	            }
	        }
	    };
	    
	    
	    VBAInput.prototype.getJoypad = function () {
	        var res = 0;
	        
	        if (this.isKeyDown(this.bindings.KEY_BUTTON_A)) {
	            res |= 1;
	        }
	        if (this.isKeyDown(this.bindings.KEY_BUTTON_B)) {
	            res |= 2;
	        }
	        if (this.isKeyDown(this.bindings.KEY_BUTTON_SELECT)) {
	            res |= 4;
	        }
	        if (this.isKeyDown(this.bindings.KEY_BUTTON_START)) {
	            res |= 8;
	        }
	        if (this.isKeyDown(this.bindings.KEY_RIGHT)) {
	            res |= 16;
	        }
	        if (this.isKeyDown(this.bindings.KEY_LEFT)) {
	            res |= 32;
	        }
	        if (this.isKeyDown(this.bindings.KEY_UP)) {
	            res |= 64;
	        }
	        if (this.isKeyDown(this.bindings.KEY_DOWN)) {
	            res |= 128;
	        }
	        if (this.isKeyDown(this.bindings.KEY_BUTTON_R)) {
	            res |= 256;
	        }
	        if (this.isKeyDown(this.bindings.KEY_BUTTON_L)) {
	            res |= 512;
	        }

	        // disallow L+R or U+D of being pressed at the same time
	        if ((res & 48) === 48) {
	            res &= ~48;
	        }
	        if ((res & 192) === 192) {
	            res &= ~192;
	        }

	        return res;
	    };
	    
	    
	    
	    module.exports = VBAInput;
	    
	    
	}());

/***/ },
/* 5 */
/***/ function(module, exports) {

	(function () {
	    "use strict";
	    
	    
	    function VBAUI(el) {
	        this.el = el;
	        
	        this.initialHTML = el.innerHTML;
	    }
	    VBAUI.prototype = Object.create(Object.prototype);
	    VBAUI.prototype.constructor = VBAUI;
	    
	    
	    VBAUI.prototype.reset = function () {
	        this.el.innerHTML = this.initialHTML;
	        
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
	        savesEl.innerHTML = savesHTML;
	        
	    };
	    
	    VBAUI.prototype.export = function (e) {
	        vbaSaves.exportSave();
	    };
	    
	    
	    module.exports = VBAUI;
	    
	    
	}());

/***/ }
/******/ ]);