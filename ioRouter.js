var express = require('express.io');
var app = express();
var twitterIoHandler = require('./lib/handler/twitterIo');
var countIoHandler = require('./lib/handler/countIO');

exports.app = app;

app.http().io();

app.io.route('ready', function () {
    console.log('client connected, to start streaming press button...');
});

app.io.route('countUp', countIoHandler.countUp);

app.io.route('Stream', {
    start: twitterIoHandler.startStream,
    stop: twitterIoHandler.stopStream,
    live: twitterIoHandler.liveStream
});


app.io.route('getNextTweets', function(req){
    var slicePosition = req.data.numberOfTweets;
    var tweetsToSend = tweetQueue.slice(0, slicePosition);
    tweetQueue = tweetQueue.slice(slicePosition, tweetQueue.length);
    req.io.respond({
                tweets: tweetsToSend
            });
});

