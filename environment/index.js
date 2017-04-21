const vscode = require('vscode'),
    window = vscode.window;

/**
 * Environment Class
 * 
 * @class Environment
 * @author huk/2016.09.27
 */
class Environment {
    /**
     * Creates an instance of Environment.
     * 
     * @param {any} channel
     * 
     * @memberOf Environment
     */
    constructor(channel) {
        this.console = window.createOutputChannel(channel);
        this.statusBar = window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
    }

    log(message) {
        if (message) {
            this.console.appendLine(message);
        }
    }

    /**
     * 
     * @param {string} message
     */
    info(message) {
        info(message);
    }

    /**
     * 
     * @param {string} message
     */
    error(message) {
        error(message);
    }

    show() {
        this.console.show();
    }

    hide() {
        this.console.hide();
        this.statusBar.hide();
    }

    appendStatusBar(port) {
        this.statusBar.command = 'server.open';
        this.statusBar.tooltip = `Click here to open html in browser`;
        this.statusBar.text = `$(server) Port ${port}`;
        this.statusBar.show();
    }

    /**
     * get configuration from environment
     * 
     * @returns
     */
    getConfiguration() {
        return getVsConfiguration();
    }

    getRootPath(){
        return getWorkPath();
    }

    dispose() {
        this.console.dispose();
        this.statusBar.dispose();
        this.console = null;
        this.statusBar = null;
    }
}

function info(message) {
    if (message) {
        vscode.window.showInformationMessage(message);
    }
};

function error(message) {
    if (message) {
        vscode.window.showErrorMessage(message);
    }
};

/**
 * get configuration from environment
 * 
 * @returns
 */
function getVsConfiguration() {
    return vscode.workspace.getConfiguration('server') || {};
}

function getWorkPath(){
    return vscode.workspace.rootPath;
}

module.exports = {
    Environment: Environment,
    getRootPath: getWorkPath,
    getEnvironmentConfiguration: getVsConfiguration,
    error: error,
    info: info
};