var express = require('express');

var io = require('./ioRouter');
var app = express();

var server;

app.use(express.static('public'));

app.set('port', 3000);

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/client.html');
});

server = app.listen(app.get('port'), function() {
    console.log('Express server running on port ' + app.get('port'));
});

io.init(server);
