(function ($) {
    var client,
        var factory = {
            get: get,
            post: post,
            socket: socket
        };

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

    function getChecked() {
        var items = document.querySelectorAll('input');
        for (var i = 0; i < items.length; i++) {
            if (items[i].checked) {
                return items[i];
            }
        }
    }

    function socket() {
        if (!client) {
            client = create('ws://localhost:8090');
        } else {
            sendMessage();
        }
    }

    function get() {
        $.get('/api/get', function (data) {
                console.log('/api/get result:');
                console.log(data);
            })
            .fail(function () {
                alert("error");
            });
    }

    function post() {
        $.post('/api/post', function (data) {
                console.log('/api/post result:');
                console.log(data);
            })
            .fail(function () {
                alert("error");
            });
    }

    document.querySelector('input').checked = "checked";
    document.querySelector('.run-button').addEventListener('click', function () {
        var type,
            item = getChecked();

        if (item) {
            type = item.dataset['type'];
            factory[type]();
        }
    });
})($);