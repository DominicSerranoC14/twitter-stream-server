'use strict';

// Holds all stream object
const streams = {};

const createNewStreamObject = (socketId) => {
    const streamObject = {
        createdAt: null,
        flush() {
            this.isActive = false;
            // this.options = null;
            this.stream = null;
            this.streamInterval = null;
        },
        id: socketId,
        isActive: false,
        options: null,
        statusList: [],
        stream: null,
        streamInterval: null,
    };

    // Object.seal allows for values to be mutated, but new key/values cannot be added
    streams[socketId] = Object.seal(streamObject);
};

module.exports = {
    streams,
    createNewStreamObject,
};