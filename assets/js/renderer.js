const { ipcRenderer } = require('electron');
const qrcode = require('qrcode');

var canvas = document.getElementById('canvas');
var correspMobileClientLink = '';

ipcRenderer.on('refer', (e, msg) => {
  correspMobileClientLink = msg;
  var linkSpan = document.getElementById('link-span');
  linkSpan.innerText = correspMobileClientLink;
  qrcode.toCanvas(canvas, correspMobileClientLink, (error) => {
    if (error) {
      var qrerror = document.getElementById('qrerror');
      qrerror.className = "text-break alert alert-danger py-1";
      qrerror.style = "font-size: small; text-align: center";
      qrerror.innerText = "二维码绘制出错，重启app试试";
    }
  })
})

ipcRenderer.on('updateAllowedMobiles', (e, allowedMobilesJson) => {
  let allowedMobiles = JSON.parse(allowedMobilesJson);
  let listItemsHTML = '';
  for (let i = 0; i < allowedMobiles.list.length; i++) {
    const element = allowedMobiles.list[i];
    if (allowedMobiles[element]) {
      if (allowedMobiles[element].friendlyName) {
        listItemsHTML += `<li>Approved: ${allowedMobiles[element].friendlyName}</li>`;
      }
      else {
        listItemsHTML += `<li>Approved: ${element}</li>`;
      }
    }
    else {
      listItemsHTML += `<li>Approved: ${element}</li>`;
    }
  }
  const pairedDiv = document.querySelector('#paired-div');
  const existingList = document.querySelector('#paired-list');
  let newList = document.createElement('ul');
  newList.innerHTML = listItemsHTML;
  newList.id = 'paired-list';
  if (existingList) {
    pairedDiv.removeChild(existingList);
  }
  pairedDiv.appendChild(newList);
})

function doorReload() {
  ipcRenderer.send('reload');
}

function sendOpenDevTools() {
  ipcRenderer.send('opendev');
}

var copylinkdiv = document.getElementById('copy-link-div');
copylinkdiv.addEventListener('click', () => {
  navigator.clipboard.writeText(correspMobileClientLink);
})

const pldVersion = 441231;
var infobar = document.getElementById('top-info-bar');
var infobar2 = document.getElementById('top-info-bar-2');
var topInfoBarLink1 = document.getElementById('top-info-bar-link1');

infobar.innerHTML = info;

if (info2TargetVersion >= pldVersion) {
  infobar2.innerHTML = info2;
}

if (topInfoBarLink1) {
  topInfoBarLink1.addEventListener('click', (e) => { e.preventDefault(); shell.openExternal(infoLink) });
}

const pairModeBtn = document.querySelector('#pair-mode-btn');
const pairStatus = document.querySelector('#pair-status');
const verificationCode = document.querySelector('#verification-code');
const verificationCodeLabel = document.querySelector('#verification-code-label');
const codeNumber = generateVerificationCode(6);
var discoverable = false;

function reqToSetAsDiscoverable() {
  ipcRenderer.send('request-to-set-as-discoverable', codeNumber);
}
function reqToSetAsUndiscoverable() {
  ipcRenderer.send('request-to-set-as-undiscoverable');
}
function generateVerificationCode(digit) {
  let alphabet = '0123456789';
  let result = '';
  for (let i = 0; i < digit; i++) {
    let newNumber = alphabet[Math.floor(Math.random()*10)];
    result += newNumber;
  }
  return result;
}
pairModeBtn.addEventListener('click', reqToSetAsDiscoverable);

ipcRenderer.on('already-set-as-discoverable', (e, codeNumber) => {
  verificationCode.innerText = codeNumber;
  if (!discoverable) {
    pairStatus.innerText = 'Discoverable';
    pairModeBtn.removeEventListener('click', reqToSetAsDiscoverable);
    pairModeBtn.addEventListener('click', reqToSetAsUndiscoverable);
    verificationCodeLabel.innerText = 'Pair Code:';
    discoverable = true;
  }
})

ipcRenderer.on('already-set-as-undiscoverable', () => {
  if (discoverable) {
    pairStatus.innerText = 'Not discoverable';
    pairModeBtn.removeEventListener('click', reqToSetAsUndiscoverable);
    pairModeBtn.addEventListener('click', reqToSetAsDiscoverable);
    verificationCode.innerText = '';
    verificationCodeLabel.innerText = '';
    discoverable = false;
  }
})

if (discoverable) {
  pairStatus.textContent = 'Discoverable';
}
else {
  pairStatus.textContent = 'Not discoverable';
}