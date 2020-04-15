const { app, BrowserWindow, Menu, ipcMain, net } = require('electron');
const robot = require('robotjs'); robot.setKeyboardDelay(20);
const HttpsProxyAgent = require('https-proxy-agent');
const https = require('https');
const io = require('socket.io-client');
const nanoid = require('nanoid');
const iconv = require('iconv-lite');

app.commandLine.appendSwitch('ignore-certificate-errors');

var socket;
var socketServerAddress = '';
var clip = '';
var win = null;
var pcClientId = nanoid(4);
var willquitListenerExistence = false;
var isTyping = false;
var gameTime = 0;
var activePlayerName = '';
var playerList = {};

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
  win.webContents.session.resolveProxy('https://www.indienost.com')
  .then(str => {
    let parts = str.split(' ');
    if (parts[0] === 'PROXY') {
      let resolvedProxyAddress = parts[1];
      let resolvedProxyhref = 'http://' + resolvedProxyAddress;
      https.globalAgent = new HttpsProxyAgent(resolvedProxyhref);
      win.webContents.loadFile('assets/html/loading-page.html');
    }
    else {
      win.webContents.loadFile('assets/html/loading-page.html');
    }
  })
  .catch (err => { 
    console.error('resolveProxy error:', err.message);
    win.webContents.loadFile('assets/html/loading-page.html');
  })
}

function typeit() {
  if (!isTyping) {
    isTyping = true;
    robot.keyTap('enter');
    robot.keyTap('capslock');
    robot.typeString(clip.toLowerCase());
    robot.keyTap('capslock');
    robot.keyTap('enter');
    isTyping = false;
  }
}

function getActivePlayerName() {
  const getActivePlayerNameReq = new net.request('https://127.0.0.1:2999/liveclientdata/activeplayername');
  getActivePlayerNameReq.on('error', (error) => {
    console.error('getActivePlayerNameErr', error.message);
  })
  getActivePlayerNameReq.on('response', (response) => {
    response.on('data', (chunk) => {
      activePlayerName = chunk;
      console.log(activePlayerName);
      requestPlayerList();
    })
  })
  getActivePlayerNameReq.end();
}

function requestPlayerList() {
  const playerListReq = new net.request('https://127.0.0.1:2999/liveclientdata/playerlist');
  playerListReq.on('error', (error) => {
    console.log('playerListReqErr:', error.message);
  })
  playerListReq.on('response', (response) => {
    response.on('data', (chunk) => {
      playerList = JSON.parse(chunk);
      //console.log(typeof playerList);
      //console.log(playerList);
      console.log(playerList[0].championName);
      console.log(playerList[0].championName === '褰辨祦涔嬮暟');
      //let r = findPlayerTeam();
      //console.log(r);
    })
  })
  playerListReq.end();
}

function findPlayerTeam() {
  for (let i=0; i<playerList.length; i++) {
    if (playerList[i].summonerName === activePlayerName) {
      return playerList[i].team;
    }
  }
}

/*function getOpponentObejectArray() {

}*/

function getGameTime() {
  const gtimereq = new net.request('https://127.0.0.1:2999/liveclientdata/gamestats');
  gtimereq.on('error', (error) => {
    console.error('getGameTimeReqErr', error.message);
  })
  gtimereq.on('response', (response) => {
    response.on('data', (chunk) => {
      let parsed = Math.ceil(JSON.parse(chunk).gameTime);
      if (!isNaN(parsed) && (typeof (parsed) === "number")) {
        gameTime = parsed;
        console.log('gametime', gameTime);
      }
    })
  })
  gtimereq.end();
}

function winReload() {
  win.webContents.session.resolveProxy('https://www.indienost.com')
  .then(str => {
    let parts = str.split(' ');
    if (parts[0] === 'PROXY') {
      let resolvedProxyAddress = parts[1];
      let resolvedProxyhref = 'http://' + resolvedProxyAddress;
      https.globalAgent = new HttpsProxyAgent(resolvedProxyhref);
      socket.close();
      win.webContents.loadFile('assets/html/loading-page.html');
    }
    else {
      https.globalAgent = new https.Agent({});
      socket.close();
      win.webContents.loadFile('assets/html/loading-page.html');
    }
  })
  .catch (err => { 
    console.error('resolveProxy error:', err.message);
    win.webContents.loadFile('assets/html/loading-page.html');
  })
}

app.on('ready', () => {
  createLoadingPageWindow();
  getGameTime();
  setInterval(getGameTime, 1000);
  setTimeout(getActivePlayerName, 2500);
})

app.on('window-all-closed', () => {
  app.quit();
})

ipcMain.on('socketServerInfo', (event, arg) => {
  socketServerAddress = arg;
  let opts = {
    rejectUnauthorized: false,
    reconnection: true,
    agent: https.globalAgent
  }
  socket = io(socketServerAddress, opts);
  if (!willquitListenerExistence) {
    app.on('will-quit', () => {
      socket.close();
    })
    willquitListenerExistence = true;
  }
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
    win.loadFile('assets/html/door.html');
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('refer', correspMobileClientLink);
    })
  })
  socket.on('clips2p', (msg) => {
    clip = msg;
    typeit();
  })
  socket.on('fetchs2p', () => {
    socket.emit('fetchp2s', gameTime, pcClientId);
  })
})

ipcMain.on('reload', () => {
  winReload();
})