const { app, BrowserWindow, Menu, ipcMain, net, dialog } = require('electron');
const robot = require('robotjs'); robot.setKeyboardDelay(30);
const HttpsProxyAgent = require('https-proxy-agent');
const https = require('https');
const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const { execFile } = require('child_process');

app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('disable-http-cache');

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
const approvedMobilesJsonFilePath = path.join(userDataPath, 'approvedMobiles.json');
var opponentSummonerSpellsString = '';
var currentGameMode = '';
var opponentToGetLevelIndex = 0;
var skillSlotToGetLevel = '';
var pairedMobilesList = [];
//DRAFT delete test com name
// const computerName = 'SSSDDDDDGGGGGGX';
const computerName = process.env.COMPUTERNAME.substring(0, 14);
var launchTarget = {};

function updatePairedMobilesListInRAM() {
  if (fs.existsSync(approvedMobilesJsonFilePath)) {
    let approvedMobilesJson = fs.readFileSync(approvedMobilesJsonFilePath, 'utf-8');
    let approvedMobiles = JSON.parse(approvedMobilesJson);
    pairedMobilesList = approvedMobiles.list;
  }
}
function getOrGeneratePcClientId() {
  let filePath = path.join(userDataPath, 'pcClientId');
  if (fs.existsSync(filePath)) {
    let pcClientId = fs.readFileSync(filePath, 'utf-8');
    return pcClientId;
  }
  else {
    let pattern = /[a-zA-Z]/;
    let pcClientId;
    do {
      pcClientId = nanoid(10);
    } while (!pcClientId.charAt(0).match(pattern));
    fs.writeFileSync(filePath, pcClientId, 'utf-8');
    return pcClientId;
  }  
}

function createLoadingPageWindow() {
  //DRAFT check menu
  // Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: { nodeIntegration: true }
  })
  win.on('closed', () => {
    win = null;
  })
  //DRAFT clearCache()
  // win.webContents.session.clearCache()
  Promise.resolve(1)
  .then(() => {
    win.webContents.session.resolveProxy(process.env.plddevsa || socketServerAddress)
    .then(str => {
      let parts = str.split(' ');
      if (parts[0] === 'PROXY') {
        let resolvedProxyAddress = parts[1];
        let resolvedProxyhref = 'http://' + resolvedProxyAddress;
        https.globalAgent = new HttpsProxyAgent(resolvedProxyhref);
      }
    })
    .catch(err => {
      //DRAFT better resolveProxy error handling
      console.error('resolveProxy error:', err.message);
    })
    .finally(() => {
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

function getActivePlayerName(mobileClientId) {
  const getActivePlayerNameReq = net.request('https://127.0.0.1:2999/liveclientdata/activeplayername');
  getActivePlayerNameReq.on('error', (error) => {
    console.error('getActivePlayerNameErr', error.message);
  })
  getActivePlayerNameReq.on('response', (response) => {
    response.on('data', (chunk) => {
      activePlayerName = JSON.parse(chunk);
      requestPlayerList(mobileClientId);
    })
  })
  getActivePlayerNameReq.end();
}

function getActivePlayerNameForLv(mobileClientId) {
  const getActivePlayerNameForLvReq = net.request('https://127.0.0.1:2999/liveclientdata/activeplayername');
  getActivePlayerNameForLvReq.on('error', (error) => {
    console.error('getActivePlayerNameForLvReqErr', error.message);
  })
  getActivePlayerNameForLvReq.on('response', (response) => {
    response.on('data', (chunk) => {
      activePlayerName = JSON.parse(chunk);
      requestPlayerListForLv(mobileClientId);
    })
  })
  getActivePlayerNameForLvReq.end();
}

function requestPlayerList(mobileClientId) {
  const playerListReq = net.request('https://127.0.0.1:2999/liveclientdata/playerlist');
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
        getOpponentObjectArray(mobileClientId);  
      }
      else {
        socket.emit('fetcherrp2s',pcClientId, 'Sync only works for 5v5 game.')
      }
    })
  })
  playerListReq.end();
}

function requestPlayerListForLv(mobileClientId) {
  const playerListForLvReq = net.request('https://127.0.0.1:2999/liveclientdata/playerlist');
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
      getOpponentObjectArrayForLv(mobileClientId);  
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

function getOpponentObjectArray(mobileClientId) {
  opponents = playerList.filter(player => {
    return player.team === opponentTeam;
  })
  getSummonerSpells(mobileClientId);
}

function getOpponentObjectArrayForLv(mobileClientId) {
  opponents = playerList.filter(player => {
    return player.team === opponentTeam;
  })
  sendLevel(mobileClientId);
}

function sendLevel(mobileClientId) {
  if (opponents[opponentToGetLevelIndex] === undefined) /* Do nothing */;
  else {
    let level = opponents[opponentToGetLevelIndex].level;
    socket.emit('fetchlvp2s', mobileClientId, skillSlotToGetLevel, level);  
  }
}

function getSummonerSpells(mobileClientId) {
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
  socket.emit('fetchp2s', gameTime, opponentSummonerSpellsString, mobileClientId);
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
  const gtimereq = net.request('https://127.0.0.1:2999/liveclientdata/gamestats');
  gtimereq.on('error', (error) => {
    //DRAFT restroe log error
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
  //DRAFT clearCache()
  // win.webContents.session.clearCache()
  Promise.resolve(1)
  .then(() => {
    win.webContents.session.resolveProxy(process.env.plddevsa || socketServerAddress)
    .then(str => {
      let parts = str.split(' ');
      if (parts[0] === 'PROXY') {
        let resolvedProxyAddress = parts[1];
        let resolvedProxyhref = 'http://' + resolvedProxyAddress;
        https.globalAgent = new HttpsProxyAgent(resolvedProxyhref);
        socket.close();
      }
      else {
        https.globalAgent = new https.Agent({});
        socket.close();
      }
    })
    .catch(err => {
      console.error('resolveProxy error:', err.message);
    })
    .finally(() => {
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
app.on('ready', requestServerAddress);

app.on('window-all-closed', () => {
  app.quit();
})

ipcMain.on('socketServerInfo', () => {
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
    var referLink = socketServerAddress + '/refer';
    win.loadFile('assets/html/door.html')
    .then(() => {
      if (fs.existsSync(approvedMobilesJsonFilePath)) {
        var approvedMobilesJson = fs.readFileSync(approvedMobilesJsonFilePath, 'utf-8');
        let approvedMobiles = JSON.parse(approvedMobilesJson);
        let approvedMobilesList = approvedMobiles.list;
        if (approvedMobilesList.length >= 1) {
          win.webContents.send('update-approved-mobiles', approvedMobilesJson)
        }
      }
      win.webContents.send('update-self-id', pcClientId);
      win.webContents.send('refer', referLink);
      if (launchTarget) win.webContents.send('launch-target', JSON.stringify(launchTarget));
    })
  })
  socket.on('disconnect', () => {
    win.webContents.send('already-set-as-undiscoverable');
  })
  socket.on('clips2p', (msg, mobileClientId) => {
    if (pairedMobilesList.includes(mobileClientId)) {
      clip = msg;
      typeit();  
    }
  })
  socket.on('fetchs2p', (mobileClientId) => {
    if (currentGameMode === 'CLASSIC') {
      getActivePlayerName(mobileClientId);
    }
    else {
      socket.emit('fetchp2snc', mobileClientId);
    }
  })
  socket.on('fetchlvs2p', (skillSlot, mobileClientId) => {
    opponentToGetLevelIndex = getLevelArrayIndexFromSkillSlot(skillSlot);
    skillSlotToGetLevel = skillSlot;
    getActivePlayerNameForLv(mobileClientId);
  })

  socket.on('pair-s2p', (mbTopair, mbDeviceName) => {
    //DRAFT fs catch
    if (fs.existsSync(approvedMobilesJsonFilePath)) {
      var approvedMobiles = JSON.parse(fs.readFileSync(approvedMobilesJsonFilePath, 'utf-8'));
      if (!approvedMobiles.list.includes(mbTopair)) {
        while (approvedMobiles.list.length >= 5) {
          approvedMobiles.list.shift();
        }
        approvedMobiles.list.push(mbTopair);
        approvedMobiles[mbTopair] = {
          deviceName: mbDeviceName
        }
      }
      else {
        if (approvedMobiles[mbTopair].deviceName !== mbDeviceName) {
          approvedMobiles[mbTopair].deviceName = mbDeviceName;
        }
        else return;
      }
    }
    else {
      var approvedMobiles = {
        list: [mbTopair]
      }
      approvedMobiles[mbTopair] = {
        deviceName: mbDeviceName
      }
    }
    let approvedMobilesJson = JSON.stringify(approvedMobiles);
    fs.writeFileSync(approvedMobilesJsonFilePath, approvedMobilesJson, 'utf-8');
    win.webContents.send('update-approved-mobiles', approvedMobilesJson);
    updatePairedMobilesListInRAM();
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
  socket.emit('request-to-set-as-discoverable', pcClientId, codeNumber, computerName);
})

ipcMain.on('request-to-set-as-undiscoverable', () => {
  socket.emit('request-to-set-as-undiscoverable', pcClientId);
})

ipcMain.on('delete-mb', (e, mbToDelId) => {
  let approvedMobilesJson = fs.readFileSync(approvedMobilesJsonFilePath, 'utf-8');
  let approvedMobiles = JSON.parse(approvedMobilesJson);
  let approvedMobilesList = approvedMobiles.list;
  let mbToDelIdIndex = approvedMobilesList.indexOf(mbToDelId);
  if (mbToDelIdIndex >= 0) {
    approvedMobilesList.splice(mbToDelIdIndex, 1);
    delete approvedMobiles[mbToDelId];
    approvedMobilesJson = JSON.stringify(approvedMobiles);
    fs.writeFileSync(approvedMobilesJsonFilePath, approvedMobilesJson, 'utf-8');
  }
  win.webContents.send('update-approved-mobiles', approvedMobilesJson);
  updatePairedMobilesListInRAM();
})

ipcMain.on('relaunch', (e) => {
  app.relaunch();
  app.quit();
})

ipcMain.on('back-update-launch-target', (e, targetJson) => {
  let newlaunchTarget = JSON.parse(targetJson);
  launchTarget = newlaunchTarget;
  fs.writeFileSync(path.join(userDataPath, 'launchTarget.json'), targetJson, 'utf-8');
})

ipcMain.on('request-to-open-dialog', () => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Custom File Type', extensions: ['exe'] }]
  })
  .then((dialogResult) => {
    if (dialogResult.canceled) return;
    const filePath = dialogResult.filePaths[0];
    win.webContents.send('file-path', filePath);
  });
})

updatePairedMobilesListInRAM();

function requestServerAddress() {
  const serverAddressRequest = net.request('https://indienost.gitee.io/paste-like-doinb/pld-server-address');
  serverAddressRequest.on('error', (error) => {
    logErrorAndCreateErrWin(error);
  })
  serverAddressRequest.on('response', (res) => {
    //STR res!=200 means no data? 
    res.on('data', (chunk) => {
      socketServerAddress = process.env.plddevsa || chunk.toString();
      createLoadingPageWindow();
      setInterval(getGameTime, 1000);
    })
    if (res.statusCode !== 200) {
      const err = new Error('Response not ok');
      logErrorAndCreateErrWin(err);
    }
  })
  serverAddressRequest.end();
}

function logErrorAndCreateErrWin(error) {
  win = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: { nodeIntegration: true }
  })
  win.on('closed', () => {
    win = null;
  })
  win.webContents.loadFile('assets/html/serverAddressReqErr.html');
}

function getLaunchTarget() {
  const launchTargetJsonFilePath = path.join(userDataPath, 'launchTarget.json');
  if (fs.existsSync(launchTargetJsonFilePath)) {
    const content = fs.readFileSync(launchTargetJsonFilePath, 'utf-8');
    if (content) {
      launchTarget = JSON.parse(content);
    }
  }
}

function launchAll(launchTarget) {
  const regex = /\\/g;
  for (const target in launchTarget) {
    //RSM
    const path ='"' + launchTarget[target].path.replace(regex, '\\\\') + '"';
    execFile(path, { shell: true });
  }
}

//DRAFT recovery launchExtra
// (function launchExtra() {
//   getLaunchTarget();
//   launchAll(launchTarget);
// })();