const { ipcRenderer } = require('electron');
const qrcode = require('qrcode');
const pldVersion = 110;

var canvas = document.getElementById('canvas');
var referLink = '';

// ipcRenderer.on('refer', (e, msg) => {
//   referLink = msg + `?vfCode=${codeNumber}`;
//   var linkSpan = document.getElementById('link-span');
//   linkSpan.innerText = referLink;
//   qrcode.toCanvas(canvas, referLink, (error) => {
//     if (error) {
//       var qrerror = document.getElementById('qrerror');
//       qrerror.className = "text-break alert alert-danger py-1";
//       qrerror.style = "font-size: small; text-align: center";
//       qrerror.innerText = "二维码绘制出错，重启app试试";
//     }
//   })
// })

ipcRenderer.on('update-approved-mobiles', (e, approvedMobilesJson) => {
  const allowedMobiles = JSON.parse(approvedMobilesJson);
  const pairedDiv = document.querySelector('#paired-div');
  
  pairedDiv.innerHTML = '';
  for (let i = 0; i < allowedMobiles.list.length; i++) {
    const pairedMbId = allowedMobiles.list[i];
    const newListItemDiv = document.createElement('div');
    const newNameArea = document.createElement('div');
    const newIdTooltip = document.createElement('img');
    const newDelBtn = document.createElement('img');

    newListItemDiv.classList.add('d-flex');

    if (allowedMobiles[pairedMbId] && allowedMobiles[pairedMbId].deviceName) {
      newNameArea.textContent = '- ' + allowedMobiles[pairedMbId].deviceName;
    } else {
      newNameArea.textContent = '- ' + pairedMbId;
    }
    newNameArea.classList.add('paired-list-name-area');
    newListItemDiv.appendChild(newNameArea);

    newIdTooltip.src = '../img/info.png';
    newIdTooltip.alt = 'ID';
    newIdTooltip.classList.add('paired-list-img');
    newIdTooltip.setAttribute('data-toggle', 'tooltip');
    newIdTooltip.setAttribute('data-placement', 'top');
    newIdTooltip.setAttribute('title', `ID: ${pairedMbId}`);
    newListItemDiv.appendChild(newIdTooltip);

    newDelBtn.src = '../img/delete.png';
    newDelBtn.alt = 'Del';
    newDelBtn.classList.add('paired-list-img');
    newDelBtn.setAttribute('del-target', pairedMbId);
    newDelBtn.addEventListener('click', sendDelete);
    newListItemDiv.appendChild(newDelBtn);

    pairedDiv.appendChild(newListItemDiv);
  }
})

function sendDelete(event) {
  const mbToDelId = event.target.getAttribute('del-target');
  ipcRenderer.send('delete-mb', mbToDelId);
}

function sendReload() {
  ipcRenderer.send('reload');
}

function sendOpenDevTools() {
  ipcRenderer.send('opendev');
}

const pairModeBtn = document.querySelector('#pair-mode-btn');
const pairStatus = document.querySelector('#pair-status');
const verificationCode = document.querySelector('#verification-code');
const verificationCodeLabel = document.querySelector('#verification-code-label');
const codeNumber = generateVerificationCode(6);
var discoverable = false;
var launchTarget = {};

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
    const targetSpan = document.createElement('span');
    const targetDel = document.createElement('a')
    targetDiv.setAttribute('launch-target', launchTarget[target].friendlyName);
    targetSpan.textContent = launchTarget[target].friendlyName;
    targetDel.innerHTML = '&times;';
    targetDel.addEventListener('click', delLaunchTarget);
    targetDiv.appendChild(targetSpan);
    targetDiv.appendChild(targetDel);
    const launchTargetDiv = document.querySelector('#launch-target-div');
    launchTargetDiv.appendChild(targetDiv);
  }
});

function delLaunchTarget(event) {
  event.preventDefault();
  const targetDiv = event.target.parentNode;
  const targetName = targetDiv.getAttribute('launch-target');
  delete launchTarget[targetName];
  targetDiv.parentNode.removeChild(targetDiv);
  backUpdateLaunchTarget();
}

function addLaunchTarget(event) {
  event.preventDefault();
  const modalInput = document.querySelector('#friendly-name-input');
  const modalPathPara = document.querySelector('#modal-path-para');
  modalInput.value = '';
  modalPathPara.textContent = '';
  $('#add-launch-target-modal').modal('show');
}

function saveAddedLaunchTarget() {
  let targetToAdd = {};
  targetToAdd.friendlyName = document.querySelector('#friendly-name-input').value.trim();
  targetToAdd.path = document.querySelector('#modal-path-para').textContent;
  if (targetToAdd.friendlyName && targetToAdd.path) {
    const targetDiv = document.createElement('div');
    const targetSpan = document.createElement('span');
    const targetDel = document.createElement('a')
    targetDiv.setAttribute('launch-target', targetToAdd.friendlyName);
    targetSpan.textContent = targetToAdd.friendlyName;
    targetDel.innerHTML = '&times;';
    targetDel.addEventListener('click', delLaunchTarget);
    targetDiv.appendChild(targetSpan);
    targetDiv.appendChild(targetDel);
    const launchTargetDiv = document.querySelector('#launch-target-div');
    launchTargetDiv.appendChild(targetDiv);
    launchTarget[targetToAdd.friendlyName] = targetToAdd;
    backUpdateLaunchTarget();
    $('#add-launch-target-modal').modal('hide');  
  } else {
    const modalInputFeedback = document.querySelector('#modal-input-feedback');
    modalInputFeedback.textContent = '';
    modalInputFeedback.textContent = 'Please provide all required information.'
  }
}

const addLaunchTargetSaveBtn = document.querySelector('#add-launch-target-save-btn');
addLaunchTargetSaveBtn.addEventListener('click', saveAddedLaunchTarget);

function backUpdateLaunchTarget() {
  ipcRenderer.send('back-update-launch-target', JSON.stringify(launchTarget));
}

function requestToOpenDialog() {
  ipcRenderer.send('request-to-open-dialog');
}

const addLaunchTargetLink = document.querySelector('#add-launch-target-link');
addLaunchTargetLink.addEventListener('click', addLaunchTarget);
const browseBtn = document.querySelector('#browse-btn');
browseBtn.addEventListener('click', requestToOpenDialog);
ipcRenderer.on('file-path', (e, filePath) => {
  const modalPathPara = document.querySelector('#modal-path-para');
  modalPathPara.textContent = filePath;
})

// const reloadBtn = document.querySelector('#reload-btn');
// reloadBtn.addEventListener('click', sendReload);
// const openDevBtn = document.querySelector('#open-devtools-btn');
// openDevBtn.addEventListener('click', sendOpenDevTools);

// (function showStartNotifications() {
//   const startNotifications = serverOffer.notifications;
//   const notiDiv = document.querySelector('#noti-div');
//   function showNoti(note) {
//     let noti = document.createElement('p');
//     noti.classList.add('noti');
//     noti.innerHTML = note.content;
//     notiDiv.appendChild(noti);
//   }
//   for (note of startNotifications) {
//     const targetVersion = note.target;
//     switch (note.mode) {
//       case 'targetVersionArray':
//         if (targetVersion.includes(pldVersion)) {
//           showNoti(note);
//         }
//         break;
//       case 'toVersionLessThan':
//         if (pldVersion <= targetVersion) {
//           showNoti(note);
//         }
//         break;
//       case 'toVersionGreaterThan':
//         if (pldVersion >= targetVersion) {
//           showNoti(note);
//         }
//         break;
//       default:
//         break;
//     }
//   }
// })();