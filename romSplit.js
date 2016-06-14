(function () {
    "use strict";
    
    // node romSplit --inFile rom.gba --outFolder ./romChunks --chunkSize 65536 --initialChunks 1,2,3
    
    let argv = require("yargs").argv;
    let fs = require("fs");
    let path = require("path");
    let zlib = require("zlib");
    
    let chunkSize = argv.chunkSize;
    let inFile = argv.inFile;
    let outFolder = argv.outFolder;
    let initialChunkIds = argv.initialChunks.split(",").map(function (v) { return +v; });
    
    let bin = fs.readFileSync(inFile);
    
    for (let offset = 0; offset < bin.length; offset += chunkSize) {
        let chunkId = offset / chunkSize;
        let chunk = bin.slice(offset, offset + chunkSize);
        fs.writeFileSync(path.join(outFolder, "chunk" + chunkId + ".bin.gz"), zlib.gzipSync(chunk));
    }
    
    let initialChunks = [];
    for (let i = 0; i < initialChunkIds.length; i++) {
        let chunkId = initialChunkIds[i];
        let offset = chunkId * chunkSize;
        let chunk = bin.slice(offset, offset + chunkSize);
        initialChunks.push(chunk);
    }
    fs.writeFileSync(path.join(outFolder, "chunkBUNDLE" + ".bin.gz"), zlib.gzipSync(Buffer.concat(initialChunks)));
    
    
    
}());