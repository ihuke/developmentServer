/**
 * WebSocket extend
 * 
 * @author huk/2016.10.16
 */
window.developmentServer = window.developmentServer || {};
(function (developmentServer) {
    var cache = developmentServer.websocket = developmentServer.websocket || [],
        sendMethod = WebSocket.prototype.send;

    WebSocket.prototype.send = function () {
        if (developmentServer.recording) {
            cache.push({
                url: this.url,
                request: arguments[0]
            });
        }

        if (this.addEventListener) {
            this.addEventListener('message', function (e) {
                if (developmentServer.recording && cache.length) {
                    var item = cache[cache.length - 1];
                    if (!item.response && e && e.data) {
                        item.response = e.data;
                        developmentServer.notify && developmentServer.notify();
                    }
                    console.log(item);
                }
            }, false);
        }

        sendMethod.apply(this, arguments);
    }
})(window.developmentServer);