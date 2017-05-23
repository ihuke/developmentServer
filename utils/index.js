const path = require('path'),
    fs = require('fs');

/**
 * Utils tool
 * 
 * @class Utils
 * @author huk/2016.09.28
 */
class Utils {
    /**
     * set rootPath
     * 
     * @param {any} rootPath
     * 
     * @memberOf Utils
     */
    setRootPath(rootPath) {
        this.rootPath = rootPath;
    }

    /**
     * set current path
     * 
     * @param {any} extensionPath
     * 
     * @memberOf Utils
     */
    setCurrentPath(extensionPath) {
        this.extensionPath = extensionPath;
    }

    /**
     * get current path
     * 
     * @returns
     * 
     * @memberOf Utils
     */
    getCurrentPath() {
        return this.extensionPath;
    }

    /**
     * 
     * 
     * @param {any} filePath
     * @returns {fs.Stats}
     */
    isFileExists(filePath) {
        let isExists = true;
        try {
            fs.accessSync(filePath); //statSync
        } catch (error) {
            isExists = false;
        }

        return isExists;
    };

    /**
     * file or directory path
     * 
     * @param {any} toCheckPath
     * @returns
     * 
     * @memberOf Utils
     */
    getfsInfo(toCheckPath) {
        try {
            return fs.statSync(toCheckPath); //statSync
        } catch (error) {

        }
    }

    /**
     * generate absoult file path
     * support absoult path or relative path
     * 
     * @param {string} filePath
     * @param {string} rootPath
     * @returns {string}
     * 
     * @memberOf Utils
     */
    generateFilePath(filePath, rootPath) {
        let fileInfo = this.getfsInfo(filePath);
        if (fileInfo && fileInfo.isFile) {
            return filePath;
        } else {
            let truePath = path.resolve(rootPath, filePath);
            return this.generateFilePath(truePath, rootPath);
        }
    }

    /**
     * generate absoult directory path
     * 
     * @param {any} dirPath
     * @param {any} rootPath
     * @returns
     * 
     * @memberOf Utils
     */
    generateDirectoryPath(dirPath, rootPath) {
        let fileInfo = this.getfsInfo(filePath);
        if (fileInfo && fileInfo.isDirectory) {
            return dirPath;
        } else {
            let truePath = path.resolve(rootPath, dirPath);
            return this.generateDirectoryPath(truePath, rootPath);
        }
    }

    /**
     * get Json Config
     * 
     * @param {string} filePath
     * @returns {{}} 
     */
    importJson(filePath) {
        let Content = fs.readFileSync(filePath, {
            encoding: 'utf-8'
        });
        return JSON.parse(Content);
    }

    /**
     * read txt file
     * 
     * @param {any} filePath
     * 
     * @memberOf Utils
     */
    readFile(filePath) {
        let content = '';
        if (this.isFileExists(filePath)) {
            content = fs.readFileSync(filePath, {
                encoding: 'utf-8'
            });
        }

        return content;
    }

    /**
     * import module
     * 
     * @param {any} filePath
     * @returns
     * 
     * @memberOf Utils
     */
    importModule(filePath) {
        delete require.cache[filePath];
        return require(filePath);
    }

    /**
     * registe extention
     * 
     * @param {express} app
     * @param {httpServer} server
     * @param {{}} config
     * @param {{}} environment
     * @param {[]]} extentions
     * 
     * @memberOf Utils
     */
    registeExtentions(app, server, config, environment, extentions) {
        extentions.forEach(item => {
            const extention = this.checkAndImportModule(item.path, `../extention/${item}`);
            if (this.isFunction(extention)) {
                try{
                    extention(app, server, config, environment);
                }catch(error){
                    console.log('register ${item} failure.')
                    console.log(error);
                }
            }
        });
    }

    /**
     * registe express middleware
     * 
     * @param {express} app
     * @param {[]} middlewares
     * 
     * @memberOf Utils
     */
    registeMiddleWares(app, config, environment, middlewares) {
        middlewares.forEach(item => {
            const middleware = this.checkAndImportModule(item.path, `../middleware/${item}`);
            if (this.isFunction(middleware)) {
                app.use(middleware(app, config, environment));
            }
        });
    }

    /**
     * import processors
     * 
     * @param {any} config
     * @returns
     * 
     * @memberOf Utils
     */
    importProcessors(config) {
        if (!this.mockProcessors) {
            let result = {};
            const {
                processors
            } = config;

            if (processors) {
                processors.forEach(p => {
                    const processor = this.checkAndImportModule(p.path, `../processor/${p}`);
                    if (processor) {
                        result[processor.type] = processor.onResponse;
                    }
                });
            }

            this.mockProcessors = result;
        }

        return this.mockProcessors;
    }

    /**
     * check file path and import module
     * 
     * @param {any} filePath
     * @param {any} defaultPath
     * @returns
     * 
     * @memberOf Utils
     */
    checkAndImportModule(filePath, defaultPath) {
        // TODO: 执行路径不同于当前根目录
        let truePath = filePath ? this.generateFilePath(filePath, this.rootPath) : defaultPath;
        return this.importModule(truePath);
    }


    /**
     * check if function or not
     * 
     * @param {function} func
     * @returns
     * 
     * @memberOf Utils
     */
    isFunction(func) {
        return typeof func === 'function';
    }

    /**
     * Determines if a reference is undefined.
     * 
     * @param {any} data
     * @returns True if value is undefined
     * 
     * @memberOf Utils
     */
    isUndefined(data) {
        return typeof data === 'undefined';
    }
}

module.exports = new Utils();