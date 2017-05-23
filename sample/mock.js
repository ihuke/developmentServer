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
                a: 1,
                b: 2
            }
        },
        '/api/post': {
            method: 'post',
            response: {
                r: 1
            },
            onResult: function (result) {
                return {
                    statue: 100,
                    data: result
                };
            }
        }
    },
    websocket: {
        data: [{
            request: {
                aa: 1,
                bb: 2
            },
            response: {
                test: 'ok'
            }
        }]
    }
}