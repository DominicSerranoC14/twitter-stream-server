'use strict';

// TODO freeze each stream object to ensure these options can only be set
module.exports = {
    flush() {
        this.isActive = false;
        this.options = null;
        this.stream = null;
        this.streamInterval = null;
    },
    isActive: false,
    options: null,
    stream: null,
    streamInterval: null,
};
