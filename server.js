var express = require('express.io');
var app = express();
var Twitter = require('twitter');
var Promise = require('bluebird');
var twitterClient = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.TOKEN_KEY,
    access_token_secret: process.env.TOKEN_SECRET
});

var counter = 0;
var tweetQueue = [];
var userStreams = {};

app.http().io();

app.use(express.static('public'));

app.io.route('ready', function(){
    console.log('client connected, to start streaming press button...');
});

app.io.route('countUp', function(req){
    var increaseBy = req.data.increaseBy;
    increase(increaseBy)
    .delay(2000)
    .then(increasedResponse.bind(null, increaseBy))
    .then(function(increasedResult){
        req.io.respond(increasedResult);
    })
    .catch(function (error){
        handleError(error, req);
    });
});

app.io.route('Stream', {
    start: function(req){
        var user = req.io.socket.id;
        var isLiveStream = false;
        startUserStream(req, user, isLiveStream)
        .delay(60000)
        .then(stopUserStream.bind(null, req, user))
        .catch(function(error){
            handleError(error, req);
        });

    },
    stop: function(req){
        var user = req.io.socket.id;
        stopUserStream(req, user, function(){
            console.log('userStream stopped');
        });
    },
    live: function(req){
        var user = req.io.socket.id;
        var isLiveStream = true;
        startUserStream(req, user, isLiveStream)
        .catch(function(error){
            handleError(error, req);
        });
    }
});


app.io.route('getNextTweets', function(req){
    var slicePosition = req.data.numberOfTweets;
    var tweetsToSend = tweetQueue.slice(0, slicePosition);
    tweetQueue = tweetQueue.slice(slicePosition, tweetQueue.length);
    req.io.respond({
                tweets: tweetsToSend
            });
});

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/client.html');
});


function handleError(error, req){
    console.error(error);
    req.io.emit('error', {
        error: error
    });
}

function increase(increaseBy){
    return new Promise(function(resolve){
        counter = counter + increaseBy;
        resolve(counter);
    });
}


function increasedResponse(increaseBy){
    return new Promise(function(resolve){
        var increasedResult = {
                                serverText: 'Counter increased by ' + increaseBy +
                                            ', is now: ' + counter,
                                counter: counter
                                };

        resolve(increasedResult);
    });
}


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

app.listen(3000);
