const utils = require('../utils'),
    KEYS = {
        Undefined: 0,
        String: 1,
        Array: 2
    }

/**
 * websocket mock extention
 * 
 * @param {any} app
 * @param {httpServer} server
 * @param {any} config
 * @param {any} environment
 * @author huk/2016.09.27
 */
module.exports = exports = function (app, server, config, environment) {

    if (utils.isUndefined(config.mock) || utils.isUndefined(config.mock.websocket) ||
        utils.isUndefined(config.mock.websocket.data)) {
        environment.log('[websocket]mock is undefined.');
        return;
    }

    const websocket = config.mock.websocket,
        WebSocket = require('ws').Server,
        wsServer = new WebSocket({
            server: server
        }),
        mock = generateWebSocketMocks(websocket),
        processors = utils.importProcessors(config);

    wsServer.on('connection', socket => {
        environment.log('[websocket]connected');

        socket.on('message', message => {
            environment.log('websocket received: %s', message);
            onMessage(message, socket, mock, processors, environment);
        });
    });
}

/**
 * generate mock data by key value
 * 
 * @param {any} config
 * @returns
 */
function generateWebSocketMocks(config) {
    let type, mock = {};
    const keys = config.keys;
    if (config && Array.isArray(config.data)) {
        if (utils.isUndefined(keys)) {
            config.data.forEach(item => {
                item.$$key = utils.isUndefined(item.request) ? 'undefined' : JSON.stringify(item.request);
                mock[item.$$key] = item;
            });
            type = KEYS.Undefined;
        } else if (typeof keys === 'string') {
            config.data.forEach(item => {
                item.$$key = utils.isUndefined(item.request) ? '' : item.request[keys];
                mock[item.$$key] = item;
            });
            type = KEYS.String;
        } else if (Array.isArray(keys)) {
            config.data.forEach(item => {
                item.$$key = getRequestKeys(item.request, keys);
                mock[item.$$key] = item;
            });
            type = KEYS.Array;
        }
    }

    return {
        type: type,
        data: mock,
        key: keys,
        onResponse: config.onResponse,
        onResult: config.onResult
    };
}

/**
 * deal with result on receive request
 * 
 * @param {any} message
 * @param {any} socket
 * @param {any} mock
 * @param {any} environment
 */
function onMessage(message, socket, mock, processors, environment) {
    const {
        type,
        data,
        key
    } = mock;
    let item, obj, keyValue;

    if (type === KEYS.Undefined) {
        keyValue = message;
    } else {
        obj = JSON.parse(message);
        if (type === KEYS.String) {
            keyValue = obj[key];
        } else if (type === KEYS.Array) {
            keyValue = getValueByKeys(obj, key);
        }
    }

    if (keyValue && data[keyValue]) {
        item = data[keyValue];
        if (utils.isFunction(mock.onResponse)) {
            mock.onResponse(item, mock.onResult, environment, socket);
        } else if (item.type && processors[item.type]) {
            processors[item.type](item.response, mock.onResult, environment, false, socket);
        } else {
            messageProcessor(item, mock.onResult, environment, socket);
        }
    } else {
        environment.log('[websocket mock]keyValue is null.');
    }
}

/**
 * default return json data
 * 
 * @param {any} item
 * @param {any} onResult
 * @param {any} environment
 * @param {any} socket
 */
function messageProcessor(item, onResult, environment, socket) {
    const response = item.response ? item.response : {};
    onResult = item.onResult ? item.onResult : onResult;
    if (Array.isArray(response)) {
        response.forEach(item => {
            sendData(socket, item, onResult);
        })
    } else {
        sendData(socket, response, onResult);
    }
}

function sendData(socket, data, beforeResult) {
    if (typeof data === 'undefined') {
        data = {
            error: 'data is undefined.'
        };
    }
    const result = beforeResult ? beforeResult(data) : data;
    let temp = JSON.stringify(result);
    socket.send(temp);
}

function getRequestKeys(data, keys) {
    return keys.resuce((previous, key) => {
        return previous ? (previous + '$$' + getValue(data, key)) : getValue(data, key);
    }, '');
}

function getValue(item, key) {
    return utils.isUndefined(item) ? '' : item[key];
}