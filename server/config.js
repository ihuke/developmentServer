const {
    getRootPath,
    getEnvironmentConfiguration
} = require('../environment'),
    utils = require('../utils'),
    path = require('path'),
    rootPath = getRootPath(),
    port = 80;

/**
 * get configuration from file: developmentServer.json 
 * 
 * @returns {{}}
 */
function getCustomerConfiguration() {
    const configFile = path.join(rootPath, 'devServer.json'),
        isExists = utils.isFileExists(configFile);

    const config = isExists ? utils.importJson(configFile) : {};
    if (config.directory) {
        config.directory = utils.generateDirectoryPath(config.directory, rootPath);
    }

    if (Array.isArray(config.watchDirs)) {
        let result = [];
        config.watchDirs.forEach(dir => {
            const path = utils.generatePath(dir, rootPath);
            if (path) {
                result.push(path);
            }
        });
    }

    return config;
}

/**
 * get default configuration
 * 
 * @returns {{}}
 */
function getDefaultConfiguration() {
    var config = require('../developmentServer.json');
    return config;
}

/**
 * get mock data configuration
 * default mock file is mock.js
 */
function getMockConfiguration(config) {
    if (config.mockFile) {
        let filePath = utils.generateFilePath(config.mockFile, rootPath);
        if (filePath) {
            let mockConfig = utils.importModule(filePath);
            if (mockConfig.websocket || mockConfig.http) {
                config.mock = mockConfig;
            } else {
                config.mock = {
                    http: mockConfig
                };
            }

            return mockConfig;
        }
    }
}

module.exports = function(parameter) {
    utils.setRootPath(rootPath);
    const environmentConfig = getEnvironmentConfiguration(),
        defaultConfig = getDefaultConfiguration(),
        customerConfig = getCustomerConfiguration();
    let config = {
        liveReload: true,
        port: environmentConfig.port || port,
        directory: rootPath,
        watchDirs: Array.isArray(customerConfig.watchDirs) ? customerConfig.watchDirs : (customerConfig.watchDirs ? [customerConfig.watchDirs] : [rootPath])
    };
    Object.assign(config, parameter || {}, customerConfig, defaultConfig);
    getMockConfiguration(config);
    return config;
};