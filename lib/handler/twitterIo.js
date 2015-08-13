
var twitterUtils = require('../util/twitter');
var ioUtils = require('../util/io');

exports.startStream = startStream;
exports.stopStream = stopStream;
exports.liveStream = liveStream;
exports.getNextTweets = getNextTweets;

function startStream(socket){
    var user = socket.id;
    var isLiveStream = false;
    twitterUtils.startUserStream(socket, user, isLiveStream)
        .delay(60000)
        .then(twitterUtils.stopUserStream.bind(null, socket, user))
        .catch(function(error){
            ioUtils.handleError(error, socket);
        });
}

function stopStream(socket){
    var user = socket.id;
    twitterUtils.stopUserStream(socket, user, function(){
        console.log('userStream stopped');
    });
}

function liveStream(socket){
    var user = socket.id;
    var isLiveStream = true;
    twitterUtils.startUserStream(socket, user, isLiveStream)
    .catch(function(error){
        ioUtils.handleError(error, socket);
    });
}

function getNextTweets(socket, data){
    var slicePosition = data.numberOfTweets;
    twitterUtils.getNextTweets(socket, slicePosition);
}
