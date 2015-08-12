
var twitterUtils = require('../util/twitter');
var ioUtils = require('../util/io');

exports.startStream = startStream;
exports.stopStream = stopStream;
exports.liveStream = liveStream;

function startStream(req){
    var user = req.io.socket.id;
    var isLiveStream = false;
    twitterUtils.startUserStream(req, user, isLiveStream)
        .delay(60000)
        .then(twitterUtils.stopUserStream.bind(null, req, user))
        .catch(function(error){
            ioUtils.handleError(error, req);
        });
}

function stopStream(req){
    var user = req.io.socket.id;
    twitterUtils.stopUserStream(req, user, function(){
        console.log('userStream stopped');
    });
}

function liveStream(req){
    var user = req.io.socket.id;
    var isLiveStream = true;
    twitterUtils.startUserStream(req, user, isLiveStream)
    .catch(function(error){
        ioUtils.handleError(error, req);
    });
}
