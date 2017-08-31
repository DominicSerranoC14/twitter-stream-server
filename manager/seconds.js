'use strict';

const pingServer = require('./pingDyno.js');

const timer = {
    seconds: 0,

    increment: (stream) => {
        timer.seconds++;

        // Ping the server every 60 seconds to keep dyno from idling. This will only happen if a stream is open.
        if (timer.seconds === 60) {
            pingServer();
        }

        // If 180 seconds have passed, kill the stream
        if (timer.seconds === 180) {
            stream.destroy();
        }
    },
};

module.exports = timer;
