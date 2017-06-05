(function ($) {
    var client,
        messageList,
        factory = {
            get: get,
            post: post,
            socket: socket
        },
        model = {
            GET: 'HTTP-GET',
            POST: 'HTTP-POST',
            WS: 'WebSocket'
        },
        type = {
            FAILURE: 0,
            SUCCESS: 1
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
        if (client.readyState === 1) {
            client.send(JSON.stringify({
                command: 'add',
                data: {
                    v1: 5,
                    v2: 8
                }
            }));
        } else {
            updateElement(model.WS, type.FAILURE, 'WebSocket is CLOSED');
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
            var temp = JSON.parse(e.data);
            console.log(e.data);
            updateElement(model.WS, type.SUCCESS, 'Value is ' + temp.result);
        }
    }

    function getTime() {
        var time = new Date();
        var hour = time.getHours(),
            minute = time.getMinutes(),
            second = time.getSeconds();
        return (hour < 10 ? ('0' + hour) : hour) + ':' +
            (minute < 10 ? ('0' + minute) : minute) + ':' +
            (second < 10 ? ('0' + second) : second);
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
        $.get('/api/user', function (result) {
                console.log('/api/user result:');
                console.log(result);
                updateElement(model.GET, type.SUCCESS, 'User name is ' + result.data.name);
            })
            .fail(function () {
                updateElement(model.GET, type.FAILURE, 'HTTP-GET is failure');
            });
    }

    function post() {
        $.post('/api/update', function (result) {
                console.log('/api/update result:');
                console.log(result);
                updateElement(model.POST, type.SUCCESS, 'Register User Tom ' + (result.code === 200 ? 'success' : 'failed'));
            })
            .fail(function () {
                updateElement(model.POST, type.FAILURE, 'HTTP-POST is failure');
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

    function updateElement(model, type, data) {
        var time = getTime(),
            li = document.createElement('li'),
            container = document.createElement('div');
        container.innerHTML = '<div class="message-title"><span>' + time + '</span><span style="margin-left:3px">' +
            model + '</span></div><div class="message-body">' + (type === 1 ? '[Server] ' : '<span style="color:red">[Error] </span>') + data + '</div>';
        li.appendChild(container);
        messageList = messageList || document.querySelector('.message-list');
        messageList.appendChild(li);
        li.scrollIntoView(false);
    }
})($);