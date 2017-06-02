const utils = require('../utils'),
    path = require('path');
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
module.exports = exports = function (app, config, environment) {
    var header = '<script src="/developmentServer/extend.js"></script><script src="/developmentServer/livereload.js"></script><link rel="stylesheet" media="screen" href="/developmentServer/toolbar/toolbar.css">',
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

    function inject(body, host) {
        return injectBody(injectHeader(body, host), host);
    }

    function injectHeader(body, host) {
        var rule = /<head>/;
        if (rule.test(body)) {
            body = body.replace(rule, function (w) {
                return w + header;
            });
        }
        return body;
    }

    function injectBody(body, host) {
        var _body = body;
        let content = utils.readFile(path.join(utils.getCurrentPath(), "extend/toolbar/toolbar.html"))
        rules.some(function (rule) {
            if (rule.match.test(body)) {
                _body = body.replace(rule.match, function (w) {
                    return rule.fn(w, content);
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
    app.use('/developmentServer', express.static(path.join(utils.getCurrentPath(), "extend")));
    return function (req, res, next) {
        var runPatches = true,
            writeHead = res.writeHead,
            write = res.write,
            end = res.end,
            host = req.headers.host.split(':')[0];

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
                    res.push(inject(body, host));
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
                res.data = inject(res.data, host);
            }
            if (res.data !== undefined && !res._header) {
                res.setHeader('content-length', Buffer.byteLength(res.data, encoding));
            }
            end.call(res, res.data, encoding);
        };

        next();
    };

};