
var Promise = require('bluebird');
var Twitter = require('twitter');

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


function stopUserStream(req, user){
    var userStream;
    console.log('stopping user stream');
    if(userStreams[user]){
        userStream = userStreams[user];
        userStream.destroy();
        delete userStreams[user];
        req.io.emit('stopStream');
    }
}


function startUserStream(req, user, isLiveStream){
    console.log(user);
    if(!userStreams[user]){
        console.log('stream');
        return initializeUserStream(req, user, isLiveStream);
    }
    return new Promise(function (resolve){
        userStreams[user].isLiveStream = isLiveStream;
        console.log('livestream: ' + isLiveStream);
        resolve();
    });
}


function initializeUserStream(req, user, isLiveStream){
    return new Promise(function(resolve){
        twitterClient.stream('statuses/filter', {track: 'beer'}, function(newStream){
                userStreams[user] = newStream;
        });
        userStreams[user].isLiveStream = isLiveStream;
        console.log('start streaming...');
        userStreams[user].on('data', function(tweet){
            if (userStreams[user].isLiveStream){
                console.log('LiveStream tweet');
                req.io.emit('newTweet', {tweet: tweet});
            }
            else
                tweetQueue.push(tweet);
            console.log(tweet.text);
        });
        userStreams[user].on('error', function(error){
            console.error(error);
            req.io.emit('error', {
                error: error
            });
        });
        resolve();
    });
}
