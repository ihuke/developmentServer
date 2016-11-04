const vscode = require('vscode'),
    {
        Environment,
        info,
        error
    } = require('./environment'),
    Server = require('./server');

function activate(context) {
    let environment;
    const app = new Server(context.extensionPath);

    context.subscriptions.push(vscode.commands.registerCommand('server.start', () => {
        if (!vscode.workspace.rootPath) {
            error('No folders are open')
        } else {
            environment = new Environment('DevelopmentServer');
            app.start(environment)
                .then(message => {
                    if (message) {
                        info(message);
                    }
                }, error => {
                    if (error && error.message) {
                        environment.error(error.message);
                    }
                });
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('server.stop', () => {
        app.stop()
            .then(message => {
                if (message) {
                    environment.info(message);
                }
            }, error => {
                if (error && error.message) {
                    environment.error(error.message);
                }
            })
            .then(() => {
                environment.dispose();
                environment = null;
            });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('server.restart', () => {
        environment = new Environment('DevelopmentServer');
        app.restart(environment)
            .then(message => {
                if (message) {
                    environment.info(message);
                }
            }, error => {
                if (error && error.message) {
                    environment.error(error.message);
                }
            });
    }));
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;