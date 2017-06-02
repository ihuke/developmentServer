(function ($) {
    var client,
        messageList,
        factory = {
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
                command: 'ws',
                data: 'request'
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
            updateElement(e.data.result);
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
        $.get('/api/get', function (result) {
                console.log('/api/get result:');
                console.log(result);
                updateElement(result.data);
            })
            .fail(function () {
                alert("http[get] error!");
            });
    }

    function post() {
        $.post('/api/post', function (result) {
                console.log('/api/post result:');
                console.log(result);
                updateElement(result.warp.data);
            })
            .fail(function () {
                alert("http[post] error!");
            });
    }

    document.querySelector('input').checked = true;
    document.querySelector('.run-button').addEventListener('click', function () {
        var type,
            item = getChecked();

        if (item) {
            type = item.dataset['type'];
            factory[type]();
        }
    });

    function updateElement(data){
        var li = document.createElement('li');
        var container = document.createElement('div');
        container.innerHTML = '<div>' + data + '</div>';
        li.appendChild(container);
        messageList = messageList || document.querySelector('.message-list');
        messageList.appendChild(li);
        li.scrollIntoView(false);
    }
})($);