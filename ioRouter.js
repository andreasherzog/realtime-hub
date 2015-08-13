var ioRouter = {};

var socketIo = require('socket.io');

var twitterIoHandler = require('./lib/handler/twitterIo');
var countIoHandler = require('./lib/handler/countIo');

module.exports = ioRouter;

ioRouter.init = function(server){
    var io = socketIo(server);
    io.on('connection', function (socket) {
        console.log('client ' + socket.id + ' connected, to start streaming press button...');
        socket.on('countUp', countIoHandler.countUp);
        socket.on('Stream:start', twitterIoHandler.startStream.bind(null, socket));
        socket.on('Stream:stop', twitterIoHandler.stopStream.bind(null, socket));
        socket.on('Stream:live', twitterIoHandler.liveStream.bind(null, socket));
        socket.on('getNextTweets', twitterIoHandler.getNextTweets.bind(null, socket));
    });


};
