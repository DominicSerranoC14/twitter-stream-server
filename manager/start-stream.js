'use strict';

const Twitter = require('twitter');
const timer = require('./seconds.js');
const { streams } = require('./streamState.js');

const client = new Twitter({
    consumer_key: process.env.CLIENT_KEY,
    consumer_secret: process.env.CLIENT_SECRET,
    access_token_key: process.env.TOKEN_KEY,
    access_token_secret: process.env.TOKEN_SECRET
});


// Connects with single socket and will emit to all sockets connected. This will limit many users from connecting.
// TODO once this is finished, create rooms / single stream channels?
const startStream = (socket, manager) => {
    streams[socket.id].stream = client.stream('statuses/filter', streams[socket.id].options);
        
    streams[socket.id].streamInterval = setInterval(() => timer.increment(streams[socket.id].stream), 1000);
};

module.exports = { startStream };
