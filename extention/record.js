const utils = require('../utils');
/**
 * record request/response function extention
 * inject js/css/html
 * 
 * @param {any} app
 * @param {httpServer} server
 * @param {any} config
 * @param {any} environment
 * @author huk/2016.10.17
 */
module.exports = exports = function (app, server, config, environment) {
    var toolbar = '<div class="developmentServer_toolbar"><div class="developmentServer_toolbar_item js-play"><div class="play icon"></div></div><div class="developmentServer_toolbar_item js-stop remove"><div class="stop icon"></div></div><div class="developmentServer_toolbar_item js-download"><div class="download icon"></div></div></div>',
        header = '<script src="/developmentServer/ajax.js"></script><script src="/developmentServer/websocket.js"></script>',
        ignore = [/\.js(\?.*)?$/, /\.css(\?.*)?$/, /\.svg(\?.*)?$/, /\.ico(\?.*)?$/,
            /\.woff(\?.*)?$/, /\.png(\?.*)?$/, /\.jpg(\?.*)?$/, /\.jpeg(\?.*)?$/, /\.gif(\?.*)?$/, /\.pdf(\?.*)?$/,
            /\.json(\?.*)?$/
        ],
        rules = [{
            match: /<\/body>(?![\s\S]*<\/body>)/i,
            fn: prepend
        }, {
            match: /<\/html>(?![\s\S]*<\/html>)/i,
            fn: prepend
        }];

    var regex = (function () {
        var matches = rules.map(function (item) {
            return item.match.source;
        }).join('|');

        return new RegExp(matches, 'i');
    })();

    function prepend(w, s) {
        return s + w;
    }

    function append(w, s) {
        return w + s;
    }

    function isHtmlFormat(str) {
        if (!str) return false;
        return /<[:_-\w\s\!\/\=\"\']+>/i.test(str);
    }

    function exists(body) {
        if (!body) return false;
        return regex.test(body);
    }

    function isInject(body) {
        if (!body) return false;
        return (~body.lastIndexOf('/developmentServer/extend.js'));
    }

    function snap(body, host) {
        var _body = body;
        rules.some(function (rule) {
            if (rule.match.test(body)) {
                _body = body.replace(rule.match, function (w) {
                    return rule.fn(w, snippet(host));
                });
                return true;
            }
            return false;
        });
        return _body;
    }

    function accept(req) {
        var ha = req.headers["accept"];
        if (!ha) return false;
        return (~ha.indexOf("html"));
    }

    function check(str, arr) {
        if (!str) return true;
        return arr.some(function (item) {
            if ((item.test && item.test(str)) || ~str.indexOf(item)) return true;
            return false;
        });
    }

    const express = require('express');
    app.use('/developmentServer', express.static(path.join(__dirname, "../extend")));
    return function livereload(req, res, next) {
        var runPatches = true;
        var writeHead = res.writeHead;
        var write = res.write;
        var end = res.end;
        var host = req.headers.host.split(':')[0];

        if (res._injectRecord) {
            return next();
        }
        res._injectRecord = true;

        if (!accept(req) || check(req.url, ignore)) {
            return next();
        }

        res.push = function (chunk) {
            res.data = (res.data || '') + chunk;
        };

        res.write = function (string, encoding) {
            if (!runPatches) {
                return write.call(res, string, encoding);
            }

            if (string !== undefined) {
                var body = string instanceof Buffer ? string.toString(encoding) : string;
                if (exists(body) && !isInject(res.data)) {
                    res.push(snap(body, host));
                    return true;
                }
                else {
                    res.push(body);
                    return true;
                }
            }
            return true;
        };

        res.writeHead = function () {
            if (!runPatches) return writeHead.apply(res, arguments);

            var headers = arguments[arguments.length - 1];
            if (typeof headers === 'object') {
                for (var name in headers) {
                    if (/content-length/i.test(name)) {
                        delete headers[name];
                    }
                }
            }

            if (res.getHeader('content-length')) res.removeHeader('content-length');

            writeHead.apply(res, arguments);
        };

        res.end = function (string, encoding) {
            if (!runPatches) {
                return end.call(res, string, encoding);
            }

            res.write(string);
            runPatches = false;

            if (isHtmlFormat(res.data) && exists(res.data) && !isInject(res.data)) {
                res.data = snap(res.data, host);
            }
            if (res.data !== undefined && !res._header) {
                res.setHeader('content-length', Buffer.byteLength(res.data, encoding));
            }
            end.call(res, res.data, encoding);
        };

        next();
    };

};