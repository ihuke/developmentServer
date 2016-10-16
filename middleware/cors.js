/**
 * cors middleware
 * 
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @author huk/2016.09.28
 */
module.exports = exports = function (app, config, environment) {
    return (req, res, next) => {
        var method = req.method && req.method.toUpperCase && req.method.toUpperCase();
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
            'Access-Control-Allow-Credentials': 'true'
        });

        if (method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
        } else {
            next();
        }
    };
};