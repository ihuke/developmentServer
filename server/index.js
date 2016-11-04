const express = require('express'),
    open = require('open'),
    utils = require('../utils'),
    getConfiguration = require('./config');

/**
 * WebServer
 * 
 * @class Server
 */
module.exports = class Server {
    constructor(extensionPath) {
        utils.setCurrentPath(extensionPath);
    }

    /**
     * initilize
     * 
     * @param {Environment environment
     */
    initilize(environment) {
        this.environment = environment;

        if (!this.config) {
            this.config = getConfiguration();
        }
    }

    /**
     * start webServer
     * 
     * @returns Promise
     * 
     * @memberOf Server
     */
    start(environment) {
        this.initilize(environment);
        return new Promise((resolve, reject) => {
            const {
                port,
                directory
            } = this.config;

            if (this.server) {
                const message = 'Development server already started';
                this.environment.log(message)
                reject(new Error(message));
            } else {
                const app = express();
                this.registePreExtentions(app)
                this.registeMiddleware(app);
                app.use(express.static(directory));
                this.server = app.listen(port, () => {
                        this.environment.appendStatusBar(port);
                        this.environment.log(`Development server start on port ${port}\n\nhost path:${directory}`);
                        this.environment.show();
                        this.registePostExtentions(app, this.server);
                        // this.supportWebSocket(this.server);
                        resolve(`Development server start on port ${port}`);
                        this.open();
                    })
                    .on('error', error => {
                        this.environment.log(`Failed to start development server due to ${error.message}`);
                        reject(error);
                        this.server = null;
                    })
                    .on('request', (req, res) => {
                        this.environment.log(`${req.method} ${req.originalUrl}`);
                    });
            }
        });
    }

    /**
     * Stop webServer
     * 
     * @returns Promise
     * 
     * @memberOf Server
     */
    stop() {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.environment.log(`Development server is stopping`);
                this.server.close(() => {
                    this.dispose();
                    resolve('Development server stopped');
                });
            } else {
                reject(new Error('Development server is not running!'));
            }
        });
    }

    restart(environment) {
        return this.stop()
            .then(() => {
                return this.start(environment);

            }, () => {
                return this.start(environment);
            });
    }

    /**
     * registe Pre Extentions
     * 
     * @param {any} app
     */
    registePreExtentions(app) {
        const {
            extentions: {
                pre
            }
        } = this.config;
        utils.registeExtentions(app, null, this.config, this.environment, pre);
    }

    /**
     * registe Post Extentions
     * 
     * @param {any} app
     * @param {any} server
     */
    registePostExtentions(app, server) {
        const {
            extentions: {
                post
            }
        } = this.config;
        utils.registeExtentions(app, server, this.config, this.environment, post);
    }

    /**
     * registe app middleware
     * 
     * @param {any} app
     */
    registeMiddleware(app) {
        const {
            middlewares
        } = this.config;
        utils.registeMiddleWares(app, this.config, this.environment, middlewares);
    }

    /**
     * dynamic update mock data 
     * 
     * @memberOf server
     */
    update() {

    }

    /**
     * auto open index.html
     * 
     * 
     * @memberOf Server
     */
    open() {
        const {
            port
        } = this.config;
        open(`http://localhost:${port}/`);
    }

    dispose() {
        this.server = null;
        this.config = null;
        //this.environment.dispose();
        //this.environment = null;
    }
}