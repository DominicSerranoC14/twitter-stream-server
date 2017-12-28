'use strict';

const EventEmitter = require('events');
const { createNewStreamObject, streams } = require('./streamState.js');

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
    streams[socket.id].stream = new EventEmitter();
    
    // Send initial tweet after socket listeners have been set up
    setTimeout(() => streams[socket.id].stream.emit('data', generateFakeTweet()), 1000);

    streams[socket.id].streamInterval = setInterval(() => 
        streams[socket.id].stream.emit('data', generateFakeTweet()), 30000);
};

module.exports = { startDevStream };
