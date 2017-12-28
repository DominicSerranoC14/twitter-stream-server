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

    // Send initial tweet after socket listeners have been set up
    setTimeout(() => state.stream.emit('data', generateFakeTweet()), 1000);

    return setInterval(() => 
        state.stream.emit('data', generateFakeTweet()), 30000);
};

module.exports = { startDevStream };
