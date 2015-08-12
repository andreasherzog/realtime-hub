var express = require('express.io');
var app = require('./ioRouter').app;
console.log(app);
app.use(express.static('public'));

app.get('/', function(req, res){
    res.sendfile(__dirname + '/public/client.html');
});

app.listen(3000);
