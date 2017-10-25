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
        this.lastFrameTime = window.performance.now();
        
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
        
        if (!this.gl) {
            return false;
        }
        
        // Set up assets
        this.shaderProgram = util.createProgramFromScripts(this.gl, "2d-vertex-shader", "2d-fragment-shader");
        this.texture = util.createTexture(this.gl, TEXTURE_SIZE);
        this.fullscreenQuadBuffer = util.createFullscreenQuad(this.gl, 0, 1);
        
        // Get locations
        this.positionLocation = this.gl.getAttribLocation(this.shaderProgram, "a_position");
        this.textureSamplerLocation = this.gl.getUniformLocation(this.shaderProgram, "u_sampler");
        
        return true;
    };



    VBAGraphics.prototype.drawGBAFrame = function  (gbaPointer8) {
        
        var deltaTime = window.performance.now() - this.lastFrameTime;
        vbaPerf.renderDeadlineResultsThisSecond.push(window.hasRequestedFrameButNotRendered);
        window.hasRequestedFrameButNotRendered = false;
        this.lastFrameTime = window.performance.now();
        
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


