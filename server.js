var express = require('express');
var debug = require('debug')('realtime-hub:server');

var io = require('./ioRouter');
var app = express();

var server;

app.use(express.static('public'));

app.set('port', 3000);

app.use(function (req, res, next){
    debug(req.method + ' ' + req.url);
    next();
});

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/client.html');
});

server = app.listen(app.get('port'), function() {
    debug('Express server running on port ' + app.get('port'));
});

io.init(server);
