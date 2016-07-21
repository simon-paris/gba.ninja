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

        window.VBASound = VBASound;
        
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

        window.VBASound = IE_VBASound;
        
    }
    
}());
