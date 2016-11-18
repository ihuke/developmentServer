/**
 * XMLHttpRequest extend
 * 
 * @author huk/2016.10.16
 */
window.developmnetServer = window.developmnetServer || {};
(function (developmnetServer) {
    var READY_STATE_COMPLTETED = 4,
        RealXHRSend = XMLHttpRequest.prototype.send,
        RealXHROpen = XMLHttpRequest.prototype.open,
        cache = developmnetServer.http = developmnetServer.http || [];

    function isString(value) {
        return typeof value === 'string';
    }

    /**
     * 
     * Open(string method,string url,boolean asynch,String username,string password)
     */
    XMLHttpRequest.prototype.open = function () {
        if (arguments.length >= 2 && isString(arguments[0]) && isString(arguments[1])) {
            if (developmnetServer.recording) {
                cache.push({
                    method: arguments[0],
                    url: arguments[1]
                });
            }
        }

        RealXHROpen.apply(this, arguments);
    };

    /**
     * Override send method
     */
    XMLHttpRequest.prototype.send = function () {
        var item;
        if (developmnetServer.recording && cache.length) {
            item = cache[cache.length - 1];
            if (!item.request && arguments.length) {
                item.request = arguments[0];
            }
        }

        if (this.addEventListener) {
            var self = this;
            this.addEventListener("readystatechange", function () {
                if (this.readyState === READY_STATE_COMPLTETED && item) {
                    item.response = this.responseText;
                    developmnetServer.notify && developmnetServer.notify();
                    console.log(item);
                }
            }, false);
        } else {
            var realOnReadyStateChange = this.onreadystatechange;
            if (realOnReadyStateChange) {
                this.onreadystatechange = function () {
                    realOnReadyStateChange();
                };
            }
        }

        RealXHRSend.apply(this, arguments);
    };

})(window.developmnetServer);