var express = require('express.io');
var app = express();
var Twitter = require('twitter');
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
    counter = counter + increaseBy;
    setTimeout(function(){
        req.io.respond({
            serverText: 'Counter increased by ' + increaseBy +
                ', is now: ' + counter,
            counter: counter
        });
    }, 2000);
});

app.io.route('Stream', {
    start: function(req){
        var user = req.io.socket.id;
        var isLiveStream = false;
        startUserStream(req, user, isLiveStream);
        setTimeout(function(){
            stopUserStream(req, user);
        }, 60000);
    },
    stop: function(req){
        var user = req.io.socket.id;
        stopUserStream(req, user);
    },
    live: function(req){
        var user = req.io.socket.id;
        var isLiveStream = true;
        console.log('Start Live Stream');
        startUserStream(req, user, isLiveStream);
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
    if(!userStreams[user]){
        twitterClient.stream('statuses/filter', {track: '#beer'}, function(newStream){
            userStreams[user] = newStream;
        });
        userStreams[user].isLiveStream = isLiveStream;
        console.log('start streaming...');
        userStreams[user].on('data', function(tweet){
            console.log(tweet.text);
            if (userStreams[user].isLiveStream){
                console.log('LiveStream tweet');
                req.io.emit('newTweet', {tweet: tweet});
            }
            else
                tweetQueue.push(tweet);
        });
        userStreams[user].on('error', function(error){
            console.error(error);
            req.io.emit('error', {
                error: error
            });
        });
    }
    else{
        userStreams[user].isLiveStream = isLiveStream;
    }
}

app.listen(3000);
