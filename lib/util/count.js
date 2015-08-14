var Promise = require('bluebird');

var globalCounter = 0;

exports.increase = increase;
exports.increasedResponse = increasedResponse;


function increase(increaseBy){
    return new Promise(function(resolve){
        globalCounter = globalCounter + increaseBy;
        resolve(globalCounter);
    });
}


function increasedResponse(increaseBy){
        var increasedResult = {
            serverText: 'global counter increased by ' + increaseBy +
                        ', is now: ' + globalCounter,
            counter: globalCounter
        };
        return increasedResult;
}
