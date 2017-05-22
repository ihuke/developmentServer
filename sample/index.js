(function ($) {
    var client;

    function create(uri) {
        var ws = new WebSocket(uri);
        ws.onopen = handleOpen;
        ws.onclose = handleClose;
        ws.onerror = handleError;
        ws.onmessage = handleMessage;
        return ws;
    }

    function handleOpen(e) {
        console.log('[socket]socket opened.');
        initialized = true;
        sendMessage();
    }

    function sendMessage() {
        if (client) {
            client.send(JSON.stringify({
                aa: 1,
                bb: 2
            }));
        }
    }

    function handleClose(e) {
        console.log('[socket]socket closed:code[' + e.code + '], reason[' + e.reason + '], closed[' + e.wasClean + ']');
    }

    function handleError(e) {
        console.log('[socket]socket error.');
    }

    function handleMessage(e) {
        if (e && e.data) {
            console.log(e.data);
        }
    }

    document.querySelector('.ws-mock').addEventListener('click', function () {
        if (!client) {
            client = create('ws://localhost:8090');
        } else {
            sendMessage();
        }
    });

    document.querySelector('.http-mock')
        .addEventListener('click', function () {
            if (!client) {
                client = create('ws://localhost:8090');
            } else {
                sendMessage();
            }
        });

    document.querySelector('')
        .addEventListener('click', function () {
            $.get('/api/get', function (data) {
                    console.log('/api/get result:');
                    console.log(data);
                })
                .fail(function () {
                    alert("error");
                });
        });
})($);