const utils = require('../utils');
/*
 * xml2json 
 * 
 */
module.exports = exports = {
    type: 'xml2json',
    onRespone: (api, onResult, environment, isHttp) => {
        if (utils.isUndefined(api.file)) {
            return;
        } else {
            const Parser = require('xml2js').Parser,
                fs = require('fs');
            let parser = new Parser();

            fs.readFile(api.file, function (err, data) {
                if (err) {
                    environment.log(err);
                    next(err);
                } else {
                    parser.parseString(data, function (err, result) {
                        const value = onResult ? onResult(result) : result;
                        if(isHttp){
                            arguments[5].json(result);
                        }else{
                            arguments[4].send(result);
                        }
                    });
                }
            });
        }
    }
};