
var countUtils = require('../util/count');
var ioUtils = require('../util/io');
var COUNT_DELAY = 2000;

exports.countUp = countUp;

function countUp(socket, data) {
    var increaseBy = data.increaseBy;
    countUtils.increase(increaseBy)
    .delay(COUNT_DELAY)
    .then(countUtils.increasedResponse.bind(null, increaseBy))
    .then(function(increasedResult){
        socket.io.respond(increasedResult);
    })
    .catch(function (error){
        ioUtils.handleError(error, socket);
    });
}
