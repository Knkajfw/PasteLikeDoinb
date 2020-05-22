const { ipcRenderer } = require('electron');
const qrcode = require('qrcode');
const pldVersion = 110;

var canvas = document.getElementById('canvas');
var referLink = '';

ipcRenderer.on('refer', (e, msg) => {
  referLink = msg + `?vfCode=${codeNumber}`;
  var linkSpan = document.getElementById('link-span');
  linkSpan.innerText = referLink;
  qrcode.toCanvas(canvas, referLink, (error) => {
    if (error) {
      var qrerror = document.getElementById('qrerror');
      qrerror.className = "text-break alert alert-danger py-1";
      qrerror.style = "font-size: small; text-align: center";
      qrerror.innerText = "二维码绘制出错，重启app试试";
    }
  })
})

ipcRenderer.on('update-approved-mobiles', (e, approvedMobilesJson) => {
  let allowedMobiles = JSON.parse(approvedMobilesJson);
  let listItemsHTML = '';
  for (let i = 0; i < allowedMobiles.list.length; i++) {
    const element = allowedMobiles.list[i];
    //TRIM remove the check?
    if (allowedMobiles[element]) {
      if (allowedMobiles[element].deviceName) {
        listItemsHTML += `<li>Approved: <abbr title="${element}">${allowedMobiles[element].deviceName}</abbr>  <a href="#" class="del-mb-link" del-target="${element}"><small>Del</small></a></li>`;
      }
      else {
        listItemsHTML += `<li>Approved: ${element}  <a href="#" class="del-mb-link" del-target="${element}"><small>Del</small></a></li>`;
      }
    }
    else {
      listItemsHTML += `<li>Approved: ${element}  <a href="#" class="del-mb-link" del-target="${element}"><small>Del</small></a></li>`;
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
  const delMbLinks = document.querySelectorAll('.del-mb-link');
  for (const link of delMbLinks) {
    link.addEventListener('click', sendDelete);
  }
})

function sendDelete(event) {
  event.preventDefault();
  let targetParent = event.target.parentNode;
  let mbToDelId = targetParent.getAttribute('del-target');
  ipcRenderer.send('delete-mb', mbToDelId);
}

function sendReload() {
  ipcRenderer.send('reload');
}

function sendOpenDevTools() {
  ipcRenderer.send('opendev');
}

var copylinkdiv = document.getElementById('copy-link-div');
copylinkdiv.addEventListener('click', () => {
  navigator.clipboard.writeText(referLink);
})

const pairModeBtn = document.querySelector('#pair-mode-btn');
const pairStatus = document.querySelector('#pair-status');
const verificationCode = document.querySelector('#verification-code');
const verificationCodeLabel = document.querySelector('#verification-code-label');
const codeNumber = generateVerificationCode(6);
var discoverable = false;
var launchTarget;

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

ipcRenderer.on('update-self-id', (e, pcClientId) => {
  const selfIdDiv = document.querySelector('#self-id');
  selfIdDiv.textContent = `ID: ${pcClientId}`;
})

ipcRenderer.on('launch-target', (e, launchTargetJson) => {
  launchTarget = JSON.parse(launchTargetJson);
  for (const target in launchTarget) {
    const targetDiv = document.createElement('div');
    const targetP = document.createElement('p');
    const targetDel = document.createElement('span')
    const targetExploreLink = document.createElement('a');
    targetDiv.setAttribute('launch-target', target.exeName);
    targetP.textContent = target.exeName;
    targetDel.innerText = '&times;';
    targetDel.addEventListener('click', delLaunchTarget);
    targetExploreLink.textContent = 'Explore';
    targetExploreLink.addEventListener('click', handleExplore);
    targetDiv.appendChild(targetP);
    targetDiv.appendChild(targetExploreLink);
    targetDiv.appendChild(targetDel);
    const launchTargetDiv = document.querySelector('#launch-target-div');
    launchTargetDiv.appendChild(targetDiv);
  }
});

//TODO delLaunchTarget
function delLaunchTarget(event) {

}

//TODO handleExplore
function handleExplore(event) {
  event.preventDefault();
}

//TODO backUpdateLaunchTarget
function backUpdateLaunchTarget() {
  ipcRenderer.send('back-update-launch-target', JSON.stringify(launchTarget));
}

const reloadBtn = document.querySelector('#reload-btn');
reloadBtn.addEventListener('click', sendReload);
const openDevBtn = document.querySelector('#open-devtools-btn');
openDevBtn.addEventListener('click', sendOpenDevTools);

(function showStartNotifications() {
  const startNotifications = serverOffer.notifications;
  const notiDiv = document.querySelector('#noti-div');
  function showNoti(note) {
    let noti = document.createElement('p');
    noti.classList.add('noti');
    noti.innerHTML = note.content;
    notiDiv.appendChild(noti);
  }
  for (note of startNotifications) {
    const targetVersion = note.target;
    switch (note.mode) {
      case 'targetVersionArray':
        if (targetVersion.includes(pldVersion)) {
          showNoti(note);
        }
        break;
      case 'toVersionLessThan':
        if (pldVersion <= targetVersion) {
          showNoti(note);
        }
        break;
      case 'toVersionGreaterThan':
        if (pldVersion >= targetVersion) {
          showNoti(note);
        }
        break;
      default:
        break;
    }
  }
})()