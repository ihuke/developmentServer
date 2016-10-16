/**
 * socketio extention
 * 
 * @param {any} app
 * @param {httpServer} server
 * @param {any} config
 * @param {any} environment
 * @author huk/2016.09.27
 */
module.exports = exports = function (app, server, config, environment){
    const io = require('socket.io').listen(app.server);
        io.sockets.on('connection', function (socket) {
            environment.log('websocket is connected');
            socket.on('message', function (data) {
                console.log(data);
            });
        });

        //TODO: set socket.io by config
}