module.exports = exports = {
    http: {
        '/api/get': {
            method: 'get',
            info: {
                summary: 'It\'s a test api',
                parameter: {

                }
            },
            type: 'jsonp',
            response: {
                data : 'HTTP[get] Result.',
                status : 0
            }
        },
        '/api/post': {
            method: 'post',
            response: {
                data: 'HTTP[post] Result.',
                status: 0
            },
            onResult: function (result) {
                return {
                    code: 100,
                    warp: result
                };
            }
        }
    },
    websocket: {
        data: [{
            request: {
                command: 'ws',
                data: 'request'
            },
            response: {
                result: 'WebSocket Result'
            }
        }]
    }
}