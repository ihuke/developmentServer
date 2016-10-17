/**
 * WebSocket extend
 * 
 * @author huk/2016.10.16
 */
(function () {
    var cache = [];
    sendMethod = WebSocket.prototype.send;
    WebSocket.prototype.send = function () {
        cache.push({
            url: this.url,
            request: arguments[0]
        });
        
        if (this.addEventListener) {
            this.addEventListener('message', function (e) {
                var item = cache.pop();
                if (!item.response && e && e.data) {
                    item.response = e.data;
                }
                console.log(item);
            }, false);
        }

        sendMethod.apply(this,arguments);
    }
})();