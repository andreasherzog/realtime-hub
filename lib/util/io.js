var debug = require('debug');
var debugError = debug('realtime-hub:error');

exports.handleError = handleError;
exports.handleSocketError = handleSocketError;

function handleError(error, req){
    console.error(error);
    req.io.emit('error', {
        error: error
    });
}

function handleSocketError(error){
    debugError(error);
}
