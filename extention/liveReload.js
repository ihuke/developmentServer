/**
 * livereload extention
 * 
 * @param {any} app
 * @param {httpServer} server
 * @param {any} config
 * @param {any} environment
 * @author huk/2016.09.27
 */
module.exports = exports = function(app, server, config, environment) {
  const { watchDirs } = config;

  if (Array.isArray(watchDirs)) {
    app.use(
      require("connect-livereload")({
        port: 35729
      })
    );
    /*
    var livereload = require("easy-livereload");
    app.use(
      livereload({
        port: 35729,
        app: app,
        watchDirs: watchDirs,
        checkFunc: function(x) {
          return /\.(css|js|html|htm)$/.test(x);
        }
      })
    );
    */

    watchDirs.forEach(item => {
      environment.log(`livereload watch:${item}`);
    });
  }
};
