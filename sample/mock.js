module.exports = exports = {
    http: {
        '/api/user': {
            method: 'get',
            type: 'jsonp',
            response: {
                data : {
                    name: 'Edward'
                },
                status : 0
            }
        },
        '/api/update': {
            method: 'post',
            response: {
                command: 'updated'
            },
            onResult: function (result) {
                return {
                    code: 200,
                    warp: result
                };
            }
        }
    },
    websocket: {
        data: [{
            request: {
                command: 'add',
                data: {
                    v1 : 5,
                    v2 : 8
                }
            },
            response: {
                result: 13
            }
        }]
    }
}