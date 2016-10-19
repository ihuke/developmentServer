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
    var ignore = [/\.js(\?.*)?$/, /\.css(\?.*)?$/, /\.svg(\?.*)?$/, /\.ico(\?.*)?$/,
        /\.woff(\?.*)?$/, /\.png(\?.*)?$/, /\.jpg(\?.*)?$/, /\.jpeg(\?.*)?$/, /\.gif(\?.*)?$/, /\.pdf(\?.*)?$/,
        /\.json(\?.*)?$/
    ];

    var include = [/.*/];
    var html = _html;
    var rules = [{
        match: /<\/body>(?![\s\S]*<\/body>)/i,
        fn: prepend
    }, {
        match: /<\/html>(?![\s\S]*<\/html>)/i,
        fn: prepend
    }, {
        match: /<\!DOCTYPE.+?>/i,
        fn: append
    }];
    var disableCompression = false;
    //var port = opt.port || 35729;

    function snippet(host) {
        var src = opt.src || '//' + host + ':' + port + '/livereload.js?snipver=1';
        return '<script src="' + src + '" async="" defer=""></script>';
    }

    // helper functions
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

    function _html(str) {
        if (!str) return false;
        return /<[:_-\w\s\!\/\=\"\']+>/i.test(str);
    }

    function exists(body) {
        if (!body) return false;
        return regex.test(body);
    }

    function snip(body) {
        if (!body) return false;
        return (~body.lastIndexOf("/livereload.js"));
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
    app.use('/puer', express["static"](path.join(__dirname, "../vendor")));
    return function livereload(req, res, next) {
        var host = req.headers.host.split(':')[0];
        if (res._injectRecord) {
            return next();
        }
        res._injectRecord = true;

        if (!accept(req) || !check(req.url, include) || check(req.url, ignore)) {
            return next();
        }

        var runPatches = true;
        var writeHead = res.writeHead;
        var write = res.write;
        var end = res.end;

        res.push = function (chunk) {
            res.data = (res.data || '') + chunk;
        };

        res.inject = res.write = function (string, encoding) {
            if (!runPatches) {
                return write.call(res, string, encoding);
            }

            if (string !== undefined) {
                var body = string instanceof Buffer ? string.toString(encoding) : string;
                // If this chunk must receive a snip, do so
                if (exists(body) && !snip(res.data)) {
                    res.push(snap(body, host));
                    return true;
                }
                // If in doubt, simply buffer the data for later inspection (on `end` function)
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

            res.inject(string);
            runPatches = false;

            if (html(res.data) && exists(res.data) && !snip(res.data)) {
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