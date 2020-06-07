const { ipcRenderer, shell } = require('electron');
const qrcode = require('qrcode');
const pldVersion = 144;

var canvas = document.getElementById('canvas');
var referLink = '';

ipcRenderer.on('refer', (e, msg) => {
  referLink = msg + `?vfCode=${codeNumber}`;
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
    newDelBtn.classList.add('paired-list-img', 'cursor-pointer');
    newDelBtn.setAttribute('del-target', pairedMbId);
    newDelBtn.addEventListener('click', sendDelete);
    newListItemDiv.appendChild(newDelBtn);

    pairedDiv.appendChild(newListItemDiv);
  }
  if (pairedDiv.hasChildNodes()) {
    document.querySelector('#add-paired-pc-prompt').classList.add('d-none');
  } else {
    document.querySelector('#add-paired-pc-prompt').classList.remove('d-none');
  }
})

function sendDelete(event) {
  const mbToDelId = event.target.getAttribute('del-target');
  ipcRenderer.send('delete-mb', mbToDelId);
}

const pairModeToggle = document.querySelector('#pair-mode-toggle');
const verificationCode = document.querySelector('#verification-code');
const codeNumber = generateVerificationCode(6);
var waitingForDiscoverabilityResponse = false;
var discoverabilityRequestTimeOut;

var launchTarget = {};


pairModeToggle.addEventListener('click', reqToSetAsDiscoverable, true);

function reqToSetAsDiscoverable(e) {
  e.preventDefault();
  if (!waitingForDiscoverabilityResponse) {
    ipcRenderer.send('request-to-set-as-discoverable', codeNumber);
    waitingForDiscoverabilityResponse = true;
    document.querySelector('#discoverable-toggle-spinner').classList.remove('d-none');
    discoverabilityRequestTimeOut = setTimeout(handleDiscoverabilityRequestTimeout, 2500);
  }
}
function reqToSetAsUndiscoverable(e) {
  e.preventDefault();
  if (!waitingForDiscoverabilityResponse) {
    ipcRenderer.send('request-to-set-as-undiscoverable');
    waitingForDiscoverabilityResponse = true;
    document.querySelector('#discoverable-toggle-spinner').classList.remove('d-none');
    discoverabilityRequestTimeOut = setTimeout(handleDiscoverabilityRequestTimeout, 2500);
  }
}

function handleDiscoverabilityRequestTimeout() {
  document.querySelector('#discoverable-toggle-spinner').classList.add('d-none');
  document.querySelector('#discoverable-toggle-warning').classList.remove('d-none');
  setTimeout(() => {
    document.querySelector('#discoverable-toggle-warning').classList.add('d-none');
  }, 1000);
  waitingForDiscoverabilityResponse = false;
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

ipcRenderer.on('already-set-as-discoverable', (e, codeNumber) => {
  if (waitingForDiscoverabilityResponse) {
    clearTimeout(discoverabilityRequestTimeOut);
    verificationCode.innerText = codeNumber;
    pairModeToggle.checked = true;
    $('#refer-info-collapse').collapse('show');
    document.querySelector('#discoverable-toggle-spinner').classList.add('d-none');
    document.querySelector('#enter-pair-mode-prompt').classList.add('d-none');
    pairModeToggle.removeEventListener('click', reqToSetAsDiscoverable, true);
    pairModeToggle.addEventListener('click', reqToSetAsUndiscoverable, true);
    waitingForDiscoverabilityResponse = false;
  }
})

ipcRenderer.on('already-set-as-undiscoverable', () => {
  if (waitingForDiscoverabilityResponse) {
    clearTimeout(discoverabilityRequestTimeOut);
    document.querySelector('#discoverable-toggle-spinner').classList.add('d-none');
    setTimeout(() => {
      document.querySelector('#enter-pair-mode-prompt').classList.remove('d-none');
    }, 280);
    pairModeToggle.checked = false;
    $('#refer-info-collapse').collapse('hide');
    pairModeToggle.removeEventListener('click', reqToSetAsUndiscoverable, true);
    pairModeToggle.addEventListener('click', reqToSetAsDiscoverable, true);
    waitingForDiscoverabilityResponse = false;
  }
})

ipcRenderer.on('update-self-id', (e, pcClientId, computerName) => {
  const selfIdDiv = document.querySelector('#self-id');
  selfIdDiv.innerHTML = `本机名: ${computerName}`;
})

ipcRenderer.on('launch-target', (e, launchTargetJson) => {
  launchTarget = JSON.parse(launchTargetJson);
  const launchTargetDiv = document.querySelector('#launch-target-div');
  for (const target in launchTarget) {
    const targetDiv = document.createElement('div');
    const targetDivDiv = document.createElement('div');
    const targetPrefix = document.createElement('img');
    const targetSpan = document.createElement('span');
    const targetDel = document.createElement('img')
    targetDiv.setAttribute('launch-target', launchTarget[target].friendlyName);
    targetDiv.classList.add('d-flex');

    targetPrefix.src = '../img/console.png';
    targetPrefix.alt = '- ';
    targetPrefix.classList.add('launch-target-list-img', 'launch-target-list-img-console');
    targetSpan.textContent = '  ' + launchTarget[target].friendlyName;
    targetDel.src = '../img/delete.png';
    targetDel.alt = 'Del';
    targetDel.classList.add('launch-target-list-img', 'align-self-center', 'cursor-pointer');
    targetDel.addEventListener('click', delLaunchTarget);

    targetDivDiv.setAttribute('style', 'flex: 1 1 auto');
    targetDivDiv.appendChild(targetPrefix);
    targetDivDiv.appendChild(targetSpan);

    targetDiv.appendChild(targetDivDiv);
    targetDiv.appendChild(targetDel);

    launchTargetDiv.appendChild(targetDiv);
  }
  if (launchTargetDiv.hasChildNodes()) {
    document.querySelector('#add-launch-target-prompt').classList.add('d-none');
  }
});

function delLaunchTarget(event) {
  event.preventDefault();
  const targetDiv = event.target.parentNode;
  const targetName = targetDiv.getAttribute('launch-target');
  delete launchTarget[targetName];
  targetDiv.parentNode.removeChild(targetDiv);
  if (!document.querySelector('#launch-target-div').hasChildNodes()) {
    document.querySelector('#add-launch-target-prompt').classList.remove('d-none');
  }
  backUpdateLaunchTarget();
}

function addLaunchTarget(event) {
  const modalInput = document.querySelector('#friendly-name-input');
  const modalPathPara = document.querySelector('#modal-path-para');
  const modalFeedBack = document.querySelector('#modal-input-feedback');
  modalInput.value = '';
  modalPathPara.textContent = '';
  modalFeedBack.textContent = '';
  $('#add-launch-target-modal').modal('show');
}

function saveAddedLaunchTarget() {
  let targetToAdd = {};
  targetToAdd.friendlyName = document.querySelector('#friendly-name-input').value.trim();
  targetToAdd.path = document.querySelector('#modal-path-para').textContent;
  if (targetToAdd.friendlyName && targetToAdd.path) {
    const targetDiv = document.createElement('div');
    const targetDivDiv = document.createElement('div');
    const targetPrefix = document.createElement('img');
    const targetSpan = document.createElement('span');
    const targetDel = document.createElement('img')

    targetDiv.setAttribute('launch-target', targetToAdd.friendlyName);
    targetDiv.classList.add('d-flex');

    targetPrefix.src = '../img/console.png';
    targetPrefix.alt = '- ';
    targetPrefix.classList.add('launch-target-list-img', 'launch-target-list-img-console');

    targetSpan.textContent = '  ' + targetToAdd.friendlyName;
    targetDel.src = '../img/delete.png';
    targetDel.alt = 'Del';
    targetDel.classList.add('launch-target-list-img', 'align-self-center', 'cursor-pointer');
    targetDel.addEventListener('click', delLaunchTarget);

    targetDivDiv.setAttribute('style', 'flex: 1 1 auto');
    targetDivDiv.appendChild(targetPrefix);
    targetDivDiv.appendChild(targetSpan);

    targetDiv.appendChild(targetDivDiv);
    targetDiv.appendChild(targetDel);

    const launchTargetDiv = document.querySelector('#launch-target-div');
    launchTargetDiv.appendChild(targetDiv);
    
    const prompt = document.querySelector('#add-launch-target-prompt');
    if (!prompt.classList.contains('d-none')) prompt.classList.add('d-none');
    launchTarget[targetToAdd.friendlyName] = targetToAdd;
    backUpdateLaunchTarget();
    $('#add-launch-target-modal').modal('hide');
  } else {
    const modalInputFeedback = document.querySelector('#modal-input-feedback');
    modalInputFeedback.textContent = '';
    modalInputFeedback.textContent = '请提供所需的所有信息'
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

const addLaunchTargetBtn = document.querySelector('#add-launch-target-btn');
addLaunchTargetBtn.addEventListener('click', addLaunchTarget);
const browseBtn = document.querySelector('#browse-btn');
browseBtn.addEventListener('click', requestToOpenDialog);
ipcRenderer.on('file-path', (e, filePath) => {
  const modalPathPara = document.querySelector('#modal-path-para');
  modalPathPara.textContent = filePath;
})

const repoPage = serverOffer.repoPage;
const donationPage = serverOffer.donationPage;
const guidePage = serverOffer.guidePage;
document.querySelector('#github-icon').addEventListener('click', shell.openExternal.bind(shell, repoPage));
document.querySelector('#support-icon').addEventListener('click', shell.openExternal.bind(shell, donationPage));
document.querySelector('#help-icon').addEventListener('click', shell.openExternal.bind(shell, guidePage));

function showNotifications() {
  const notifications = serverOffer.notifications;
  const notificationArea = document.querySelector('#notification-area');

  function showNotification(notification) {
    const noti = document.createElement('div');
    noti.innerHTML = notification.content;
    notificationArea.appendChild(noti);
  }
  for (noti of notifications) {
    const targetVersion = noti.target;
    switch (noti.mode) {
      case 'targetVersionArray':
        if (targetVersion.includes(pldVersion)) {
          showNotification(noti);
        }
        break;
      case 'toVersionIsOrLessThan':
        if (pldVersion <= targetVersion) {
          showNotification(noti);
        }
        break;
      case 'toVersionIsOrGreaterThan':
        if (pldVersion >= targetVersion) {
          showNotification(noti);
        }
        break;
      default:
        break;
    }
  }
  setCloseNotiBtns();
}

showNotifications();

$('[data-toggle="tooltip"]').tooltip();