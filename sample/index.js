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
    var d = JSON.stringify({
        aa: 1,
        bb: 2
    });
    client.send(d);
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

$('.ws-mock').click(function () {
    if (!client) {
        client = create('ws://localhost:8090');
    }
});

(function () {
    $('.http-mock').click(function () {
        $.get('/api/get', function (data) {
                console.log('/api/get result:');
                console.log(data);
            })
            .fail(function () {
                alert("error");
            });
    });
})();