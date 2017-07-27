const fs = require('fs'),
    path = require('path');

/**
 * livereload extention
 * 
 * @param {any} app
 * @param {httpServer} server
 * @param {any} config
 * @param {any} environment
 * @author huk/2016.09.27
 */
module.exports = exports = function(app, server, config, environment) {
    const {
        watchDirs
    } = config,
    port = 35729;
    let isChanged = false,
        wsServer;

    if (Array.isArray(watchDirs)) {
        wsServer = createWSServer(config.livePort || port, server);
        const watch = require('node-watch');

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

        watchDirs.forEach(function(dir) {
            watch(dir, {
                recursive: true
            }, function(evt, file) {
                if (app.liveReload || config.liveReload) {
                    isChanged = false;
                    if (checkFile(file)) {
                        file = path.relative(dir, file);
                        sendCommand(wsServer, {
                            command: 'reload',
                            path: file,
                            liveCSS: true
                        });
                    }
                } else {
                    isChanged = true;
                }
            });

            console.log(`livereload watch:${dir}`);
        });

        return function(status) {
            if (typeof status === 'undefined') {
                if (wsServer) {
                    wsServer.close();
                    wsServer = null;
                }
            } else if (isChanged) {
                isChanged = false;
                sendCommand(wsServer, {
                    command: 'reload',
                    path: file,
                    liveCSS: true
                });
            }
        };
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

function checkFile(x) {
    return /\.(css|js|html|htm)$/.test(x);
}