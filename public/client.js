var isLiveStream = false;

var socketUrl = getSocketUrl();

var io = io.connect(socketUrl, {
  'reconnect': true,
  'reconnection delay': 500,
  'max reconnection attempts': 10
});

io.emit('ready', {from: 'client'});
io.on('stopStream', function(){
        replaceNotificationArea('Stream: inactive');
});
io.on('error', function(data){
    addToTextArea(data.error.stringify());
});
io.on('newTweet', function(data){
        console.log(data.tweet);
        addToTextArea(renderTweet(data.tweet));
});
io.on('nextTweets', function(data){
        data.tweets.forEach(function(currentValue, index){
            console.log(currentValue);
            addToTextArea(renderTweet(currentValue));
        });
});

function getSocketUrl(){
    var currentUrl = window.location.href;
    console.log(currentUrl);
    if(currentUrl === 'http://localhost:3000/')
        return currentUrl;
    return 'hub.pom-dev002.muc.pom';
}

function replaceNotificationArea(newText){
    var notificationArea = document.getElementById('notificationArea');
    var newElement = document.createElement('p');
    var node = document.createTextNode(newText);

    newElement.setAttribute('id', 'notificationArea');
    newElement.appendChild(node);

    notificationArea.parentNode.replaceChild(newElement, notificationArea);
}
function replaceTextArea(newText){
    var textArea = document.getElementById('textArea');
    var newElement = document.createElement('p');
    var node = document.createTextNode(newText);

    newElement.setAttribute('id', 'textArea');
    newElement.appendChild(node);

    textArea.parentNode.replaceChild(newElement, textArea);
}
function addToTextArea(newText){
    var textArea = document.getElementById('body');
    var newElement = document.createElement('p');
    var node = document.createTextNode(newText);

    newElement.appendChild(node);

    textArea.appendChild(newElement);
}
function renderTweet(tweet){
    return tweet.created_at + ' | ' + tweet.text;
}
function sendCountUp(){
    io.emit('countUp', {increaseBy: 1}, function(data){
        replaceTextArea(data.serverText);
    });
}
function startStream(){
    isLiveStream = false;
    io.emit('Stream:start');
    replaceNotificationArea('Stream: active');
}
function getNextTweets(){
    console.log('getNextTweets')
    io.emit('getNextTweets', {
        numberOfTweets: 3
    });
}

function stopStream(){
    io.emit('Stream:stop');
}
function setLiveStream(){
    replaceNotificationArea('Stream: live');
    isLiveStream = true;
    io.emit('Stream:live');
}

