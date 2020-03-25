const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const robot = require('robotjs'); robot.setKeyboardDelay(20);
const HttpsProxyAgent = require('https-proxy-agent');
const url = require('url');
const getSystemProxyForUrl = require('get-system-proxy-for-url');
const https = require('https');
const io = require('socket.io-client');
const nanoid = require('nanoid');

var socket;
var socketServerAddress = '';
var info = '';
var infoLink = '';
var clip = '';
var win = null;
var pcClientId = nanoid(4);

function prepareHttpsAgent() {
    getSystemProxyForUrl('https://www.google.com')
    .then((proxy) => {
        if (proxy !== 'DIRECT') {
            let proxyServer = url.parse(proxy);
            https.globalAgent = new HttpsProxyAgent(proxyServer.href);
        }
        createLoadingPageWindow();
    })
}

function createLoadingPageWindow() {
    Menu.setApplicationMenu(null);
    win = new BrowserWindow({
        width: 371,
        height: 600,
        webPreferences: { nodeIntegration: true }
    })
    win.on('closed', () => {
        win = null;
    })
    win.webContents.loadFile('loading-page.html');    
}

function loadDoor() {
    win.loadFile('door.html');
}

function typeit() {
    robot.keyTap('capslock');
    robot.keyTap('enter');
    robot.typeStringDelayed(clip.toLowerCase(), 99999);
    robot.keyTap('enter');
    robot.keyTap('capslock');
}

app.on('ready', prepareHttpsAgent);
app.on('window-all-closed', () => {
    app.quit();
})

ipcMain.on('socketServerInfo', (event, arg) => {
    socketServerAddress = arg;
    let opts = {
        rejectUnauthorized: false,
        reconnection: true,
        agent: https.globalAgent
    };
    console.log(opts.agent);
    socket = io(socketServerAddress, opts);
    app.on('will-quit', () => {
        socket.close();
    })
    socket.on('connect', () => {
        win.webContents.send('loadStatus_SocketLinked');
    })
    socket.on('check', () => {
        socket.emit('ispc', pcClientId);
        win.webContents.send('loadStatus_PCIdEmitted')
    })
    socket.on('pcoc', () => {
        pcClientId = nanoid(4);
        socket.emit('ispc', pcClientId);
    })
    socket.on('pcintro', (msg) => {
        win.webContents.send('loadStatus_MobileLinkReceived')
        var correspMobileClientLink = socketServerAddress + '/m/' + msg;
        loadDoor();
        win.webContents.on('did-finish-load', () => {
            win.webContents.send('refer', correspMobileClientLink);
        })
    })
    socket.on('clips2p', (msg) => {
        clip = msg;
        typeit();
    })
})
