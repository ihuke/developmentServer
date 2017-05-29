const fs = require('fs'),
    path = require('path');
//environment = require('../environment');
/**
 * livereload extention
 * 
 * @param {any} app
 * @param {httpServer} server
 * @param {any} config
 * @param {any} environment
 * @author huk/2016.09.27
 */
module.exports = exports = function (app, server, config, environment) {
    const {
        watchDirs
    } = config,
    port = 35729;

    if (Array.isArray(watchDirs)) {
        const wsServer = createWSServer(config.livePort || port, server),
            watch = require('node-watch');
        
        wsServer.on('connection', socket => {
            socket.send(JSON.stringify({
                'command': 'hello',
                'protocols': ['http://livereload.com/protocols/official-7'],
                'id': 1,
                'name': 'name',
                'version': "version"
            }));
            socket.on('message', message => {
                console.log(`websocket received:${message}`);
            });
        });

        watchDirs.forEach(function (dir) {
            watch(dir, function (file) {
                if (app.liveReload || config.liveReload) {
                    file = path.relative(dir, file);
                    sendCommand(wsServer, {
                        command: 'reload',
                        path: file,
                        liveCSS: true
                    });
                }
            });
        });

        watchDirs.forEach(item => {
            console.log(`livereload watch:${item}`);
        });
    }
};

function createWSServer(port, server) {
    let WebSocket = require('ws').Server,
        ws = new WebSocket({
            port
        });

    return ws;
}

function sendCommand(wsServer, command) {
    let temp = JSON.stringify(command);
    wsServer.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(temp);
        }
    });
}