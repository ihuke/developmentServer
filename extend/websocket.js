/**
 * WebSocket extend
 * 
 * @author huk/2016.10.16
 */
window.developmnetServer = window.developmnetServer || {};
(function (developmnetServer) {
    developmnetServer.websocket = developmnetServer.websocket || [];
    sendMethod = WebSocket.prototype.send;
    WebSocket.prototype.send = function () {
        if (developmnetServer.recording) {
            cache.push({
                url: this.url,
                request: arguments[0]
            });
        }

        if (this.addEventListener) {
            this.addEventListener('message', function (e) {
                if (developmnetServer.recording) {
                    var item = cache.pop();
                    if (!item.response && e && e.data) {
                        item.response = e.data;
                    }
                    console.log(item);
                }
            }, false);
        }

        sendMethod.apply(this, arguments);
    }
})(window.developmnetServer);