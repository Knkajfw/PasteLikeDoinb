const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const robot = require('robotjs'); robot.setKeyboardDelay(20);
var io = require('socket.io-client');
var socket;
var socketServerAddress = '';
var info = '';
var infoLink = '';
var nanoid = require('nanoid');
var pcClientId = nanoid(4);
var clip = "";

var win = null;

app.on('ready',createLoadingPageWindow);
app.on('window-all-closed',()=>{
    app.quit();
})

ipcMain.on('socketServerInfo', (event, arg) => {
    socketServerAddress = arg;
    socket = io(socketServerAddress);
    app.on('will-quit', ()=>{
        socket.close();
    })
    socket.on('connect', () => {
        win.webContents.send('loadStatus_SocketLinked');
    })
    socket.on('check', ()=>{
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

function createLoadingPageWindow() {
    Menu.setApplicationMenu(null);
    win = new BrowserWindow({
        width: 371,
        height: 600,
        webPreferences: { nodeIntegration: true }
    })
    win.loadFile('loading-page.html');
    win.on('closed', () => {
        win = null;
    })
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