const { app, BrowserWindow, Menu, ipcMain, net } = require('electron');
const robot = require('robotjs'); robot.setKeyboardDelay(30);
const HttpsProxyAgent = require('https-proxy-agent');
const https = require('https');
const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

app.commandLine.appendSwitch('ignore-certificate-errors');

const userDataPath = app.getPath('userData');
var socket;
var socketServerAddress = '';
var clip = '';
var win = null;
var pcClientId = getOrGeneratePcClientId();
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
}
var opponentSummonerSpellsString = '';
var currentGameMode = '';
var opponentToGetLevelIndex = 0;
var skillSlotToGetLevel = '';

function getOrGeneratePcClientId() {
  let filePath = path.join(userDataPath, 'pcClientId');
  if (fs.existsSync(filePath)) {
    let pcClientId = fs.readFileSync(filePath, 'utf-8');
    return pcClientId;
  }
  else {
    let pcClientId = nanoid(10);
    fs.writeFileSync(filePath, pcClientId, 'utf-8');
    return pcClientId;
  }  
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
  win.webContents.session.clearCache()
  .then(() => {
    win.webContents.session.resolveProxy(process.env.plddevsa || 'https://www.indienost.com')
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
  })
}

function typeit() {
  if (!isTyping) {
    isTyping = true;
    robot.keyTap('enter');
    robot.keyTap('capslock');
    robot.typeStringDelayed(clip, 5000);
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

function getActivePlayerNameForLv() {
  const getActivePlayerNameForLvReq = new net.request('https://127.0.0.1:2999/liveclientdata/activeplayername');
  getActivePlayerNameForLvReq.on('error', (error) => {
    console.error('getActivePlayerNameForLvReqErr', error.message);
  })
  getActivePlayerNameForLvReq.on('response', (response) => {
    response.on('data', (chunk) => {
      activePlayerName = JSON.parse(chunk);
      requestPlayerListForLv();
    })
  })
  getActivePlayerNameForLvReq.end();
}

function requestPlayerList() {
  const playerListReq = new net.request('https://127.0.0.1:2999/liveclientdata/playerlist');
  playerListReq.on('error', (error) => {
    console.error('playerListReqErr:', error.message);
  })
  playerListReq.on('response', (response) => {
    response.on('data', (chunk) => {
      playerList = JSON.parse(chunk);
      if (playerList.length === 10) {
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

function requestPlayerListForLv() {
  const playerListForLvReq = new net.request('https://127.0.0.1:2999/liveclientdata/playerlist');
  playerListForLvReq.on('error', (error) => {
    console.error('playerListForLvReqErr:', error.message);
  })
  playerListForLvReq.on('response', (response) => {
    response.on('data', (chunk) => {
      playerList = JSON.parse(chunk);
      activePlayerTeam = findPlayerTeam();
      if (activePlayerTeam === 'ORDER') {
        opponentTeam = 'CHAOS';
      }
      else if (activePlayerTeam === 'CHAOS') {
        opponentTeam = 'ORDER';
      }
      getOpponentObjectArrayForLv();  
    })
  })
  playerListForLvReq.end();
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

function getOpponentObjectArrayForLv() {
  opponents = playerList.filter(player => {
    return player.team === opponentTeam;
  })
  sendLevel();
}

function sendLevel() {
  if (opponents[opponentToGetLevelIndex] === undefined) /* Do nothing */;
  else {
    let level = opponents[opponentToGetLevelIndex].level;
    console.log(pcClientId, skillSlotToGetLevel, level);
    socket.emit('fetchlvp2s', pcClientId, skillSlotToGetLevel, level);  
  }
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
    //DRAFT
    // console.error('getGameTimeReqErr', error.message);
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
  win.webContents.session.clearCache()
  .then(() => {
    win.webContents.session.resolveProxy(process.env.plddevsa || 'https://www.indienost.com')
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
  socketServerAddress = process.env.plddevsa || arg;
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
  //DRAFT 提示已有，不要重复开启
  socket.on('pcoc', () => {
    app.quit();
  })
  socket.on('pcintro', () => {
    win.webContents.send('loadStatus_MobileLinkReceived')
    var referLink = socketServerAddress + '/refer' + `?pcClientId=${pcClientId}`;
    win.loadFile('assets/html/door.html');
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('refer', referLink);
    })
  })
  socket.on('clips2p', (msg, mobileClientId) => {
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
    opponentToGetLevelIndex = getLevelArrayIndexFromSkillSlot(skillSlot);
    skillSlotToGetLevel = skillSlot;
    getActivePlayerNameForLv();
  })
  socket.on('pair-s2p', (mbTopair, fn) => {
    //DRAFT fs catch
    let filePath = path.join(userDataPath, 'approvedMobiles.json');
    if (fs.existsSync(filePath)) {
      var approvedMobiles = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      let approvedMobilesList = approvedMobiles.list;
      if (approvedMobilesList.indexOf(mbTopair) < 0) {
        while (approvedMobilesList.length >= 5) {
          approvedMobilesList.shift();
        }
        approvedMobilesList.push(mbTopair);  
      }
      else {
        return ;
      }
    }
    else {
      var approvedMobiles = {
        list: [mbTopair]
      }
    }
    let approvedMobilesJson = JSON.stringify(approvedMobiles);
    fs.writeFileSync(filePath, approvedMobilesJson, 'utf-8');
    win.webContents.send('updateAllowedMobiles', approvedMobilesJson);
    //DRAFT may delete param
    fn('c');
  })
  socket.on('already-set-as-discoverable', (codeNumber) => {
    win.webContents.send('already-set-as-discoverable', codeNumber);
  })
  socket.on('already-set-as-undiscoverable', () => {
    win.webContents.send('already-set-as-undiscoverable');
  })
})

ipcMain.on('reload', () => {
  winReload();
})

ipcMain.on('opendev', () => {
  win.webContents.openDevTools({mode: 'undocked'});
})

ipcMain.on('request-to-set-as-discoverable', (e, codeNumber) => {
  socket.emit('request-to-set-as-discoverable', pcClientId, codeNumber);
})

ipcMain.on('request-to-set-as-undiscoverable', () => {
  socket.emit('request-to-set-as-undiscoverable', pcClientId);
})