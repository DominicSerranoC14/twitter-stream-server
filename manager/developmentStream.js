'use strict';

const EventEmitter = require('events');
const state = require('./streamState.js');

const generateFakeTweet = () => ({
    status_id: '12344566', 
    name: 'tester name', 
    screen_name: 'big tester',
    text: 'I love to tweet!',
    media: null, 
    reply_name: null,
    user: {},
    entities: {},
})

const startDevStream = (socket, manager) => {
    state.stream = new EventEmitter();

    // Send ititial tweet after socket listeners have been set up
    setTimeout(() => state.stream.emit('data', generateFakeTweet()), 1000);

    const streaming = setInterval(() => 
        state.stream.emit('data', generateFakeTweet()), 30000);

    state.stream.on('end', () => {
        state.stream = null;
        clearInterval(streaming);
        // Emit a 'stream-closed' event to the worker-socket connected
        socket.emit('stream-closed');
        console.log('Stream has ended.');
    });
};

module.exports = { startDevStream };
