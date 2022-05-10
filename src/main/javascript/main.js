const {
    app, BrowserWindow, dialog, ipcMain
} = require('electron');
const getPort = require('get-port');
const decompress = require('decompress');
const child_process = require('child_process');
const requestPromise = require('minimal-request-promise');
const log = require('electron-log');
let i18n;
const path = require('path');
const fs = require("fs");
let mainWindow = null;
let loading = null;
let serverProcess = null;
let allowClose = false;
//const jreFolder = 'jdk8u265-b01-jre';
//const jreFolder = 'jdk-11.0.9.1+1';
const jreFolder = 'jdk-11.0.9.1+1-jre';


function error_log(exception) {
    console.log(exception)
    console.log(exception.stack)
    fs.appendFile('error.log', exception.stack + "\n", (err) => {
        if (err) throw err;
    });
}

try {
    const gotTheLock = app.requestSingleInstanceLock();

    const showApplication = function (appUrl) {
        mainWindow = new BrowserWindow({
            title: i18n.__('application-name')
            , show: false
            , width: 1200
            , height: 800
            , frame: true
          , webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        mainWindow.setMenu(null);
        mainWindow.loadURL(appUrl);

        mainWindow.once('ready-to-show', () => {
            loading.hide();
            mainWindow.show();
        });
        mainWindow.on('closed', function () {
            mainWindow = null;
            app.quit();
        });
        mainWindow.on('close', function (e) {
            if (serverProcess && !allowClose) {
                dialog.showMessageBox(this, {
                    type: 'question'
                    , buttons: [i18n.__('yes'), i18n.__('no')]
                    , title: i18n.__('confirm')
                    , message: i18n.__("are-you-sure-you-want-to-quit")
                }).then(result => {
                    if (result.response === 0) {
                        allowClose = true;
                        app.quit();
                    }
                });
                e.preventDefault();
            }
        });
    };
    const awaitStartUp = function (appUrl, callback) {
        requestPromise.get(appUrl).then(function (response) {
            callback();
        }, function (response) {
            setTimeout(function () {
                awaitStartUp(appUrl, callback);
            }, 15000);
        });
    };
    const focusSecondInstance = function () {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }
                mainWindow.focus();
            }
        })
    };
    const getJavaFile = function () {
        var files = fs.readdirSync(app.getAppPath() + "/java/");
        var filename = null;
        for (var i in files) {
            if (path.extname(files[i]) === ".jar") {
                filename = path.basename(files[i]);
                break;
            }
        }
        if (!filename) {
            throw new Error("There is no JAR file in ./java/ !");
        }
        console.log('GOT JAVA FILE: ', filename);
        return filename;
    };
    const showStartUpErrorMessage = function () {
        setTimeout(function () {
            dialog.showMessageBox(null, {
                type: 'error'
                , buttons: [i18n.__('ok')]
                , title: i18n.__("java-runtime-not-available")
                , message: i18n.__("java-runtime-not-available-long")
            });
        }, 200);
    }
    const spawnServerProcess = function (port) {
        var filename = getJavaFile();
        platform = process.platform;
        if (platform === 'win32') {
            console.log(app.getAppPath() + path.sep + 'java' + path.sep + jreFolder + path.sep + 'bin' + path.sep + 'java' + ' -jar' + ' -Dvaadin.productionMode=true' + ' -Dserver.port=' + port + ' '+app.getAppPath() + path.sep + 'java' + path.sep + filename + ' --logging.file=application.log');
            return child_process.exec(app.getAppPath() + path.sep + 'java' + path.sep + jreFolder + path.sep + 'bin' + path.sep + 'java' + ' -jar' + ' -Dvaadin.productionMode=true' + ' -Dserver.port=' + port + ' '+app.getAppPath() + path.sep + 'java' + path.sep + filename + ' --logging.file=application.log')
                .on('error', function (code, signal) {
                '+ path.sep +'
                showStartUpErrorMessage();
            });
        } else if (platform === 'darwin') {
            child_process.exec('chmod +X ' + app.getAppPath() + '/java/' + jreFolder + '/Contents/Home/bin/' + 'java');
            console.log('chmod +X ' + app.getAppPath() + '/java/' + jreFolder + '/Contents/Home/bin/' + 'java')
/*
            if (!app.getAppPath().startsWith("/Applications/")) {
                dialog.showMessageBox(null, {
                    type: 'error'
                    , buttons: [i18n.__('ok')]
                    , title: i18n.__('wrong-directory')
                    , message: i18n.__('wrong-directory-long')
                });
                app.quit();
                return null;
            }
  */
            console.log(jreFolder, filename)
            console.log(app.getAppPath() + '/java/' + jreFolder + '/Contents/Home/bin/java' + ' -jar' + ' -Dvaadin.productionMode=true' + ' -Dserver.port=' + port + ' '+app.getAppPath() + '/java/' + filename + ' --logging.file=application.log');

            return child_process.exec(app.getAppPath() + '/java/' + jreFolder + '/Contents/Home/bin/java' + ' -jar' + ' -Dvaadin.productionMode=true' + ' -Dserver.port=' + port + ' '+app.getAppPath() + '/java/' + filename + ' --logging.file=application.log')
              .on('error', function (code, signal) {
                console.log(code, signal)
                showStartUpErrorMessage();
            });
        } else if (platform === 'linux') {
            return child_process.spawn(jreFolder + '/bin/java', ['-jar', '-Dvaadin.productionMode=true', '-Dserver.port=' + port, filename, '--logging.file=application.log'], {
                cwd: app.getAppPath() + '/java/'
            }).on('error', function (code, signal) {
                showStartUpErrorMessage();
            });
        } else {
            throw new Error("Platform not supported");
        }
    };
    const showLoadingScreen = function () {
        loading = new BrowserWindow({
            show: true
            , frame: false
            , width: 500
            , height: 280
        });
        loading.loadURL('file://' + app.getAppPath() + '/loading.html');
    };
    const beginStartUp = function () {
        (async () => {
            try {
                const port = await getPort();
                serverProcess = spawnServerProcess(port);
                var appUrl = "http://localhost:" + port;
                awaitStartUp(appUrl, function () {
                    showApplication(appUrl);
                });
            } catch (e) {
                error_log(e);
            }
        })();
    }
    if (!gotTheLock) {
        app.quit()
    } else {
        focusSecondInstance();
        app.on('window-all-closed', function () {
            app.quit();
        });


        app.on('ready', function () {
            i18n = new (require('./translations/i18n'));
            try {
                showLoadingScreen();
                platform = process.platform;
                const jrePath = app.getAppPath() + path.sep + 'java' + path.sep + jreFolder;
                const compressedJreFilePath = app.getAppPath() + path.sep + 'java' + path.sep;
                const extractionTargetPath = app.getAppPath() + path.sep + 'java' + path.sep;
                let zipFileName;
                if (platform === 'win32') {
                    zipFileName = 'jre_windows.zip';
                } else if (platform === 'darwin') {
                    zipFileName = 'jre_mac.tar.gz';
                } else if (platform === 'linux') {
                    zipFileName = 'jre_linux.tar.gz';
                }
                if (zipFileName) {
                    if (!fs.existsSync(jrePath)) {
                        decompress(compressedJreFilePath + zipFileName, extractionTargetPath).then(files => {
                            // remove compressed jre once unpacked
                            fs.unlinkSync(compressedJreFilePath + zipFileName);
                            beginStartUp();
                        });
                    } else {
                        beginStartUp();
                    }
                } else {
                    throw new Error("Platform not supported");
                }
            } catch (e) {
                error_log(e);
            }
        });
        app.on('will-quit', function () {
            serverProcess.kill('SIGINT');
        });
    }
} catch (e) {
    error_log(e);
}


// https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/tag/jdk-11.0.9.1%2B1