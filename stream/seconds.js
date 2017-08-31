'use strict';

const timer = {
    seconds: 0,

    increment: (stream) => {
        timer.seconds++;

        // If 180 seconds have passed, kill the stream
        if (timer.seconds === 180) {
            stream.destroy();
        }
    }
};

module.exports = timer;
