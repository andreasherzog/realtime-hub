
var socketIo = require('socket.io');
var debug = require('debug')('realtime-hub:ioRouter');

var twitterIoHandler = require('./lib/handler/twitterIo');
var countIoHandler = require('./lib/handler/countIo');
var ioUtils = require('./lib/util/io');

var ioRouter = {};
module.exports = ioRouter;

ioRouter.init = function(server){
    var io = socketIo(server);
    io.on('connection', function (socket) {
        debug('client ' + socket.id + ' connected on socket');
        socket.on('error', ioUtils.handleSocketError);
        socket.on('countUp', countIoHandler.countUp.bind(null, socket));
        socket.on('Stream:start', twitterIoHandler.startStream.bind(null, socket));
        socket.on('Stream:stop', twitterIoHandler.stopStream.bind(null, socket));
        socket.on('Stream:live', twitterIoHandler.liveStream.bind(null, socket));
        socket.on('getNextTweets', twitterIoHandler.getNextTweets.bind(null, socket));
    });


};
