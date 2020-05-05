const { ipcRenderer } = require('electron');
const qrcode = require('qrcode');

var canvas = document.getElementById('canvas');
var correspMobileClientLink = '';

ipcRenderer.on('refer', (e, msg) => {
    correspMobileClientLink = msg;
    var linkSpan = document.getElementById('link-span');
    linkSpan.innerText = correspMobileClientLink;
    qrcode.toCanvas(canvas, correspMobileClientLink, (error)=>{
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
  topInfoBarLink1.addEventListener('click', (e)=>{e.preventDefault();shell.openExternal(infoLink)});
}