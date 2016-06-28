(function () {
    "use strict";
    
    
    function VBASound(emscriptenModule) {
        
        
        this.emscriptenModule = emscriptenModule;
        this.lastSoundEventTime = (window.performance.now() / 1000);
        
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.audioChannels = 2;
        this.audioSampleCount = this.audioCtx.sampleRate * 4;
        this.audioBuffers = this.audioCtx.createBuffer(2, this.audioSampleCount, 44100);
        this.audioProgressPointer = 0;
        this.audioSamplesPlayed = 0;
        this.audioSamplesRecieved = 0;
        this.audioLastWrite = 0;
        this.audioLastLag = 0;
        this.audioStartTime = 0;
        this.audioSource = null;
    }
    VBASound.prototype = Object.create(Object.prototype);
    VBASound.prototype.constructor = VBASound;
    
    VBASound.prototype.getTimeTilNextEvent = function () {
        return Math.min(1 / 100, ((window.performance.now() / 1000) - this.lastSoundEventTime));
    };
    
    VBASound.prototype.getSampleRate = function () {
        return this.audioBuffers.sampleRate;
    };
    
    VBASound.prototype.currentAudioTime = function () {
        return this.audioCtx.currentTime;
    };
    
    VBASound.prototype.resetSound = function () {
        this.audioStartTime = this.currentAudioTime();
        this.audioSamplesRecieved = 0;
        this.audioSamplesPlayed = 0;
        this.audioLastWrite = this.currentAudioTime();
    };
    
    VBASound.prototype.writeSound = function (pointer8, length16) {

        this.lastSoundEventTime = (window.performance.now() / 1000);
        
        if (pointer8 % 2 === 1) {
            console.log("Audio pointer must be 16 bit aligned.");
            return;
        }
        if (length16 % 2 === 1) {
            console.log("Number of audio samples must be even.");
            return;
        }

        var sampleRate = this.audioBuffers.sampleRate;
        this.audioSamplesPlayed += (this.currentAudioTime() - this.audioLastWrite) * sampleRate;
        this.audioSamplesRecieved += length16 / 2;
        this.audioLastWrite = this.currentAudioTime();
        this.audioLastLag = this.audioSamplesPlayed - this.audioSamplesRecieved;
        var lag = this.audioSamplesPlayed - this.audioSamplesRecieved;
        if (!this.audioSource) {
            console.log("Audio init", Math.floor(lag));
            this.writeSoundToNewBuffer(pointer8, length16);
        } else {

            if (lag > 2000) {
                this.writeSilence(pointer8, 1000);
                console.log("audio ffwd", Math.floor(lag));
            } else if (lag < -2000) {
                this.rewindSound(1000);
                console.log("audio rewind", Math.floor(lag));
            } else {
                this.writeSoundToExistingBuffer(pointer8, length16);
            }

        }

    };
    


    VBASound.prototype.writeSoundToNewBuffer = function (pointer8, length16) {

        var oldAudioSource = this.audioSource;

        this.audioSource = this.audioCtx.createBufferSource();
        this.audioSource.playbackRate.value = 1;
        this.audioSource.loop = true;
        this.audioSource.buffer = this.audioBuffers;
        this.audioSource.connect(this.audioCtx.destination);
        for (var channel = 0; channel < this.audioChannels; channel++) {
            var nowBuffering = this.audioBuffers.getChannelData(channel);
            for (var i = 0; i < this.audioSampleCount; i++) {
                nowBuffering[i] = 0;
            }
        }

        if (oldAudioSource) {
            oldAudioSource.stop(this.audioCtx.currentTime + 0.1);
        }
        this.audioSource.start(this.audioCtx.currentTime + 0.1);


        this.audioStartTime = this.currentAudioTime();
        this.audioSamplesRecieved = 0;
        this.audioSamplesPlayed = 0;
        this.audioLastWrite = this.currentAudioTime();



        this.writeSoundToExistingBuffer(pointer8, length16);
    };

    VBASound.prototype.writeSoundToExistingBuffer = function (pointer8, length16) {

        var pointer16 = pointer8 >> 1;
        var heap16 = this.emscriptenModule.HEAP16;
        var audioChannelBuffers = [];
        var i, channel;
        
        for (i = 0; i < this.audioChannels; i++) {
            audioChannelBuffers.push(this.audioBuffers.getChannelData(i));
        }
        

        if (this.audioChannels === 2) {
            for (i = 0; i < length16; i += 2) {
                for (channel = 0; channel < this.audioChannels; channel++) {
                    audioChannelBuffers[channel][this.audioProgressPointer] = heap16[pointer16 + i + channel] / 0x4000;
                }
                this.audioProgressPointer++;
                if (this.audioProgressPointer >= this.audioSampleCount) {
                    this.audioProgressPointer = 0;
                }
            }

        } else {

            for (i = 0; i < length16; i += 2) {
                for (channel = 0; channel < this.audioChannels; channel++) {
                    audioChannelBuffers[channel][this.audioProgressPointer] = heap16[pointer16 + i] / 0x4000;
                }
                this.audioProgressPointer++;
                if (this.audioProgressPointer >= this.audioSampleCount) {
                    this.audioProgressPointer = 0;
                }
            }

        }

    };

    VBASound.prototype.writeSilence = function (pointer8, numSamples) {

        this.audioSamplesRecieved += numSamples;
        var audioChannelBuffers = [];
        
        var i;
        
        for (i = 0; i < this.audioChannels; i++) {
            audioChannelBuffers.push(this.audioBuffers.getChannelData(i));
        }

        for (i = 0; i < numSamples; i += 1) {
            for (var channel = 0; channel < this.audioChannels; channel++) {
                audioChannelBuffers[channel][this.audioProgressPointer] = 0;
            }
            this.audioProgressPointer++;
            if (this.audioProgressPointer >= this.audioSampleCount) {
                this.audioProgressPointer = 0;
            }
        }

    };

    VBASound.prototype.cleanup = function () {

        this.audioSamplesRecieved += numSamples;
        var audioChannelBuffers = [];
        
        var i;
        
        for (i = 0; i < this.audioChannels; i++) {
            audioChannelBuffers.push(this.audioBuffers.getChannelData(i));
        }

        for (i = 0; i < numSamples; i += 1) {
            for (var channel = 0; channel < this.audioChannels; channel++) {
                audioChannelBuffers[channel][this.audioProgressPointer] = 0;
            }
            this.audioProgressPointer++;
            if (this.audioProgressPointer >= this.audioSampleCount) {
                this.audioProgressPointer = 0;
            }
        }

    };

    VBASound.prototype.rewindSound = function (numSamples) {

        this.audioSamplesRecieved -= numSamples;
        
        while (this.audioProgressPointer <= 0) {
            this.audioProgressPointer += this.audioSampleCount;
        }

    };

    
    window.VBASound = VBASound;
    
    
}());