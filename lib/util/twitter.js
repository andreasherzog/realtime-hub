
var Promise = require('bluebird');
var Twitter = require('twitter');
var debug = require('debug')('realtime-hub:twitterUtils');

var tweetQueue = [];
var userStreams = {};
var twitterClient = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.TOKEN_KEY,
    access_token_secret: process.env.TOKEN_SECRET
});

exports.stopUserStream = stopUserStream;
exports.startUserStream = startUserStream;
exports.initializeUserStream = initializeUserStream;
exports.getNextTweets = getNextTweets;

function stopUserStream(socket, user){
    var userStream;
    debug('stopping user stream');
    if(userStreams[user]){
        userStream = userStreams[user];
        userStream.destroy();
        delete userStreams[user];
        socket.emit('stopStream');
    }
}


function startUserStream(socket, user, isLiveStream){
    debug('startUserStream');
    if(!userStreams[user]){
        return initializeUserStream(socket, user, isLiveStream);
    }
    return new Promise(function (resolve){
        userStreams[user].isLiveStream = isLiveStream;
        debug('livestream: ' + isLiveStream);
        resolve();
    });
}


function initializeUserStream(socket, user, isLiveStream){
    return new Promise(function(resolve){
        twitterClient.stream('statuses/filter', {track: 'beer'}, function(newStream){
                userStreams[user] = newStream;
        });
        userStreams[user].isLiveStream = isLiveStream;
        debug('start streaming...');
        userStreams[user].on('data', function(tweet){
            if (userStreams[user].isLiveStream){
                debug('LiveStream tweet');
                socket.emit('newTweet', {tweet: tweet});
            }
            else
                tweetQueue.push(tweet);
            debug(tweet.text);
        });
        userStreams[user].on('error', function(error){
            console.error(error);
            socket.emit('error', {
                error: error
            });
        });
        resolve();
    });
}

function getNextTweets(socket, slicePosition){
    var tweetsToSend = tweetQueue.slice(0, slicePosition);
    tweetQueue = tweetQueue.slice(slicePosition, tweetQueue.length);
    socket.emit('nextTweets', {
                                tweets: tweetsToSend
                              });
}
