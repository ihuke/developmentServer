/**
 * toolbar for record data
 * play/stop save http.count websocket.count
 * 
 * @author huk/2016.10.20
 */
window.developmnetServer = window.developmnetServer || {};
(function (server) {
    var playBtn, stopBtn, http, websocket;
    /**
     * begin record
     */
    function play() {
        server.recording = true;
        toggle(playBtn, stopBtn);
    }

    /**
     * stop record
     */
    function stop() {
        server.recording = false;
        toggle(playBtn, stopBtn);
    }

    /**
     * save record result
     */
    function save() {
        if (Array.isArray(server.http) || Array.isArray(server.websocket)) {
            var result = generateContent();
            if (result) {
                downloadFile(result, function () {
                    server.http.length = 0;
                    server.websocket.length = 0;
                    update();
                });
            }
        }
    }

    /**
     * update data count
     */
    function update() {
        http && (http.innerHTML = server.http.length.toString());
        websocket && (websocket.innerHTML = server.websocket.length.toString());
    }

    /**
     * generate file content
     * 
     * @param {any} server
     * @returns
     */
    function generateContent() {
        var result = {};
        if (server.http) {
            result.http = server.http;
        }
        if (server.websocket) {
            result.websocket = server.websocket;
        }
        return JSON.stringify(result);
    }

    /**
     * download file
     * 
     * @param {any} result
     * @param {any} callback
     */
    function downloadFile(result, callback) {
        var a = document.createElement('a');
        a.setAttribute('download', 'result.js');
        a.setAttribute('target', '_blank');
        a.setAttribute('style', 'display:none;');
        a.href = 'data:text/plain,' + result;
        document.body.appendChild(a);
        setTimeout(function () {
            if (a.click) {
                a.click();
            } else if (document.createEvent) {
                var eventObj = document.createEvent('MouseEvents');
                eventObj.initEvent('click', true, true);
                a.dispatchEvent(eventObj);
            }
            document.body.removeChild(a);

            if (callback) {
                callback();
            }
        }, 100);
    }

    function registeEvent(element, func) {
        element.addEventListener('click', func, false);
    }

    /**
     * toggle element statue
     */
    function toggle() {
        var element;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            element = arguments[i];
            if (element.classList.contains('remove')) {
                element.classList.remove('remove');
            } else {
                element.classList.add('remove');
            }
        }
    }

    /**
     * triggle when received data.
     */
    server.notify = function () {
        update();
    };

    function onReady(callback) {
        if (
            document.readyState === "complete" ||
            (document.readyState !== "loading" && !document.documentElement.doScroll)
        ) {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    onReady(function () {
        http = document.querySelector('.developmentServer_toolbar .js-http');
        websocket = document.querySelector('.developmentServer_toolbar .js-ws');
        registeEvent(playBtn = document.querySelector('.developmentServer_toolbar .js-play'), play);
        registeEvent(stopBtn = document.querySelector('.developmentServer_toolbar .js-stop'), stop);
        registeEvent(document.querySelector('.developmentServer_toolbar .js-download'), save);
        update();
    });
})(window.developmnetServer);