const { app, BrowserWindow, Menu, ipcMain, net } = require('electron');
const robot = require('robotjs'); robot.setKeyboardDelay(20);
const HttpsProxyAgent = require('https-proxy-agent');
const https = require('https');
const io = require('socket.io-client');
const nanoid = require('nanoid');

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
var activePlayerTeam = '';
var opponentTeam = '';
var opponents;
var opponentSummonerSpells = [];
var opponentSummonerSpellsTrimmed;
const opponentSummonerSpellsObject = {
  topd: undefined,
  topf: undefined,
  jugd: undefined,
  jugf: undefined,
  midd: undefined,
  midf: undefined,
  add: undefined,
  adf: undefined,
  supd: undefined,
  supf: undefined
};
var opponentSummonerSpellsString = '';
var currentGameMode = '';

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
      activePlayerName = JSON.parse(chunk);
      requestPlayerList();
    })
  })
  getActivePlayerNameReq.end();
}

function requestPlayerList() {
  const playerListReq = new net.request('https://127.0.0.1:2999/liveclientdata/playerlist');
  playerListReq.on('error', (error) => {
    console.error('playerListReqErr:', error.message);
  })
  playerListReq.on('response', (response) => {
    response.on('data', (chunk) => {
      playerList = JSON.parse(chunk);
      if (playerList.length === 9) {
        activePlayerTeam = findPlayerTeam();
        if (activePlayerTeam === 'ORDER') {
          opponentTeam = 'CHAOS';
        }
        else if (activePlayerTeam === 'CHAOS') {
          opponentTeam = 'ORDER';
        }
        getOpponentObjectArray();  
      }
      else {
        socket.emit('fetcherrp2s',pcClientId, 'Sync only works for 5v5 game.')
      }
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

function getOpponentObjectArray() {
  opponents = playerList.filter(player => {
    return player.team === opponentTeam;
  })
  getSummonerSpells();
}

function getSummonerSpells() {
  opponentSummonerSpells = [];
  opponents.map(parseAndPushSummonerSpells);
  opponentSummonerSpellsTrimmed = trimSummonerSpells();
  opponentSummonerSpellsObject.topd = opponentSummonerSpellsTrimmed[0];
  opponentSummonerSpellsObject.topf = opponentSummonerSpellsTrimmed[1];
  opponentSummonerSpellsObject.jugd = opponentSummonerSpellsTrimmed[2];
  opponentSummonerSpellsObject.jugf = opponentSummonerSpellsTrimmed[3];
  opponentSummonerSpellsObject.midd = opponentSummonerSpellsTrimmed[4];
  opponentSummonerSpellsObject.midf = opponentSummonerSpellsTrimmed[5];
  opponentSummonerSpellsObject.add = opponentSummonerSpellsTrimmed[6];
  opponentSummonerSpellsObject.adf = opponentSummonerSpellsTrimmed[7];
  opponentSummonerSpellsObject.supd = opponentSummonerSpellsTrimmed[8];
  opponentSummonerSpellsObject.supf = opponentSummonerSpellsTrimmed[9];
  opponentSummonerSpellsString = JSON.stringify(opponentSummonerSpellsObject);
  socket.emit('fetchp2s', gameTime, pcClientId, opponentSummonerSpellsString);
}

function parseAndPushSummonerSpells(summoner) {
  let raw = summoner.summonerSpells.summonerSpellOne.rawDisplayName;
  let extracted = raw.split('_')[2];
  opponentSummonerSpells.push(extracted);
  raw = summoner.summonerSpells.summonerSpellTwo.rawDisplayName;
  extracted = raw.split('_')[2];
  opponentSummonerSpells.push(extracted);
}

function trimSummonerSpells() {
  return opponentSummonerSpells.map(spellStr => spellStr.substring(8).toLowerCase());
}

function getGameTime() {
  const gtimereq = new net.request('https://127.0.0.1:2999/liveclientdata/gamestats');
  gtimereq.on('error', (error) => {
    console.error('getGameTimeReqErr', error.message);
  })
  gtimereq.on('response', (response) => {
    response.on('data', (chunk) => {
      let parsed = JSON.parse(chunk);
      let ceiledGameTime = Math.ceil(parsed.gameTime);
      currentGameMode = parsed.gameMode;
      if (!isNaN(ceiledGameTime) && (typeof (ceiledGameTime) === "number")) {
        gameTime = ceiledGameTime;
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

function getLevelArrayIndexFromSkillSlot(skillSlot) {
  switch (skillSlot) {
    case 'topd':
    case 'topf':
      return 0;
    case 'jugd':
    case 'jugf':
      return 1;
    case 'midd':
    case 'midf':
      return 2;
    case 'add':
    case 'adf':
      return 3;
    case 'supd':
    case 'supf':
      return 4;
    default:
      console.log('undefined skill slot string input');
  }
}

app.on('ready', () => {
  createLoadingPageWindow();
  getGameTime();
  setInterval(getGameTime, 1000);
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
    if (currentGameMode === 'CLASSIC') {
      getActivePlayerName();
    }
    else {
      socket.emit('fetchp2snc', pcClientId);
    }
  })
  socket.on('fetchlvs2p', (skillSlot) => {
    let index = getLevelArrayIndexFromSkillSlot(skillSlot);
    let lvreq = net.request('https://127.0.0.1:2999/liveclientdata/playerlist');
    lvreq.on('error', (error) => {
      console.error('lvreq err:', error.message);
    })
    lvreq.on('response', (response) => {
      response.on('data', (chunk) => {
        let lvPlayerList = JSON.parse(chunk);
        let level = lvPlayerList[index].level;
        console.log(pcClientId, skillSlot, level);
        socket.emit('fetchlvp2s',pcClientId, skillSlot, level);    
      })
    })
    lvreq.end();
  })
})

ipcMain.on('reload', () => {
  winReload();
})

ipcMain.on('opendev', () => {
  win.webContents.openDevTools({mode: 'undocked'});
})