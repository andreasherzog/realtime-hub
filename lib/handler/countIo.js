
var countUtils = require('../util/count');
var ioUtils = require('../util/io');
var COUNT_DELAY = 2000;

exports = countUp;

function countUp(req) {
    var increaseBy = req.data.increaseBy;
    countUtils.increase(increaseBy)
    .delay(COUNT_DELAY)
    .then(countUtils.increasedResponse.bind(null, increaseBy))
    .then(function(increasedResult){
        req.io.respond(increasedResult);
    })
    .catch(function (error){
        ioUtils.handleError(error, req);
    });
}
