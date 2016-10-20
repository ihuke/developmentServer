/**
 * toolbar for record data
 * 
 * @author huk/2016.10.20
 */
window.developmnetServer = window.developmnetServer || {};
(function (server) {
    var playBtn, stopBtn;
    /**
     * begin record
     */
    function play() {
        server.recording = true;
        taggle(playBtn);
        taggle(stopBtn);
    }

    /**
     * stop record
     */
    function stop() {
        server.recording = false;
        taggle(playBtn);
        taggle(stopBtn);
    }

    /**
     * save record result
     */
    function save() {
        if (Array.isArray(server.http) || Array.isArray(server.websocket)) {
            var result = generateContent();
            if (result) {
                downloadFile(result, function () {
                    server.http = [];
                    server.websocket = [];
                });
            }
        }
    }

    /**
     * generate file content
     * 
     * @param {any} server
     * @returns
     */
    function generateContent(server) {
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

    function taggle(element) {
        if (element.classList.contains('remove')) {
            element.classList.remove('remove');
        } else {
            element.classList.add('remove');
        }
    }

    registeEvent(playBtn = document.querySelector('.developmentServer_toolbar .js-play'), play);
    registeEvent(stopBtn = document.querySelector('.developmentServer_toolbar .js-stop'), stop);
    registeEvent(document.querySelector('.developmentServer_toolbar .js-download'), save);

})(window.developmnetServer);