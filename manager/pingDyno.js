'use strict';

const rp = require('request-promise');

const options = {
    uri: 'http://localhost:3000/ping-dyno',
    method: 'GET',
};

module.exports = () => {
    console.log('Pinging dyno...');
    return rp(options)
    .catch((err) => console.log('Ping failed.', err));
};
