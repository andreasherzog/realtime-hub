
exports.handleError = handleError;

function handleError(error, req){
    console.error(error);
    req.io.emit('error', {
        error: error
    });
}
